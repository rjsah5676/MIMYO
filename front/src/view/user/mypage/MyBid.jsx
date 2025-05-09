import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function MyBid() {
    const loc = useLocation();
    const serverIP = useSelector((state) => { return state.serverIP });
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();

    const [totalPage, setTotalPage] = useState(1);
    const [pageNumber, setPageNumber] = useState([]);

    const [bid, setBid] = useState([]);

    const [nowPage, setNowPage] = useState(1);

    const [totalRecord, setTotalRecord] = useState(1);

    const [searchOption, setSearchOption] = useState('');

    const moveInfo = (prodId) => {
        if(user)
            axios.get(`${serverIP.ip}/product/getInfo?productId=${prodId}`,{
                headers:{Authorization:`Bearer ${user.token}`}
            })
            .then(res =>{
                navigate('/product/info', { state: { product: res.data } });
            })
            .catch(err => console.log(err))
    }

    useEffect(() => {
        getBidList();
        const det = document.querySelectorAll(".report-detail");
        if (det)
            det.forEach((det) => (det.style.display = "none"));
    }, [nowPage]);

    useEffect(() => {
        //getBoardList();
        getBidList();
    }, [loc, searchOption]);

    const getBidList = () =>{
        if(user)
            axios.get(`${serverIP.ip}/auction/getBidList?nowPage=${nowPage}&state=${searchOption}`,{
                headers:{Authorization:`Bearer ${user.token}`}
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
                setBid(res.data.bidList);
                setNowPage(res.data.pvo.nowPage);
                setTotalRecord(res.data.pvo.totalRecord);
            })
            .catch(err => {
                console.log(err);
            })
    }


    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const getStateLabel = (state) => {
        switch (state) {
            case 'LIVE':
                return { label: '입찰 중', color: '#7f8c8d' };
            case 'SUCCESS':
                return { label: '입찰 성공', color: '#2ecc71' };
            case 'DEAD':
                return { label: '입찰 취소', color: '#e74c3c' };
            case 'PAID':
                return { label: '결제 완료', color: '#6699CC' };
            case 'RETURNED':
                return { label: '환불 됨', color: '#f39c12' };
            default:
                return { label: '알 수 없음', color: '#7f8c8d' };
        }
    };

    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}｜${hours}:${minutes}`;
    };

    const moveBuy = (item) => {
        navigate('/product/buying', {
            state: {
                selectedItems: [],
                product: item.room.auctionProduct,
                totalPrice: item.price,
                shippingFee: item.room.auctionProduct.shippingFee || 0,
                selectedCoupon: 0,
                bid: item
            }
        });
    }

    return (
        <div className="report-box">
            <select onChange={(e) => setSearchOption(e.target.value)} style={{ width: '120px', borderRadius: '10px', padding: '5px 10px', border: '1px solid #ddd' }}>
                <option value="">전체</option>
                <option value="LIVE">입찰 중</option>
                <option value="DEAD">입찰 취소</option>
                <option value="SUCCESS">입찰 성공</option>
                <option value="PAID">결제 완료</option>
            </select>
            

            <ul className='mypage-bid-list' style={{fontWeight:'bold', borderBottom:'1px solid #ddd'}}>
                <li>
                    상품명
                </li>
                <li>
                    판매자명
                </li>
                <li style={{textAlign:'center'}}>
                    입찰시간
                </li>
                <li>
                    보증금
                </li>
                <li>
                    입찰 가격
                </li>
                <li>
                    상품사진
                </li>
                <li>
                    입찰상태
                </li>
            </ul>
            {
                bid.length == 0 ? 
                <div className='no-list'>구매 작품이 없습니다.</div>:
                
                bid.map(item => {
                    return (<ul className='mypage-bid-list'>
                        <li onClick={()=> navigate(`/auction/room/${item.room.roomId}`)} style={{cursor:'pointer', lineHeight:'80px'}}>
                           {item.room.auctionProduct.productName}
                        </li>   
                        <li className='message-who' id={`mgx-${item.room.auctionProduct.sellerNo.id}`} style={{cursor:'pointer',lineHeight:'80px'}}>
                            {item.room.auctionProduct.sellerNo.username}
                        </li>
                        <li style={{lineHeight:'80px', textAlign:'center'}}>
                            {formatDateTime(item.bidTime)}
                        </li>
                        <li style={{lineHeight:'80px'}}>
                            {formatNumberWithCommas(item.room.deposit)} 원
                        </li>
                        <li style={{lineHeight:'80px'}}>
                            {formatNumberWithCommas(item.price)} 원
                        </li>
                        <li>
                            <img style={{width:'80px',height:'80px'}} src={`${serverIP.ip}/uploads/auction/product/${item.room.auctionProduct.id}/${item.room.auctionProduct.images[0].filename}`}/>
                        </li>
                        <li>
                            <div style={{ borderRadius:'5px',marginTop:'25px',lineHeight:'30px',height:'30px',backgroundColor:`${getStateLabel(item.state).color}`, color:'white'}}>{getStateLabel(item.state).label}</div>
                            {item.state==='SUCCESS' && <div><button onClick={()=>moveBuy(item)}
                                style={{border:'none', width:'100%',padding:'5px', borderRadius:'10px'
                                ,marginTop:'3px', border:'1px solid #999', cursor:'pointer'
                            }}>결제하기</button></div>}
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
        </div>
    );
}

export default MyBid;
