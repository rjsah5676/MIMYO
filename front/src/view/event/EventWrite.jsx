import { useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EventEditor from "./EventEditor";

function EventWrite() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        eventName: "",
        startDate: "",
        endDate: "",
        eventState: "NOCOUPON",
        content: "",
        redirectUrl: ""
    });

    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

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

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith("image/")) {
            setFile(droppedFile);
        }
    };

    const preventDefault = (e) => {
        e.preventDefault();
    };

    const validateForm = () => {
        if (formData.eventName.length < 5) {
            alert("이벤트명은 최소 5자 이상이어야 합니다.");
            return false;
        }
        if (!formData.startDate || !formData.endDate) {
            alert("시작 날짜와 종료 날짜를 선택해야 합니다.");
            return false;
        }
        if (formData.startDate > formData.endDate) {
            alert("시작 날짜보다 종료 날짜가 빠를 수 없습니다.");
            return false;
        }
        if (!file) {
            alert("이벤트 썸네일을 등록해야 합니다.");
            return false;
        }
        return true;
    };

    const submitEvent = () => {
        if (!validateForm()) return;

        let newFormData = new FormData();
        newFormData.append("file", file);
        newFormData.append("eventName", formData.eventName);
        newFormData.append("startDate", formData.startDate);
        newFormData.append("endDate", formData.endDate);
        newFormData.append("state", formData.eventState);

        if (formData.eventState === "NOCOUPON") {
            newFormData.append("content", formData.content);
        } else {
            newFormData.append("redirectUrl", formData.redirectUrl);
        }

        axios.post(`${serverIP.ip}/event/write`, newFormData, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            navigate("/event");
        })
        .catch(err => console.error("이벤트 등록 실패:", err));
    };

    return (
        <div style={{paddingTop:'200px'}}>
        <div className="event-write-container">
            <h2 className="event-write-title">이벤트 등록</h2>

            <label className="event-write-label">이벤트명</label>
            <input type="text" name="eventName" className="event-write-input" value={formData.eventName} onChange={handleChange} />

            <label className="event-write-label">시작 날짜</label>
            <input type="date" name="startDate" className="event-write-input" value={formData.startDate} onChange={handleChange} />

            <label className="event-write-label">종료 날짜</label>
            <input type="date" name="endDate" className="event-write-input" value={formData.endDate} onChange={handleChange} />

            <label className="event-write-label">이벤트 유형</label>
            <select name="eventState" className="event-write-select" value={formData.eventState} onChange={handleChange}>
                <option value="NOCOUPON">NOCOUPON</option>
                <option value="COUPON">COUPON</option>
            </select>

            {formData.eventState === "NOCOUPON" ? (
                <>
                    <label className="event-write-label">이벤트 내용</label>
                    <EventEditor formData={formData} setFormData={setFormData} />
                </>
            ) : (
                <>
                    <label className="event-write-label">리디렉트 URL</label>
                    <input type="text" name="redirectUrl" className="event-write-input" value={formData.redirectUrl} onChange={handleChange} />
                </>
            )}

            <div 
                ref={dropZoneRef} 
                onClick={() => fileInputRef.current.click()} 
                onDrop={handleDrop} 
                onDragOver={preventDefault} 
                onDragEnter={preventDefault} 
                className="event-write-file-upload">
                {file ? <img src={URL.createObjectURL(file)} alt="Thumbnail" className="event-write-thumbnail" /> : "썸네일 이미지를 선택하거나 드래그하세요"}
            </div>
            {file && <button className="event-write-remove-file" onClick={removeFile}>삭제</button>}
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
                    }} onClick={submitEvent} className="event-write-submit">이벤트 등록</button>
        </div>
        </div>
    );
}

export default EventWrite;
