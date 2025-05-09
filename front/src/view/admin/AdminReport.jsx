import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../../store/modalSlice";

function AdminReport() {
    const loc = useLocation();
    const serverIP = useSelector((state) => { return state.serverIP });
    const user = useSelector((state) => state.auth.user);
    const modal = useSelector((state) => state.modal);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [totalPage, setTotalPage] = useState({
        readable: 1, processing: 1, complete: 1
    });
    const [pageNumber, setPageNumber] = useState({
        readable: [], processing: [], complete: []
    });

    const [report, setReport] = useState({
        readable: [], processing: [], complete: []
    })

    const [nowPage, setNowPage] = useState({
        readable: 1, processing: 1, complete: 1
    })

    const [totalRecord, setTotalRecord] = useState({
        readable: 1, processing: 1, complete: 1
    })

    const [sort, setSort] = useState({
        readable: '', processing: '', complete: ''
    })

    const [category, setCategory] = useState({
        readable: '', processing: '', complete: ''
    })

    const [searchWord, setSearchWord] = useState({
        readable: '', processing: '', complete: ''
    })

    const changeSort = (e) => {
        setSort({ ...sort, readable: e.target.value });
    }

    const changeCat = (e) => {
        setCategory({ ...category, readable: e.target.value });
    }

    const changeSearchWord = (e) => {
        setSearchWord({ ...searchWord, readable: e.target.value });
    }

    const changeSortPro = (e) => {
        setSort({ ...sort, processing: e.target.value })
    }

    const changeCatPro = (e) => {
        setCategory({ ...category, processing: e.target.value });
    }

    const changeSearchWordPro = (e) => {
        setSearchWord({ ...searchWord, processing: e.target.value });
    }

    const changeSortCom = (e) => {
        setSort({ ...sort, complete: e.target.value })
    }

    const changeCatCom = (e) => {
        setCategory({ ...category, complete: e.target.value });
    }

    const changeSearchWordCom = (e) => {
        setSearchWord({ ...searchWord, complete: e.target.value });
    }
    useEffect(() => {
        getReportList('READABLE', nowPage.readable);
        getReportList('PROCESSING', nowPage.processing);
        getReportList('COMPLETE', nowPage.complete);
    }, [loc])

    useEffect(() => {
        getReportList('READABLE', nowPage.readable);
        getReportList('PROCESSING', nowPage.processing);
        getReportList('COMPLETE', nowPage.complete);
        const det = document.querySelectorAll(".report-detail");
        if (det)
            det.forEach((det) => (det.style.display = "none"));
    }, [nowPage.readable, nowPage.processing, nowPage.complete])

    useEffect(() => {
        getReportList('READABLE', nowPage.readable);
        getReportList('PROCESSING', nowPage.processing);
        getReportList('COMPLETE', nowPage.complete);
        const det = document.querySelectorAll(".report-detail");
        if (det)
            det.forEach((det) => (det.style.display = "none"));
    }, [
        searchWord.readable, category.readable, sort.readable,
        searchWord.processing, category.processing, sort.processing,
        searchWord.complete, category.complete, sort.complete,
        modal
    ]);

    const getReportList = (state, page) => {
        let cat = '';
        let sw = '';
        let srt = '';
        if (state == 'READABLE') {
            cat = category.readable;
            sw = searchWord.readable;
            srt = sort.readable;
        }
        else if (state == 'PROCESSING') {
            cat = category.processing;
            sw = searchWord.processing;
            srt = sort.processing;
        }
        else if (state == 'COMPLETE') {
            cat = category.complete;
            sw = searchWord.complete;
            srt = sort.complete;
        }
        if (user)
            axios.get(`${serverIP.ip}/admin/reportList?state=${state}&nowPage=${page}&category=${cat}&sort=${srt}&searchWord=${sw}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    const newPageNumbers = [];
                    if (state == 'READABLE') {
                        for (let p = res.data.pvo.startPageNum; p < res.data.pvo.startPageNum + res.data.pvo.onePageCount; p++) {
                            if (p <= res.data.pvo.totalPage) {
                                newPageNumbers.push(p);
                            }
                        }
                        setPageNumber(prev => ({ ...prev, readable: newPageNumbers }));
                        setTotalPage(prev => ({ ...prev, readable: res.data.pvo.totalPage }));
                        setReport(prev => ({ ...prev, readable: res.data.reportList }));
                        setNowPage(prev => ({ ...prev, readable: res.data.pvo.nowPage }));
                        setTotalRecord(prev => ({ ...prev, readable: res.data.pvo.totalRecord }));
                    }
                    if (state == 'PROCESSING') {
                        for (let p = res.data.pvo.startPageNum; p < res.data.pvo.startPageNum + res.data.pvo.onePageCount; p++) {
                            if (p <= res.data.pvo.totalPage) {
                                newPageNumbers.push(p);
                            }
                        }
                        setPageNumber(prev => ({ ...prev, processing: newPageNumbers }));
                        setTotalPage(prev => ({ ...prev, processing: res.data.pvo.totalPage }));
                        setReport(prev => ({ ...prev, processing: res.data.reportList }));
                        setNowPage(prev => ({ ...prev, processing: res.data.pvo.nowPage }));
                        setTotalRecord(prev => ({ ...prev, processing: res.data.pvo.totalRecord }));
                    }
                    if (state == 'COMPLETE') {
                        for (let p = res.data.pvo.startPageNum; p < res.data.pvo.startPageNum + res.data.pvo.onePageCount; p++) {
                            if (p <= res.data.pvo.totalPage) {
                                newPageNumbers.push(p);
                            }
                        }
                        setPageNumber(prev => ({ ...prev, complete: newPageNumbers }));
                        setTotalPage(prev => ({ ...prev, complete: res.data.pvo.totalPage }));
                        setReport(prev => ({ ...prev, complete: res.data.reportList }));
                        setNowPage(prev => ({ ...prev, complete: res.data.pvo.nowPage }));
                        setTotalRecord(prev => ({ ...prev, complete: res.data.pvo.totalRecord }));
                    }
                })
                .catch(e => console.log(e));
    }

    const readReport = (id) => {
        const det = document.getElementById('report-detail-' + id);
        if (det)
            det.style.display = det.style.display === 'inline-block' ? 'none' : 'inline-block';
    }

    const changeState = (state, id) => {
        axios.get(`${serverIP.ip}/admin/changeState?state=${state}&id=${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
                getReportList('READABLE', nowPage.readable);
                getReportList('PROCESSING', nowPage.readable);
                getReportList('COMPLETE', nowPage.complete);
                const det = document.querySelectorAll(".report-detail");
                if (det)
                    det.forEach((det) => (det.style.display = "none"));
            })
            .catch(err => console.log(err));
    }

    const approvingReport = (id, toId, fromId, sort, sortId, toName, toUrl) => {
        if (!modal.isOpen) dispatch(setModal({ isOpen: true, selected: 'reportapprove', info: { reportId: id, toId: toId, fromId: fromId, sort: sort, sortId: sortId, toName: toName, toUrl: toUrl } }))
        else if (modal.selected == 'reportapprove') {
            dispatch(setModal({ isOpen: false, selected: 'reportapprove' }));
        }
    }

    const delReport = (id) => {
        axios.get(`${serverIP.ip}/admin/delReport?id=${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
                getReportList('READABLE', nowPage.readable);
                getReportList('PROCESSING', nowPage.readable);
                getReportList('COMPLETE', nowPage.complete);
                const det = document.querySelectorAll(".report-detail");
                if (det)
                    det.forEach((det) => (det.style.display = "none"));
            })
            .catch(err => console.log(err));
    }

    const inputStyle = {
        width: '140px',
        padding: '7px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '14px',
        marginRight: '10px'
    };
    const inputStyle2 = {
        width: '200px',
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '14px',
    };

    const moveProductInfo = (item) => {
        if (user) {
            axios.get(`${serverIP.ip}/basket/getProduct?productId=${item}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            })
                .then(res => {
                    navigate('/product/info', {
                        state: {
                            product: res.data
                        }
                    });
                })
                .catch(err => console.log(err));
        }
    }

    function getSortText(sortValue) {
        switch (sortValue) {
            case 'PRODUCT':
                return '상품';
            case 'USER':
                return '사용자';
            case 'REVIEW':
                return '리뷰';
            default:
                return sortValue;
        }
    }

    return (
        <div style={{ paddingLeft: '10px' }}>
            <div className='report-box'>
                <span style={{ paddingLeft: '0px', fontSize: '17px', fontWeight: '600', color: '#555' }}>📢신고 처리 전</span>
                <div className='report-search'>
                    <div>총 신고 수: {totalRecord.readable}</div>
                    <div><select style={inputStyle} onChange={changeSort}>
                        <option value="">전체</option>
                        <option value="USER">사용자</option>
                        <option value="PRODUCT">제품</option>
                        <option value="REVIEW">리뷰</option>
                    </select>
                        <select style={inputStyle} onChange={changeCat}>
                            <option value="">전체</option>
                            <option value="욕설 및 비방">욕설 및 비방</option>
                            <option value="부적절한 컨텐츠">부적절한 컨텐츠</option>
                            <option value="허위 정보 및 사기">허위 정보 및 사기</option>
                            <option value="스팸 및 광고">스팸 및 광고</option>
                            <option value="기타">기타</option>
                        </select><input style={inputStyle2} value={searchWord.readable} onChange={changeSearchWord} placeholder="번호/내용/신고자/피신고자" /></div>
                </div>
                <ul className='admin-report-list' style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                    <li>
                        번호
                    </li>
                    <li>
                        구분
                    </li>
                    <li>
                        유형
                    </li>
                    <li>
                        내용
                    </li>
                    <li>
                        신고자
                    </li>
                    <li>
                        피신고자
                    </li>
                </ul>
                {
                    report.readable.length == 0 ?
                        <div className='no-list'>검색 결과가 없습니다.</div> :
                        report.readable.map(item => {
                            return (<><ul className='admin-report-list'>
                                <li>
                                    {item.id}
                                </li>
                                <li>
                                    {getSortText(item.sort)}
                                </li>
                                <li>
                                    {item.reportType}
                                </li>
                                <li onClick={() => readReport(item.id)} style={{ cursor: 'pointer' }}>
                                    {item.comment}
                                </li>
                                <li className='message-who' id={`mgx-${item.userFrom.id}`} style={{ cursor: 'pointer' }}>
                                    {item.userFrom.username}
                                </li>
                                {item.sort === 'USER' ? (
                                    <li className='message-who' id={`mgx-${item.reportUser.id}`} style={{ cursor: 'pointer' }}>
                                        {item.reportUser.username}
                                    </li>
                                ) : (
                                    <li className='message-who' onClick={() => moveProductInfo(item.sortId)} style={{ cursor: 'pointer' }}>
                                        '{item.reportUser.username}'의 상품
                                    </li>)}
                            </ul>
                                <div className='report-detail' id={'report-detail-' + item.id} style={{ display: 'none' }}>
                                    <div className='report-date'>신고일: {item.createDate}</div>
                                    <div className='report-comment'>내용: </div>
                                    <div className='cm-rc'>{item.comment}</div>
                                    <button style={{
                                        backgroundColor: '#222222',
                                        color: '#fff',
                                        padding: '7px 15px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        float: 'right',
                                        transition: 'background-color 0.3s ease',
                                        fontSize: '14px',
                                        marginTop: '20px'
                                    }} onClick={() => changeState('PROCESSING', item.id)}>신고 처리</button>
                                </div></>
                            )
                        })
                }
                <ul className="admin-paging">
                    {nowPage.readable > 1 && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, readable: nowPage.readable - 1 }))}>
                            <li className="page-num">◀</li>
                        </a>
                    )}
                    {pageNumber.readable.map((pg) => {
                        const activeStyle = nowPage.readable === pg ? 'page-num active' : 'page-num';
                        return (
                            <a className="page-num" onClick={() => setNowPage(prev => ({ ...prev, readable: pg }))} key={pg}>
                                <li className={activeStyle}>{pg}</li>
                            </a>
                        );
                    })}
                    {nowPage.readable < totalPage.readable && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, readable: nowPage.readable + 1 }))}>
                            <li className="page-num">▶</li>
                        </a>
                    )}
                </ul>
            </div>

            <div className='report-box'>
                <span style={{ paddingLeft: '0px', fontSize: '17px', fontWeight: '600', color: '#555' }}>📢신고 처리 중</span>
                <div className='report-search'>
                    <div>총 신고 수: {totalRecord.processing}</div>
                    <div><select style={inputStyle} onChange={changeSortPro}>
                        <option value="">전체</option>
                        <option value="USER">사용자</option>
                        <option value="PRODUCT">제품</option>
                        <option value="REVIEW">리뷰</option>
                    </select>
                        <select style={inputStyle} onChange={changeCatPro}>
                            <option value="">전체</option>
                            <option value="욕설 및 비방">욕설 및 비방</option>
                            <option value="부적절한 컨텐츠">부적절한 컨텐츠</option>
                            <option value="허위 정보 및 사기">허위 정보 및 사기</option>
                            <option value="스팸 및 광고">스팸 및 광고</option>
                            <option value="기타">기타</option>
                        </select><input style={inputStyle2} value={searchWord.processing} onChange={changeSearchWordPro} placeholder="번호/내용/신고자/피신고자" /></div>
                </div>
                <ul className='admin-report-list' style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                    <li>
                        번호
                    </li>
                    <li>
                        구분
                    </li>
                    <li>
                        유형
                    </li>
                    <li>
                        내용
                    </li>
                    <li>
                        신고자
                    </li>
                    <li>
                        피신고자
                    </li>
                </ul>
                {
                    report.processing.length == 0 ?
                        <div className='no-list'>검색 결과가 없습니다.</div> :
                        report.processing.map(item => {
                            return (<><ul className='admin-report-list'>
                                <li>
                                    {item.id}
                                </li>
                                <li>
                                    {getSortText(item.sort)}
                                </li>
                                <li>
                                    {item.reportType}
                                </li>
                                <li onClick={() => readReport(item.id)} style={{ cursor: 'pointer' }}>
                                    {item.comment}
                                </li>
                                <li className='message-who' id={`mgx-${item.userFrom.id}`} style={{ cursor: 'pointer' }}>
                                    {item.userFrom.username}
                                </li>
                                {item.sort === 'USER' ? (
                                    <li className='message-who' id={`mgx-${item.reportUser.id}`} style={{ cursor: 'pointer' }}>
                                        {item.reportUser.username}
                                    </li>
                                ) : (
                                    <li className='message-who' onClick={() => moveProductInfo(item.sortId)} style={{ cursor: 'pointer' }}>
                                        '{item.reportUser.username}'의 상품
                                    </li>)}
                            </ul>
                                <div className='report-detail' id={'report-detail-' + item.id} style={{ display: 'none' }}>
                                    <div className='report-date'>신고일: {item.createDate}</div>
                                    <div className='report-comment'>내용: </div>
                                    <div className='cm-rc'>{item.comment}</div>
                                    <button style={{
                                        backgroundColor: '#222222',
                                        color: '#fff',
                                        padding: '7px 15px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        float: 'right',
                                        transition: 'background-color 0.3s ease',
                                        fontSize: '14px',
                                        marginTop: '20px'
                                    }} onClick={() => approvingReport(item.id, item.reportUser.id, item.userFrom.id, item.sort, item.sortId, item.reportUser.username, item.reportUser.profileImageUrl)}>처리 하기</button>
                                </div></>
                            )
                        })
                }
                <ul className="admin-paging">
                    {nowPage.processing > 1 && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, processing: nowPage.processing - 1 }))}>
                            <li className="page-num">◀</li>
                        </a>
                    )}
                    {pageNumber.processing.map((pg) => {
                        const activeStyle = nowPage.processing === pg ? 'page-num active' : 'page-num';
                        return (
                            <a className="page-num" onClick={() => setNowPage(prev => ({ ...prev, processing: pg }))} key={pg}>
                                <li className={activeStyle}>{pg}</li>
                            </a>
                        );
                    })}
                    {nowPage.processing < totalPage.processing && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, processing: nowPage.processing + 1 }))}>
                            <li className="page-num">▶</li>
                        </a>
                    )}
                </ul>
            </div>
            <div className='report-box'>
                <span style={{ paddingLeft: '0px', fontSize: '17px', fontWeight: '600', color: '#555' }}>📢신고 처리 완료</span>
                <div className='report-search'>
                    <div>총 신고 수: {totalRecord.complete}</div>
                    <div><select style={inputStyle} onChange={changeSortCom}>
                        <option value="">전체</option>
                        <option value="USER">사용자</option>
                        <option value="PRODUCT">제품</option>
                        <option value="REVIEW">리뷰</option>
                    </select>
                        <select style={inputStyle} onChange={changeCatCom}>
                            <option value="">전체</option>
                            <option value="욕설 및 비방">욕설 및 비방</option>
                            <option value="부적절한 컨텐츠">부적절한 컨텐츠</option>
                            <option value="허위 정보 및 사기">허위 정보 및 사기</option>
                            <option value="스팸 및 광고">스팸 및 광고</option>
                            <option value="기타">기타</option>
                        </select><input style={inputStyle2} value={searchWord.complete} onChange={changeSearchWordCom} placeholder="번호/내용/신고자/피신고자" /></div>
                </div>
                <ul className='admin-report-list' style={{ fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                    <li>
                        번호
                    </li>
                    <li>
                        구분
                    </li>
                    <li>
                        유형
                    </li>
                    <li>
                        내용
                    </li>
                    <li>
                        신고자
                    </li>
                    <li>
                        피신고자
                    </li>
                </ul>
                {
                    report.complete.length == 0 ?
                        <div className='no-list'>검색 결과가 없습니다.</div> :
                        report.complete.map(item => {
                            return (<><ul className='admin-report-list'>
                                <li>
                                    {item.id}
                                </li>
                                <li>
                                    {getSortText(item.sort)}
                                </li>
                                <li>
                                    {item.reportType}
                                </li>
                                <li onClick={() => readReport(item.id)} style={{ cursor: 'pointer' }}>
                                    {item.comment}
                                </li>
                                <li className='message-who' id={`mgx-${item.userFrom.id}`} style={{ cursor: 'pointer' }}>
                                    {item.userFrom.username}
                                </li>
                                {item.sort === 'USER' ? (
                                    <li className='message-who' id={`mgx-${item.reportUser.id}`} style={{ cursor: 'pointer' }}>
                                        {item.reportUser.username}
                                    </li>
                                ) : (
                                    <li className='message-who' onClick={() => moveProductInfo(item.sortId)} style={{ cursor: 'pointer' }}>
                                        '{item.reportUser.username}'의 상품
                                    </li>)}
                            </ul>
                                <div className='report-detail' id={'report-detail-' + item.id} style={{ display: 'none' }}>
                                    <div className='report-date'>신고일: {item.createDate}</div>
                                    <div className='report-comment'>내용: </div>
                                    <div className='cm-rc'>{item.comment}</div>
                                    <div className='report-comment'>결과: </div>
                                    <div className='cm-rc'>제재 종류: {item.reportResult} <hr />
                                        코멘트: {item.reportText}</div>
                                    <button style={{
                                        backgroundColor: '#222222',
                                        color: '#fff',
                                        padding: '7px 15px',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        float: 'right',
                                        transition: 'background-color 0.3s ease',
                                        fontSize: '14px',
                                        marginTop: '20px'
                                    }} onClick={() => delReport(item.id)}>신고 파기</button>
                                </div></>
                            )
                        })
                }
                <ul className="admin-paging">
                    {nowPage.complete > 1 && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, complete: nowPage.complete - 1 }))}>
                            <li className="page-num">◀</li>
                        </a>
                    )}
                    {pageNumber.complete.map((pg) => {
                        const activeStyle = nowPage.complete === pg ? 'page-num active' : 'page-num';
                        return (
                            <a className="page-num" onClick={() => setNowPage(prev => ({ ...prev, complete: pg }))} key={pg}>
                                <li className={activeStyle}>{pg}</li>
                            </a>
                        );
                    })}
                    {nowPage.complete < totalPage.complete && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, complete: nowPage.complete + 1 }))}>
                            <li className="page-num">▶</li>
                        </a>
                    )}
                </ul>
            </div>
        </div>
    );
}
export default AdminReport;