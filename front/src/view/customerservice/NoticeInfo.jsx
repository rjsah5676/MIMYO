import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import '../../css/view/noticeinfo.css';

function NoticeInfo() {
    const { id } = useParams();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [notice, setNotice] = useState(null);

    useEffect(() => {
        if(user)
        axios.get(`${serverIP.ip}/notice/${id}`, {
            headers: {
                Authorization: `Bearer ${user?.token}`
            }
        })
        .then(res => {
            setNotice(res.data);
        })
        .catch(err => {
            console.error("공지사항 상세 조회 실패:", err);
            alert("공지사항 정보를 불러오는 데 실패했습니다.");
        });
    }, [id]);

    const translateNoticeType = (type) => {
        switch (type) {
            case 'NOTIFICATION': return '공지';
            case 'CHECK': return '점검';
            case 'CAUTION': return '주의';
            case 'EVENT': return '발표';
            default: return type;
        }
    };
    const handleDelete = () => {
        if (window.confirm("이 공지사항을 삭제하시겠습니까?")) {
            axios.delete(`${serverIP.ip}/notice/deleteNotice/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(response => {
                alert("공지사항이 삭제되었습니다.");
                navigate('/customerservice/Notice');
            })
            .catch(err => {
                console.error("공지 삭제 실패:", err);
            });
        }
    };
    return (
        <>{ user && notice &&
        <div className="notice-info-container">
            <h2 className="notice-info-title">
                [{translateNoticeType(notice.state)}] {notice.noticeName}
            </h2>
            <div className="notice-info-meta">
                <span>{new Date(notice.writeDate).toLocaleString()}</span>
            </div>
            <div
                className="notice-info-content"
                dangerouslySetInnerHTML={{ __html: notice.content }}
            />
            {user?.user?.authority === 'ROLE_ADMIN' && (
                <div className="notice-info-admin-btns">
                <button
                    className="notice-edit-btn"
                    onClick={() => navigate(`/customerservice/noticeedit/${notice.id}`)}
                >
                    ✏️ 수정
                </button>
                <button
                    className="notice-delete-btn"
                    onClick={handleDelete}
                >
                    🗑️ 삭제
                </button>
            </div>
            )}
        </div>
}
        </>
    );
}
export default NoticeInfo;
