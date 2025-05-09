import { useState, useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setModal } from "../../../store/modalSlice";

function MyPoint(){
    const [totalPage, setTotalPage] = useState(1);
    const [pageNumber, setPageNumber] = useState([]);

    const [pointList, setPointList] = useState([]);

    const [couponState, setCouponState] = useState('');

    const [nowPage, setNowPage] = useState(1);

    const [totalRecord, setTotalRecord] = useState(1);

    const user = useSelector((state)=> state.auth.user);
    const serverIP = useSelector((state)=> state.serverIP);
    const modal = useSelector((state)=>state.modal);

    useEffect(()=>{
        getCouponList();
    },[nowPage,couponState])

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const getCouponList = () => {
        if(user)
            axios.get(`${serverIP.ip}/interact/getAllPointList?nowPage=${nowPage}`,{
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(res => {
                const newPageNumbers = [];
                for (let p = res.data.pvo.startPageNum; p < res.data.pvo.startPageNum + res.data.pvo.onePageCount; p++) {
                    if (p <= res.data.pvo.totalPage) {
                        newPageNumbers.push(p);
                    }
                }
                setPageNumber(newPageNumbers);
                setTotalPage(res.data.pvo.totalPage);
                setPointList(res.data.pointList);
                setNowPage(res.data.pvo.nowPage);
                setTotalRecord(res.data.pvo.totalRecord);
            })
            .catch(err => console.log(err))
    }
    
    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}｜${hours}:${minutes}`;
    };

    return(<div className="report-box">
            <ul className='mypage-point-list' style={{fontWeight:'bold', borderBottom:'1px solid #ddd', fontSize: '16px'}}>
                <li>
                    지급 구분
                </li>
                <li>
                    지급일
                </li>
                <li>
                    포인트
                </li>
            </ul>
            {
                pointList.length == 0 ? 
                <div className='no-list'>포인트 내역이 없습니다.</div>:
                
                pointList.map(item => {
                    return (<ul className='mypage-point-list' style={{fontSize: '16px'}}>
                        <li>
                            {item.type === 'ROULETTE' && (
                                <span style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                borderRadius: '20px',
                                backgroundColor: '#ff7f50',
                                color: 'white',
                                textAlign: 'center'
                                }}>
                                룰렛 포인트
                                </span>
                            )}
                            {item.type === 'REVIEW' && (
                                <span style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                borderRadius: '20px',
                                backgroundColor: '#6a5acd',
                                color: 'white',
                                textAlign: 'center'
                                }}>
                                리뷰 포인트
                                </span>
                            )}
                            {item.type === 'MELON' && (
                                <span style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                borderRadius: '20px',
                                backgroundColor: '#3cb371',
                                color: 'white',
                                textAlign: 'center'
                                }}>
                                멜론 포인트
                                </span>
                            )}
                            </li>
  
                        <li>
                            {item.lastSpinDate}
                        </li>
                        <li>
                            {item.point}
                        </li>
                    </ul>
                )
                })
            }
        <ul className="admin-paging">
            {nowPage > 1 && (
                <a className="page-prenext" onClick={() => setNowPage(nowPage - 1)}>
                    <li className="page-num">◀</li>
                </a>
            )}
            {pageNumber.map((pg) => {
                const activeStyle = nowPage === pg ? 'page-num active' : 'page-num';
                return (
                    <a className="page-num" onClick={() => setNowPage(pg)} key={pg}>
                        <li className={activeStyle}>{pg}</li>
                    </a>
                );
            })}
            {nowPage < totalPage && (
                <a className="page-prenext" onClick={() => setNowPage(nowPage + 1)}>
                    <li className="page-num">▶</li>
                </a>
            )}
        </ul>
    </div>);
}

export default MyPoint;