import { useState, useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setModal } from "../../../store/modalSlice";

function MyCoupon(){
    const [totalPage, setTotalPage] = useState(1);
    const [pageNumber, setPageNumber] = useState([]);

    const [couponList, setCouponList] = useState([]);

    const [couponState, setCouponState] = useState('');

    const [nowPage, setNowPage] = useState(1);

    const [totalRecord, setTotalRecord] = useState(1);

    const user = useSelector((state)=> state.auth.user);
    const serverIP = useSelector((state)=> state.serverIP);
    const modal = useSelector((state)=>state.modal);

    const dispatch = useDispatch();

    const navigate = useNavigate();

    useEffect(()=>{
        getCouponList();
    },[nowPage,couponState])

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const getCouponList = () => {
        if(user)
            axios.get(`${serverIP.ip}/interact/getAllCouponList?nowPage=${nowPage}&state=${couponState}`,{
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
                setCouponList(res.data.couponList);
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
        <select onChange={(e) => setCouponState(e.target.value)} style={{ width: '120px', borderRadius: '10px', padding: '5px 10px', border: '1px solid #ddd', marginBottom:'30px'}}>
                <option value="">전체</option>
                <option value="AVAILABLE">사용 가능</option>
                <option value="EXPIRED">사용 완료</option>
            </select>
        <ul className='mypage-coupon-list' style={{fontWeight:'bold', borderBottom:'1px solid #ddd'}}>
                <li>
                    쿠폰명
                </li>
                <li style={{textAlign:'center'}}>
                    할인
                </li>
                <li>
                    발급일
                </li>
                <li>
                    만료일
                </li>
                <li>
                    사용일
                </li>
                <li>
                    쿠폰 상태
                </li>
            </ul>
            {
                couponList.length == 0 ? 
                <div className='no-list'>쿠폰이 없습니다.</div>:
                
                couponList.map(item => {
                    return (<ul className='mypage-coupon-list'>
                        <li>
                            {item.couponName}
                        </li>   
                        <li style={{textAlign:'center'}}>
                            {formatNumberWithCommas(item.discount)} 원
                        </li>
                        <li>
                            {formatDateTime(item.startDate)}
                        </li>
                        <li>
                            {formatDateTime(item.endDate)}
                        </li>
                        <li>
                            {item.useDate && formatDateTime(item.useDate)}
                        </li>
                        <li>
                            {item.state === 'AVAILABLE' ? 
                            <div style={{backgroundColor:'#2ecc71', width:'60%', margin:'auto', padding:'5px', borderRadius:'5px', color:'white'}}>
                                사용 가능
                            </div>
                                :<div style={{backgroundColor:'#7f8c8d', width:'60%', margin:'auto', padding:'5px', borderRadius:'5px', color:'white'}}>사용 완료</div>}
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

export default MyCoupon;