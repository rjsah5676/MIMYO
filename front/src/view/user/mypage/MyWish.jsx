import { useState, useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setModal } from "../../../store/modalSlice";

function MyWish(){
    const [totalPage, setTotalPage] = useState(1);
    const [pageNumber, setPageNumber] = useState([]);

    const [wishList, setWishList] = useState([]);

    const [nowPage, setNowPage] = useState(1);

    const [totalRecord, setTotalRecord] = useState(1);

    const user = useSelector((state)=> state.auth.user);
    const serverIP = useSelector((state)=> state.serverIP);
    const modal = useSelector((state)=>state.modal);

    const dispatch = useDispatch();

    const navigate = useNavigate();

    useEffect(()=>{
        getWishList();
    },[nowPage])

    const moveProduct = (product) => {
        navigate('/product/info', {state:{product:product}})
    }

    const getWishList = () => {
        if(user)
            axios.get(`${serverIP.ip}/interact/getWishList?nowPage=${nowPage}`,{
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
                setWishList(res.data.wishList);
                setNowPage(res.data.pvo.nowPage);
                setTotalRecord(res.data.pvo.totalRecord);
            })
            .catch(err => console.log(err))
    }

    useEffect(()=>{
        if(modal.delCheck==='wish') {
            axios.get(`${serverIP.ip}/interact/delWish?userId=${user.user.id}&productId=${modal.selected.split('-')[2]}`,{
                headers: { Authorization: `Bearer ${user.token}` } 
            })
            .then(res=>{
                getWishList();
                dispatch(setModal({delCheck:''}));
            })
            .catch(err => console.log(err));
        }
    },[modal.delCheck])

    return(<div className="report-box">
        <ul className='mypage-wish-list' style={{fontWeight:'bold', borderBottom:'1px solid #ddd'}}>
                <li>
                    상품명
                </li>
                <li>
                    가격
                </li>
                <li>
                    판매자
                </li>
                <li>
                    찜한날짜
                </li>
                <li>
                    상품사진
                </li>
                <li>
                </li>
            </ul>
            {
                wishList.length == 0 ? 
                <div className='no-list'>찜한 상품이 없습니다.</div>:
                
                wishList.map(item => {
                    return (<ul className='mypage-wish-list'>
                        <li style={{cursor:'pointer', lineHeight:'80px'}} onClick={()=>moveProduct(item.product)}>
                           {item.product.productName}
                        </li>   
                        <li style={{lineHeight:'80px'}}>
                            {item.product.price}
                        </li>
                        <li className='message-who' id={`mgx-${item.product.sellerNo.id}`} style={{cursor:'pointer',lineHeight:'80px'}}>
                            {item.product.sellerNo.username}
                        </li>
                        <li style={{lineHeight:'80px'}}>
                            {item.startDate.substring(0,16)}
                        </li>
                        <li className='wish-image' style={{width:'80px', height:'80px'}}>
                            <img style={{width:'100%',height:'100%'}} src={`${serverIP.ip}/uploads/product/${item.product.id}/${item.product.images[0].filename}`}/>
                        </li>
                        <li id={`wish-delll-${item.product.id}`} style={{cursor:'pointer', fontSize:'26px',lineHeight:'80px'}}>
                            x
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

export default MyWish;