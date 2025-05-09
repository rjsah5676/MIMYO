import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import NoticeEditor from "./NoticeEditor";
import '../../css/view/noticewrite.css';

function NoticeEdit() {
    const { id } = useParams();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        noticeName: "",
        noticeState: "NOTIFICATION",
        content: "",
    });

    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!user) return;

        axios.get(`${serverIP.ip}/notice/${id}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            const notice = res.data;
            setFormData({
                noticeName: notice.noticeName,
                noticeState: notice.state,
                content: notice.content
            });
            setLoading(false);
        })
        .catch(err => {
            console.error("공지사항 데이터 로딩 실패:", err);
            alert("공지사항을 불러오지 못했습니다.");
            navigate(-1);
        });
    }, [id, serverIP, user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith("image/")) {
            setFile(selectedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    const submitNotice = () => {
        axios.put(`${serverIP.ip}/notice/update/${id}`, {
            noticeName: formData.noticeName,
            state: formData.noticeState,
            content: formData.content
          }, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            alert("공지사항이 수정되었습니다.");
            navigate("/customerservice/Notice");
        })
        .catch(err => {
            console.error("공지사항 수정 실패:", err);
            alert("수정에 실패했습니다.");
        });
    };

    if (loading) return <div>불러오는 중...</div>;

    return (
        <div className="notice-write-container">
            <h2 className="notice-write-title">공지사항 수정</h2>

            <label className="notice-write-label">공지사항 제목</label>
            <input
                type="text"
                name="noticeName"
                className="notice-write-input"
                value={formData.noticeName}
                onChange={handleChange}
            />

            <label className="event-write-label">공지 유형</label>
            <select
                name="noticeState"
                className="notice-write-select"
                value={formData.noticeState}
                onChange={handleChange}
            >
                <option value="NOTIFICATION">공지</option>
                <option value="CHECK">점검</option>
                <option value="CAUTION">주의</option>
                <option value="EVENT">발표</option>
            </select>

            <label className="notice-write-label">공지사항 내용</label>
            <NoticeEditor formData={formData} setFormData={setFormData} />

            {file && (
                <button className="notice-write-remove-file" onClick={removeFile}>
                    삭제
                </button>
            )}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
            />

            <button
                style={{
                    marginTop: '30px',
                    width: '100%',
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '5px'
                }}
                onClick={submitNotice}
                className="notice-write-submit"
            >
                공지사항 수정
            </button>
        </div>
    );
}

export default NoticeEdit;
