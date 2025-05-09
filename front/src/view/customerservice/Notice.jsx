import { useNavigate } from "react-router-dom";
import '../../css/view/notice.css';
import { useSelector } from "react-redux";
import axios from "axios";
import { useEffect, useState } from "react";

function Notice(){
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);
    const [noticeList, setNoticeList] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [keyword, setKeyword] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [selectedType, setSelectedType] = useState('ALL');
    const noticeTypes = ['ALL', 'NOTIFICATION', 'CHECK', 'CAUTION', 'EVENT'];

    const noticeAddClick = () => {
        navigate('/customerservice/noticewrite');
      }

      useEffect(() => {
        fetchNotices();
    }, [page, selectedType]);

    const fetchNotices = () => {
        const params = {
            keyword: keyword,
            page: page,
            size: size,
        };

        if (selectedType !== 'ALL') {
            params.state = selectedType;
        }

        axios.get(`${serverIP.ip}/notice/getNoticeList`, {
            params,
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            setNoticeList(res.data.noticeList);
            setTotalPages(Math.ceil(res.data.totalCount / size));
        })
        .catch(err => {
            console.error("공지사항 불러오기 실패:", err);
            alert("공지사항 목록을 불러오는 데 실패했습니다.");
        });
    };

    const translateNoticeType = (type) => {
        switch (type) {
            case 'ALL': return '전체';
            case 'NOTIFICATION': return '공지';
            case 'CHECK': return '점검';
            case 'CAUTION': return '주의';
            case 'EVENT': return '발표';
            default: return type;
        }
    };

    const isNewNotice = (writeDateStr) => {
        const writeDate = new Date(writeDateStr);
        const now = new Date();
        const diffHours = (now - writeDate) / (1000 * 60 * 60);
        return diffHours <= 24;
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            fetchNotices();
        }
    };

    const handleFilterClick = (type) => {
        setSelectedType(type);
        setPage(0);
    };

    return (
        <div className="notice-container">
            <div className="notice-header">
                <div className="notice-search-bar">
                    <input
                    type="text"
                    placeholder="검색어를 입력해주세요."
                    className="notice-search-input"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    />
                    <button className="notice-search-btn" onClick={() => {
                    setPage(0);
                    fetchNotices();
                    }}>
                    <svg style={{ paddingTop: '3px' }} className='search-icon' width="27" height="27" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="10" cy="10" r="7" stroke="black" strokeWidth="2" />
                                        <line x1="15" y1="15" x2="22" y2="22" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                    </svg></button>
                </div>
                {user && user.user.authority=='ROLE_ADMIN' && (
                    <button className="notice-add-btn" onClick={noticeAddClick}>
                    📝공지사항 등록
                    </button>
                )}
            </div>

            <div className="notice-filter">
                {noticeTypes.map(type => (
                    <button
                        key={type}
                        className={`notice-filter-btn ${selectedType === type ? 'active' : ''}`}
                        onClick={() => handleFilterClick(type)}
                    >
                        {translateNoticeType(type)}
                    </button>
                ))}
            </div>

            <table className="notice-table">
                <tbody>
                    {noticeList.map((notice, index) => (
                        <tr
                        key={notice.id}
                        className="notice-item"
                        onClick={() => navigate(`/customerservice/notice/${notice.id}`)}
                        style={{ cursor: 'pointer' }}
                        >
                             <td className="notice-title">[{translateNoticeType(notice.state)}]  {notice.noticeName}
                             {isNewNotice(notice.writeDate) && <span className="new-badge">NEW</span>}
                             </td>
                             <td className="notice-date">{new Date(notice.writeDate).toLocaleDateString()}</td>
                         </tr>
                   ))}
                </tbody>
            </table>

            <div className="notice-pagination">
                <button
                    className="notice-page-arrow"
                    onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                >
                    &lt;
                </button>

                {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                        key={idx}
                        className={`notice-page-number ${page === idx ? 'active' : ''}`}
                        onClick={() => setPage(idx)}
                    >
                        {idx + 1}
                    </button>
                ))}
                <button
                    className="notice-page-arrow"
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                    disabled={page === totalPages - 1}
                
                    >
                    &gt;
                </button>
            </div>
        </div>
    );
}
export default Notice;