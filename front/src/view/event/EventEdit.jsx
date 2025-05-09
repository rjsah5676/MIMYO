import axios from "axios";
import EventEditor from "./EventEditor";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

function EventEdit(){
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const { id } = useParams(); // URL에서 id를 가져옴
    
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const [isEditorLoaded, setIsEditorLoaded] = useState(false);

    const [eventInfo, setEventInfo] = useState({
        eventName: "",
        startDate: "",
        endDate: "",
        state: "NOCOUPON",
        content: "",
        redirectUrl: "",
        filename: ""
    });

    useEffect(()=>{
        if(!isEditorLoaded && eventInfo.content) {
            setIsEditorLoaded(true);
        }
    },[eventInfo.content])

    const [originalEventInfo, setOriginalEventInfo] = useState(null);

    useEffect(() => {
        if (id) {
            axios.get(`${serverIP.ip}/event/edit/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then((response) => {
                const startDate = response.data.startDate ? response.data.startDate.split(' ')[0] : "";
                const endDate = response.data.endDate ? response.data.endDate.split(' ')[0] : "";
    
                const fetchedData = {
                    eventName: response.data.eventName || "",
                    startDate: startDate,
                    endDate: endDate,
                    state: response.data.state || "NOCOUPON",
                    content: response.data.content || "",
                    redirectUrl: response.data.redirectUrl || "",
                    filename: response.data.filename || "",
                };
    
                setEventInfo(fetchedData);
                setOriginalEventInfo(fetchedData); // ← 이 부분 추가
            })
            .catch((error) => {
                console.error("Error fetching event data: ", error);
            });
        }
    }, [id]);

    // 시작날짜, 종료날짜, 이벤트유형에 대한 상태값을 처리하는 함수
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventInfo(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const preventDefault = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith("image/")) {
            setFile(droppedFile);
        }
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

    const validateForm = () => {
        if (eventInfo.eventName.length < 5) {
            alert("이벤트명은 최소 5자 이상이어야 합니다.");
            return false;
        }
        if (!eventInfo.startDate || !eventInfo.endDate) {
            alert("시작 날짜와 종료 날짜를 선택해야 합니다.");
            return false;
        }
        if (eventInfo.startDate > eventInfo.endDate) {
            alert("시작 날짜보다 종료 날짜가 빠를 수 없습니다.");
            return false;
        }
        if (!file && !eventInfo.filename) {
            alert("이벤트 썸네일을 등록해야 합니다.");
            return false;
        }
        return true;
    };

    const submitEventEdit = () => {
        if (!validateForm()) return;

        // 수정된 부분이 있는지 체크
        if (JSON.stringify(eventInfo) === JSON.stringify(originalEventInfo) && !file) {
            alert("수정된 내용이 없습니다. 변경 후 다시 시도해 주세요.");
            return;
        }


        let editFormData = new FormData();
        if(file){ // 새로 파일을 수정했으면
            editFormData.append("file", file);
        } else { // 기존 파일 그대로면
            editFormData.append("filename", eventInfo.filename);
        }
        editFormData.append("id", id);
        editFormData.append("eventName", eventInfo.eventName);
        editFormData.append("startDate", eventInfo.startDate);
        editFormData.append("endDate", eventInfo.endDate);
        editFormData.append("state", eventInfo.state);

        if(eventInfo.state === "NOCOUPON"){
            editFormData.append("content", eventInfo.content);
        }else{
            editFormData.append("redirectUrl", eventInfo.redirectUrl);
        }

        axios.post(`${serverIP.ip}/event/editForm`, editFormData, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(res => {
            if(res.data==="eventEditOk"){
                alert("이벤트 수정이 완료되었습니다.");
                navigate("/event");
            }
        })
        .catch(err => console.error("이벤트 수정 실패:", err));
    }

    return(
        <div style={{ paddingTop: "150px" }}>
            <div className="event-write-container">
                <h2 className="event-write-title">이벤트 수정</h2>

                <label className="event-write-label">이벤트명</label>
                <input type="text" name="eventName" className="event-write-input" value={eventInfo.eventName} onChange={handleInputChange}/>

                <label className="event-write-label">시작 날짜</label>
                <input type="date" name="startDate" className="event-write-input" value={eventInfo.startDate} onChange={handleInputChange}/>

                <label className="event-write-label">종료 날짜</label>
                <input type="date" name="endDate" className="event-write-input" value={eventInfo.endDate} onChange={handleInputChange}/>

                <label className="event-write-label">이벤트 유형</label>
                <select name="state" className="event-write-select" value={eventInfo.state} style={{backgroundColor:'#ddd'}} disabled>
                    <option value="NOCOUPON">NOCOUPON</option>
                    <option value="COUPON">COUPON</option>
                </select>

                {eventInfo.state === "NOCOUPON" ? (
                    <>
                        <label className="event-write-label">이벤트 내용</label>
                        {isEditorLoaded &&
                            <EventEditor formData={eventInfo} setFormData={setEventInfo} />
                        }
                    </>
                ) : (
                    <>
                        <label className="event-write-label">리디렉트 URL</label>
                        <input type="text" name="redirectUrl" className="event-write-input" value={eventInfo.redirectUrl} onChange={handleInputChange} />
                    </>
                )}

                <div 
                    ref={dropZoneRef} 
                    onClick={() => fileInputRef.current.click()} 
                    onDrop={handleDrop} 
                    onDragOver={preventDefault} 
                    onDragEnter={preventDefault} 
                    className="event-write-file-upload">
                    {file ? (
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt="Thumbnail" 
                            className="event-write-thumbnail" 
                        />
                    ) : eventInfo.filename ? (
                        <img 
                            src={`${serverIP.ip}/uploads/event/${id}/${eventInfo.filename}`} 
                            alt="Thumbnail" 
                            className="event-write-thumbnail" 
                        />
                    ) : (
                        <span>썸네일 이미지를 선택하거나 드래그하세요</span>
                    )}
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
                        }} onClick={submitEventEdit} className="event-write-submit">이벤트 수정</button>
            </div>
        </div>
    );
}

export default EventEdit;