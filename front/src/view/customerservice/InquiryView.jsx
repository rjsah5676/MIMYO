import { useParams, Link, useNavigate } from 'react-router-dom';
import '../../css/view/inquiryview.css';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function InquiryView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inquiry, setInquiry] = useState(null);
    const [inquiryImages, setInquiryImages] = useState([]);
    const [adminResponse, setAdminResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [responseText, setResponseText] = useState('');

    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);

    const isAdmin = user?.user?.authority != null && String(user.user.authority) === 'ROLE_ADMIN';
    const [isAuthor, setIsAuthor] = useState(false);

    useEffect(() => {
        getInquiryView();
    }, [id, serverIP, user]);

    useEffect(() => {
        if (inquiry && user && user.user) {
            setIsAuthor(inquiry.user?.id === user.user.id);
        } else {
            setIsAuthor(false);
        }
    }, [inquiry, user]);

    function getInquiryView() {
        if (!user || !serverIP.ip) {
            setError("로그인");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);

        axios.get(`${serverIP.ip}/inquiry/inquiryView/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(response => {
            if (response.data && response.data.inquiry) {
                setInquiry(response.data.inquiry);

                if (Array.isArray(response.data.inquiry.images)) {
                    const images = response.data.inquiry.images.map(img => ({
                        id: img.id,
                        filename: img.filename
                    }));
                    setInquiryImages(images);
                } else {
                    setInquiryImages([]);
                }
                setAdminResponse(response.data.response || null);
            }
            setIsLoading(false);
        })
        .catch(err => {
            console.error(err);
        });
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) { return '-'; }
            return date.toLocaleString('sv-SE').slice(0, 16).replace('T', ' ');
        } catch (e) { console.error("날짜 포맷팅 오류:", e); return '-'; }
    };

    const translateInquiryType = (type) => {
        switch (type) {
            case 'account': return '계정';
            case 'delivery': return '배송';
            case 'payment': return '결제';
            case 'refund': return '환불/교환';
            case 'coupon': return '쿠폰/이벤트';
            case 'etc': return '기타';
        }
    };

    const handleDelete = () => {
        if (window.confirm("문의를 삭제하시겠습니까?")) {
            axios.delete(`${serverIP.ip}/inquiry/deleteInquiry/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(response => {
                alert("문의가 삭제되었습니다.");
                navigate('/mypage/inquiries');
            })
            .catch(err => {
                console.error("문의 삭제 실패:", err);
            });
        }
    };

    const handleSubmitResponse = (event) => {
        event.preventDefault();

        if (!responseText.trim()) {
            alert("답변 내용을 입력해주세요.");
            return;
        }

        

        const payload = {
            inquiryId: parseInt(id, 10),
            content: responseText.trim()
        };

        const responseEndpoint = `${serverIP.ip}/inquiry/inquiryResponse`;

        axios.post(responseEndpoint, payload, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(response => {
            alert("답변이 등록되었습니다.");
            setResponseText('');
            getInquiryView();
        })
        .catch(err => {
            console.error(err);
        });
    }

    if (isLoading) {
        return <div className="inquiryView-container loading"></div>;
    }
    return (
        <div className="inquiryView-container">
            <h1>문의 상세</h1>

            <div className="inquiry-details">
                <dl>
                    <dt>문의 번호</dt>
                    <dd>{inquiry.id}</dd>
                    <dt>작성일</dt>
                    <dd>{formatDate(inquiry.inquiryWritedate)}</dd>
                    <dt>문의 유형</dt>
                    <dd>{translateInquiryType(inquiry.inquiryType)}</dd>
                    <dt>제목</dt>
                    <dd>{inquiry.inquirySubject}</dd>
                    <dt>내용</dt>
                    <dd className="inquiry-content">{inquiry.inquiryContent}</dd>
                </dl>
            </div>

            {inquiryImages.length > 0 && (
                <div className="inquiry-attachments">
                    <div className="inquiry-images-container">
                        {inquiryImages.map((image) => (
                            <div key={image.id || image.filename} className="inquiry-image-item">
                                <img
                                    src={`${serverIP.ip}/uploads/inquiry/${inquiry.id}/${image.filename}`}
                                    alt={`첨부 사진 ${image.filename}`}
                                    className="inquiry-image"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
             <div className="button-container">
                {!adminResponse && (
                    <>
                        <button onClick={handleDelete} className="delete-button">삭제</button>
                    </>
                )}
            </div>

            <div className="admin-response-section">
                <h2>답변 내용</h2>
                {adminResponse ? (
                    <div className="admin-response-details">
                        <dl>
                            <dt>답변 일시</dt>
                            <dd>{formatDate(adminResponse.responseWritedate)}</dd>
                            <dt>답변 내용</dt>
                            <dd className="response-content">{adminResponse.responseContent}</dd>
                        </dl>
                    </div>
                     ) : isAdmin ? (
                        <form className="admin-response-form" onSubmit={handleSubmitResponse}>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="답변을 입력하세요."
                                rows="5"
                                required
                            />
                            <button type="submit" className="action-button submit-response-button">
                                답변 등록
                            </button>
                        </form>
                    ) : (
                    <p className="no-response">아직 답변이 등록되지 않았습니다.</p>
                )}
            </div>
        </div>
    );
}

export default InquiryView;