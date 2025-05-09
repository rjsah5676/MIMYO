import { useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import subMenuEditor from "./SubMenuEditor";

function SubMenuWrite() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subMenuName: "",
        startDate: "",
        endDate: "",
        subMenuCategory: "",
        //content: "",
        //redirectUrl: ""
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
        if (formData.subMenuName.length < 1) {
            alert("서브메뉴 이름은 최소 1자 이상이어야 합니다.");
            return false;
        }
        if (formData.subMenuCategory.length < 1) {
            alert("서브메뉴 카테고리는 최소 1자 이상이어야 합니다.");
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
            alert("서브메뉴 썸네일을 등록해야 합니다.");
            return false;
        }
        return true;
    };

    const submitSubMenu = () => {
        if (!validateForm()) return;

        let newFormData = new FormData();
        newFormData.append("file", file);
        newFormData.append("subMenuName", formData.subMenuName);
        newFormData.append("startDate", formData.startDate);
        newFormData.append("endDate", formData.endDate);
        newFormData.append("subMenuCategory", formData.subMenuCategory);

        axios.post(`${serverIP.ip}/submenu/write`, newFormData, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
            .then(res => {
                navigate("/submenu");
            })
            .catch(err => console.error("서브메뉴 등록 실패:", err));
    };

    return (
        <div style={{ paddingTop: '200px' }}>
            <div className="event-write-container">
                <h2 className="event-write-title">서브메뉴 등록</h2>

                <label className="event-write-label">서브메뉴 이름</label>
                <input type="text" name="subMenuName" className="event-write-input" value={formData.subMenuName} onChange={handleChange} />

                <label className="event-write-label">시작 날짜</label>
                <input type="date" name="startDate" className="event-write-input" value={formData.startDate} onChange={handleChange} />

                <label className="event-write-label">종료 날짜</label>
                <input type="date" name="endDate" className="event-write-input" value={formData.endDate} onChange={handleChange} />

                <label className="event-write-label">서브메뉴 카테고리</label>
                <input placeholder="Ex) 이벤트,대상,[상품1,상품2]"type="text" name="subMenuCategory" className="event-write-input" value={formData.subMenuCategory} onChange={handleChange} />

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
                    marginTop: '30px',
                    width: '100%',
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '5px'
                }} onClick={submitSubMenu} className="event-write-submit">서브메뉴 등록</button>
            </div>
        </div>
    );
}

export default SubMenuWrite;
