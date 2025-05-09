import { useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NoticeEditor from "./NoticeEditor";
import '../../css/view/noticewrite.css';
function NoticeWrite(){
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        noticeName: "",
        noticeState: "NOTIFICATION",
        content: "",
    });

    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
        let newFormData = new FormData();
        newFormData.append("noticeName", formData.noticeName);
        newFormData.append("state", formData.noticeState);
        newFormData.append("content", formData.content);

        axios.post(`${serverIP.ip}/notice/write`, newFormData, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            navigate("/customerservice/Notice");
        })
        .catch(err => {
            alert(`등록 실패: ${err.response?.data?.message || err.message}`);
        });
    };

    return (
        <div>
        <div className="notice-write-container">
            <h2 className="notice-write-title">공지사항 등록</h2>

            <label className="notice-write-label">공지사항 제목</label>
            <input type="text" name="noticeName" className="notice-write-input" value={formData.noticeName} onChange={handleChange} />

            <label className="event-write-label">공지 유형</label>
            <select name="noticeState" className="notice-write-select" value={formData.noticeState} onChange={handleChange}>
                <option value="NOTIFICATION">공지</option>
                <option value="CHECK">점검</option>
                <option value="CAUTION">주의</option>
                <option value="EVENT">발표</option>
            </select>
                    <label className="notice-write-label">공지사항 내용</label>
                    <NoticeEditor formData={formData} setFormData={setFormData} />
            {file && <button className="notice-write-remove-file" onClick={removeFile}>삭제</button>}
            <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange} />

            <button style={{ 
                        marginTop:'30px',
                        width:'100%',
                        backgroundColor: '#333', 
                        color: 'white', 
                        padding: '10px 15px', 
                        border: 'none', 
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} onClick={submitNotice} className="notice-write-submit">공지사항 등록</button>
        </div>
        </div>
    );
}
export default NoticeWrite