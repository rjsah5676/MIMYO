import React, { useRef, useState, useEffect } from 'react';
import '../../css/view/InquiryWrite.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const MAX_CONTENT_LENGTH = 2000;
const MAX_FILES_COUNT = 5;

const InquiryWrite = () => {
    const serverIP = useSelector((state) => state.serverIP);
    const [inquirySubject, setInquirySubject] = useState('');
    const [inquiryType, setInquiryType] = useState('');
    const [inquiryContent, setInquiryContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [SuccessMessage,setSuccessMessage] = useState('');
    const [isSubmitting,setIsSubmitting] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);

    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
             navigate('/');
             setErrorMessage("로그인후 이용해주세요.");
        } else {
             console.log("User details:", user);
        }
    }, [user, navigate]);

    const handleTitleChange = (event) => {
        setInquirySubject(event.target.value);
    };

    const handleTypeChange = (event) => {
        setInquiryType(event.target.value);
    };

    const handleContentChange = (event) => {
        const content = event.target.value;
        if (content.length <= MAX_CONTENT_LENGTH) {
            setInquiryContent(content);
        }
    };
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        setErrorMessage('');
        setSuccessMessage('');
        
        if (!user || !user.user || user.user.id === undefined || user.user.id === null) {
            setErrorMessage('로그인해주세요.');
            return;
       }
      
        if (!inquirySubject.trim()) {
            setErrorMessage('문의제목을 입력해주세요.');
            scrollToTop();
            return;
        }
        if (!inquiryType) {
            setErrorMessage('문의유형을 선택해주세요.');
            scrollToTop();
            return;
        }
        if (!inquiryContent.trim()) {
            setErrorMessage('문의내용을 입력해주세요.');
            scrollToTop();
            return;
        }
        if (!agreeToTerms) {
            setErrorMessage('개인정보 수집 및 이용에 동의해주세요.');
            scrollToTop();
            return;
        }
        setIsSubmitting(true);
        
        const formData = new FormData();
    
        formData.append('inquiry_subject', inquirySubject);
        formData.append('inquiry_type', inquiryType);
        formData.append('inquiry_content', inquiryContent);
        formData.append('user_id', user.user.id);
        if (files.length > 0) {
            files.forEach((file) => {
                
                formData.append('inquiry_image', file, file.name);
            });
        }
        axios.post(`${serverIP.ip}/inquiry/inquiryWriteOk`, formData,{
            headers:{
                Authorization: `Bearer ${user.token}`
            }
        })
        .then(function(response){
            if (response.data === "ok") {
                setSuccessMessage('문의가 등록되었습니다.');
                setInquirySubject('');
                setInquiryType('');
                setInquiryContent('');
                setFiles([]);
                alert("문의가 등록되었습니다.");
                window.location.href = "/customerservice/faq";
        }else{
            setErrorMessage(response.data || '문의 등록실패');
            }
        })
        .catch(function(error){
            console.log(error);
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };


    const handleCancel = () => {
        window.history.back();
    };

    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const changeFile = (e) => {
        handleFiles(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (selectedFiles) => {
        setErrorMessage('');
        const newFiles = Array.from(selectedFiles);
        const imageFiles = newFiles.filter(file => file.type.startsWith("image/"));

        if (imageFiles.length !== newFiles.length) {
            setErrorMessage("이미지 파일만 업로드 가능합니다.");
            return;
        }

        const totalFiles = files.length + imageFiles.length;
        if (totalFiles > MAX_FILES_COUNT) {
            setErrorMessage(`최대 ${MAX_FILES_COUNT}개의 파일만 첨부할 수 있습니다.`);
             return;
        }

        setFiles(prevFiles => [...prevFiles, ...imageFiles]);
    };

    const removeFile = (fileToRemove) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };
    
    return (
        <div className="inquiry-form-container">
            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <h1 className='main-title'>1:1 문의하기</h1>
                <div className="form-group">
                    <label htmlFor="inquiry-subject" className="form-label">문의제목</label>
                    <input
                        type="text"
                        id="inquiry-subject"
                        name="inquiry_subject"
                        className="form-control"
                        placeholder="제목을 입력해주세요."
                        value={inquirySubject}
                        onChange={handleTitleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="inquiry-type" className="form-label">문의유형</label>
                    <select
                        id="inquiry-type"
                        name="inquiry_type"
                        className="form-control"
                        value={inquiryType}
                        onChange={handleTypeChange}
                        required
                    >
                        <option value="" disabled>문의유형 선택</option>
                        <option value="account">계정</option>
                        <option value="delivery">배송</option>
                        <option value="payment">결제</option>
                        <option value="refund">환불/교환</option>
                        <option value="coupon">쿠폰/이벤트</option>
                        <option value="etc">기타</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="inquiry-content" className="form-label">문의내용</label>
                    <textarea
                        id="inquiry-content"
                        name="inquiry_content"
                        className="form-control textarea-content"
                        rows="10"
                        placeholder="문의 내용을 입력해주세요."
                        value={inquiryContent}
                        onChange={handleContentChange}
                        maxLength={MAX_CONTENT_LENGTH}
                        required
                    ></textarea>
                    <div id="char-counter" className="char-counter">
                        {inquiryContent.length}/{MAX_CONTENT_LENGTH}자
                    </div>
                </div>
                <div 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={handleDrop}
                style={{
                    width: '100%', 
                    height: '150px', 
                    border: '2px dashed #ccc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '10px',
                    cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current.click()}
            >
                이미지를 드래그/선택하여 1~5개 첨부해주세요
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="file"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={changeFile}
                />
                <button 
                    type="button"
                    style={{ 
                        backgroundColor: '#333', 
                        color: 'white', 
                        padding: '10px 15px', 
                        border: 'none', 
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} 
                    onClick={() => fileInputRef.current.click()}
                >
                    이미지 선택
                </button>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {files.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <img 
                            src={URL.createObjectURL(file)} 
                            alt={file.name} 
                            style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                borderRadius: '8px', 
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }} 
                        />
                        <span 
                            style={{
                                position: 'absolute', 
                                top: '-5px', 
                                right: '-5px', 
                                backgroundColor: '#555', 
                                color: 'white', 
                                width: '20px', 
                                height: '20px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '50%', 
                                fontSize: '14px', 
                                cursor: 'pointer'
                            }}
                            onClick={() => removeFile(file)}
                        >
                            ✕
                        </span>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                        <input
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            style={{ marginRight: '8px' }}
                        />
                        개인정보 수집 및 이용에 동의합니다. (문의 처리 목적 외에는 사용되지 않습니다.)
                    </label>
                </div>
                <div className="button-group">
                    <button type="submit" className="btn btn-submit" onClick={handleSubmit}>
                        등록하기
                    </button>
                    <button type="button" className="btn btn-cancel" onClick={handleCancel} disabled={isSubmitting}>
                        취소하기
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InquiryWrite;