import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../../store/modalSlice";
import '../../css/view/admininquiry.css';

function AdminInquiry() {
    const loc = useLocation();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const modal = useSelector((state) => state.modal);
    const dispatch = useDispatch();

    const [inquiriesNoAnswer, setInquiriesNoAnswer] = useState([]);
    const [totalPageNoAnswer, setTotalPageNoAnswer] = useState(1);
    const [pageNumberNoAnswer, setPageNumberNoAnswer] = useState([]);
    const [nowPageNoAnswer, setNowPageNoAnswer] = useState(1);
    const [totalRecordNoAnswer, setTotalRecordNoAnswer] = useState(0);
    const [filterTypeNoAnswer, setFilterTypeNoAnswer] = useState('');

    const [inquiriesAnswer, setInquiriesAnswer] = useState([]);
    const [totalPageAnswer, setTotalPageAnswer] = useState(1);
    const [pageNumberAnswer, setPageNumberAnswer] = useState([]);
    const [nowPageAnswer, setNowPageAnswer] = useState(1);
    const [totalRecordAnswer, setTotalRecordAnswer] = useState(0);
    const [filterTypeAnswer, setFilterTypeAnswer] = useState('');
    const navigate = useNavigate();

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
    const inquiryTypeKeys = [
        "account",
        "delivery",
        "payment",
        "refund",
        "coupon",
        "etc",
    ];

    const getInquiryList = (status, page, typeFilter) => {
        if (!user || !user.token) {
            console.log("User not authenticated");
            return;
        }

        axios.get(`${serverIP.ip}/admin/inquiryList`, {
            headers: { Authorization: `Bearer ${user.token}` },
            params: {
                status: status,
                nowPage: page,
                inquiryType: typeFilter || ''
            }
        })
        .then(response => {
            const { inquiryList, pvo } = response.data;
            const newPageNumbers = [];
            if (pvo && pvo.totalPage > 0) {
                 const pageBlockSize = 5;
                 const currentBlock = Math.ceil(pvo.nowPage / pageBlockSize);
                 const startPage = (currentBlock - 1) * pageBlockSize + 1;
                 const endPage = Math.min(startPage + pageBlockSize - 1, pvo.totalPage);

                for (let p = startPage; p <= endPage; p++) {
                     newPageNumbers.push(p);
                }
            }

            if (status === 'NOANSWER') {
                setInquiriesNoAnswer(inquiryList || []);
                setTotalPageNoAnswer(pvo?.totalPage || 1);
                setPageNumberNoAnswer(newPageNumbers);
                setNowPageNoAnswer(pvo?.nowPage || 1);
                setTotalRecordNoAnswer(pvo?.totalRecord || 0);
            } else if (status === 'ANSWER') {
                setInquiriesAnswer(inquiryList || []);
                setTotalPageAnswer(pvo?.totalPage || 1);
                setPageNumberAnswer(newPageNumbers);
                setNowPageAnswer(pvo?.nowPage || 1);
                setTotalRecordAnswer(pvo?.totalRecord || 0);
            }

            document.querySelectorAll(".inquiry-detail").forEach((det) => (det.style.display = "none"));
        })
        .catch(error => {
            console.error(`Error fetching ${status} inquiries:`, error);
            if (status === 'NOANSWER') {
                setInquiriesNoAnswer([]);
                setTotalRecordNoAnswer(0);
                setTotalPageNoAnswer(1);
                setPageNumberNoAnswer([]);
                setNowPageNoAnswer(1);
            } else {
                setInquiriesAnswer([]);
                setTotalRecordAnswer(0);
                setTotalPageAnswer(1);
                setPageNumberAnswer([]);
                setNowPageAnswer(1);
            }
        });
    };

    useEffect(() => {
        if (user) {
            getInquiryList('NOANSWER', 1, filterTypeNoAnswer);
            getInquiryList('ANSWER', 1, filterTypeAnswer);
        }
    }, [loc, user]);

    useEffect(() => {
        if(user) getInquiryList('NOANSWER', nowPageNoAnswer, filterTypeNoAnswer);
    }, [nowPageNoAnswer, filterTypeNoAnswer]);

    useEffect(() => {
        if(user) getInquiryList('ANSWER', nowPageAnswer, filterTypeAnswer);
    }, [nowPageAnswer, filterTypeAnswer]);

     useEffect(() => {
        if (modal.source === 'inquiryResponse' && !modal.isOpen && user) {
            getInquiryList('NOANSWER', nowPageNoAnswer, filterTypeNoAnswer);
            getInquiryList('ANSWER', nowPageAnswer, filterTypeAnswer);
        }
     }, [modal.isOpen, user]);

    const handleFilterChangeNoAnswer = (e) => {
        setFilterTypeNoAnswer(e.target.value);
        setNowPageNoAnswer(1);
    };

    const handleFilterChangeAnswer = (e) => {
        setFilterTypeAnswer(e.target.value);
        setNowPageAnswer(1);
    };

    const readInquiry = (id) => {
        const det = document.getElementById('inquiry-detail-' + id);
        if (det) {
            document.querySelectorAll(".inquiry-detail").forEach((otherDet) => {
                if (otherDet.id !== det.id) {
                    otherDet.style.display = 'none';
                }
            });
            det.style.display = det.style.display === 'block' ? 'none' : 'block';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        try {
             return new Intl.DateTimeFormat('ko-KR', options).format(new Date(dateString));
        } catch (e) {
             return dateString;
        }
    };
    const goInquiryView = (inquiryId) => {
        navigate(`/inquiry/inquiryview/${inquiryId}`);
    };

    const renderPagination = (statusType) => {
        const { nowPage, totalPage, pageNumber, setNowPageFunc } = (() => {
            if (statusType === 'NOANSWER') {
                return { nowPage: nowPageNoAnswer, totalPage: totalPageNoAnswer, pageNumber: pageNumberNoAnswer, setNowPageFunc: (p) => setNowPageNoAnswer(p) };
            } else {
                return { nowPage: nowPageAnswer, totalPage: totalPageAnswer, pageNumber: pageNumberAnswer, setNowPageFunc: (p) => setNowPageAnswer(p) };
            }
        })();

        if (!pageNumber || pageNumber.length === 0 || totalPage <= 1) return null;

         const pageBlockSize = 5;
         const currentBlock = Math.ceil(nowPage / pageBlockSize);
         const startPage = (currentBlock - 1) * pageBlockSize + 1;
         const endPageInBlock = Math.min(startPage + pageBlockSize - 1, totalPage);

        return (
            <ul className="admin-paging">
                 {startPage > 1 && (
                     <a className="page-prenext" onClick={() => setNowPageFunc(startPage - 1)}>
                         <li className="page-num">◀</li>
                     </a>
                 )}

                {pageNumber.map((pg) => {
                         const activeStyle = nowPage === pg ? 'page-num active' : 'page-num';
                         return (
                             <a onClick={() => setNowPageFunc(pg)} key={`${statusType}-${pg}`}>
                                 <li className={activeStyle}>{pg}</li>
                             </a>
                         );
                })}

                {endPageInBlock < totalPage && (
                    <a className="page-prenext" onClick={() => setNowPageFunc(endPageInBlock + 1)}>
                        <li className="page-num">▶</li>
                    </a>
                )}
            </ul>
        );
    };
    return (
        <div style={{ padding: '10px 20px' }}>
            <div className='inquiry-box'>
                <span className='inquiry-box-title'>📋답변 대기 문의</span>
                <div className='inquiry-filter'>
                    <div>총 {totalRecordNoAnswer} 건</div>
                    <div>
                        <select className="select-style" value={filterTypeNoAnswer} onChange={handleFilterChangeNoAnswer}>
                            <option value="">전체</option>
                            {inquiryTypeKeys.map(key => (
                                <option key={`filter-noanswer-${key}`} value={key}>
                                    {translateInquiryType(key)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <ul className='admin-list header'>
                    <li>번호</li>
                    <li>유형</li>
                    <li>제목</li>
                    <li>문의자</li>
                    <li>작성일</li>
                </ul>
                {inquiriesNoAnswer.length === 0 ? (
                    <div className='no-list'>답변 대기 중인 문의가 없습니다.</div>
                ) : (
                    inquiriesNoAnswer.map(item => (
                        <React.Fragment key={`noanswer-${item.id}`}>
                            <ul className='admin-list' onClick={() => readInquiry(item.id)} style={{ cursor: 'pointer' }}>
                                <li>{item.id}</li>
                                <li>{translateInquiryType(item.inquiryType)}</li>
                                <li>{item.inquirySubject}</li>
                                <li>{item.user?.username || 'N/A'}</li>
                                <li>{formatDate(item.inquiryWritedate)}</li>
                            </ul>
                            <div className='inquiry-detail' id={`inquiry-detail-${item.id}`}>
                                <div><span className="inquiry-detail-label">문의자:</span> {item.user?.username || 'N/A'}</div>
                                <div><span className="inquiry-detail-label">문의유형:</span>  {translateInquiryType(item.inquiryType)}</div>
                                <div><span className="inquiry-detail-label">작성일:</span> {formatDate(item.inquiryWritedate)}</div>
                                <div><span className="inquiry-detail-label">제목:</span> {item.inquirySubject}</div>
                                <div className="inquiry-detail-label">내용:</div>
                                <div className="inquiry-detail-content">{item.inquiryContent}</div>
                                <button
                                    className="inquiry-action-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        goInquiryView(item.id);
                                    }}
                                >
                                    상세보기 
                                </button>

                            </div>
                        </React.Fragment>
                    ))
                )}
                {renderPagination('NOANSWER')}
            </div>
                
            <div className='inquiry-box'>
                <span className='inquiry-box-title'>✅답변 완료 문의</span>
                 <div className='inquiry-filter'>
                    <div>총 {totalRecordAnswer} 건</div>
                    <div>
                        <select className="select-style" value={filterTypeAnswer} onChange={handleFilterChangeAnswer}>
                            <option value="">전체</option>
                            {inquiryTypeKeys.map(key => (
                                <option key={`filter-answer-${key}`} value={key}>
                                    {translateInquiryType(key)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <ul className='admin-list header'>
                     <li>번호</li>
                     <li>유형</li>
                     <li>제목</li>
                     <li>문의자</li>
                     <li>답변일</li>
                 </ul>
                 {inquiriesAnswer.length === 0 ? (
                     <div className='no-list'>답변 완료된 문의가 없습니다.</div>
                 ) : (
                     inquiriesAnswer.map(item => (
                         <React.Fragment key={`answer-${item.id}`}>
                             <ul className='admin-list' onClick={() => readInquiry(item.id)} style={{ cursor: 'pointer' }}>
                                 <li>{item.id}</li>
                                 <li>{translateInquiryType(item.inquiryType)}</li>
                                 <li>{item.inquirySubject}</li>
                                 <li>{item.user?.username || 'N/A'}</li>
                                 <li>{formatDate(item.response?.responseWritedate || item.inquiryWritedate)}</li>
                             </ul>
                             <div className='inquiry-detail' id={`inquiry-detail-${item.id}`}>
                                 <div><span className="inquiry-detail-label">문의자:</span> {item.user?.username || 'N/A'}</div>
                                 <div><span className="inquiry-detail-label">문의유형:</span> {translateInquiryType(item.inquiryType)}</div>
                                 <div><span className="inquiry-detail-label">작성일:</span> {formatDate(item.inquiryWritedate)}</div>
                                 <div><span className="inquiry-detail-label">제목:</span> {item.inquirySubject}</div>
                                 <div className="inquiry-detail-label">문의 내용:</div>
                                 <div className="inquiry-detail-content">{item.inquiryContent}</div>

                                 {item.response && (
                                     <div className="inquiry-detail-response">
                                         <div className="inquiry-detail-label">답변 내용:</div>
                                         <div className="inquiry-detail-content">{item.response.responseContent}</div>
                                         <div><span className="inquiry-detail-label">답변일:</span> {formatDate(item.response.responseWritedate)}</div>
                                     </div>
                                 )}
                             </div>
                         </React.Fragment>
                     ))
                 )}
                 {renderPagination('ANSWER')}
            </div>
        </div>
    );
}

export default AdminInquiry;