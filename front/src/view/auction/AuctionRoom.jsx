import { useParams,useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa';
import { setLoginView } from '../../store/loginSlice';

function AuctionRoom() {
    const { roomId } = useParams();
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);

    const navigate = useNavigate();
    const dispatch = useDispatch();


    const [roomInfo, setRoomInfo] = useState({});
    const [imageIndex, setImageIndex] = useState(0);
    const [isWish, setIsWish] = useState(false);
    
    const [remainingTime, setRemainingTime] = useState('');

    const stompClientRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [inputPrice, setInputPrice] = useState('');

    const [isConnected, setIsConnected] = useState(false);

    const [bidHistory, setBidHistory] = useState([]);

    const [auctionMenu, setAuctionMenu] = useState('detail');

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const socket = new SockJS(`${serverIP.ip}/ws`);
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient;
        if(user)
            stompClient.connect({ Authorization: `Bearer ${user.token}` }, () => {
                stompClient.subscribe(`/topic/auction/${roomId}`, (message) => {
                    const body = JSON.parse(message.body);
                    /*
                    setMessages(prev => [...prev, body]);
                    setBidHistory(prev => [...prev, {
                        username: body.urd.username,
                        price: body.price,
                        bidTime: new Date().toISOString() //추후 정렬용
                    }]);*/
                    getRoomInfo();
                    fetchPreviousBids();
                });

                stompClient.subscribe(`/topic/auction/${roomId}/end`, (message) => {
                    alert('경매가 종료되었습니다..');
                    navigate('/auction');
                });
        
                setIsConnected(true);
            });
    
        return () => {
            stompClient.disconnect(() => {
                console.log('Disconnected from auction room');
            });
        };
    }, [roomId, serverIP, user]);

    useEffect(() => {
        fetchPreviousBids();
    }, [roomId]);

    const fetchPreviousBids = async () => {
        if(user)
        try {
            const res = await axios.get(`${serverIP.ip}/auction/bids/${roomId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const formattedBids = res.data.map(bid => ({
                state:bid.state,
                user: bid.user,
                price: bid.price,
                bidTime: new Date(bid.bidTime).toISOString(), // 정렬 용도
                room:bid.room,
                id:bid.id
            }));
            const sortedBids = formattedBids.sort(
                (a, b) => new Date(b.bidTime) - new Date(a.bidTime)
            );

            setBidHistory(sortedBids);
        } catch (err) {
            console.error('입찰 내역 불러오기 실패', err);
        }
    };

    const getRoomInfo =()=>{
        axios.get(`${serverIP.ip}/auction/getAuctionItem/${roomId}`
        )
        .then(res => {
            setRoomInfo(res.data);
        })
        .catch(err => console.log(err));
    }

    useEffect(()=> {
        getRoomInfo();
    },[]);

    const sendBid = () => {
        const client = stompClientRef.current;
    
        if (client && client.connected) {
            const payload = {
                username: user.username,
                price: inputPrice,
            };
    
            client.send(
                `/app/auction/${roomId}`,
                {},
                JSON.stringify({ userid: user.user.userid, price: inputPrice })
            );
            setInputPrice('');
        } else {
            console.warn('STOMP 연결이 아직 완료되지 않았습니다.');
        }
    };

    const moveBuy = () => {
        navigate('/auction/bid', {
            state: {
                roomInfo:roomInfo
            }
        });
    };

    const moveOneBuy = () => {
        if (!user) {
            dispatch(setLoginView(true));
        }
        else {
            if (user.user.id !== roomInfo.auctionProduct.sellerNo.id)
                navigate('/product/buying', {
                    state: {
                        selectedItems: [],
                        product: roomInfo.auctionProduct,
                        totalPrice: roomInfo.buyNowPrice,
                        shippingFee: roomInfo.auctionProduct.shippingFee || 0,
                        selectedCoupon: 0,
                    }
                });
            else {
                alert('본인의 상품입니다');
            }
        }
    };

    useEffect(() => {
        if (!roomInfo.endTime) return;
    
        const timer = setInterval(() => {
            const timeLeft = calculateRemainingTime(roomInfo.endTime);
            setRemainingTime(timeLeft);
        }, 1000);
    
        return () => clearInterval(timer);
    }, [roomInfo.endTime]);

    const calculateRemainingTime = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;
    
        if (diff <= 0) {
            return "경매 종료";
        }
    
        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
        return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
    };

    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ｜ ${hours}:${minutes}`;
    };

    
    return (
        <div style={{ paddingTop: "170px" }}>
             { roomInfo.auctionProduct && <>
                    <div className="product-info-container">
                        <div className="product-info-left">
                            <img
                                id="product-big-img"
                                src={`${serverIP.ip}/uploads/auction/product/${roomInfo.auctionProduct.id}/${roomInfo.auctionProduct.images[imageIndex].filename}`}
                                alt="상품 이미지"
                            />
                            <ul className="product-thumbnail-list">
                                {roomInfo.auctionProduct.images.map((img, idx) => (
                                    <li key={idx} className={`thumbnail-item ${idx === imageIndex ? "active" : ""}`}>
                                        <img
                                            src={`${serverIP.ip}/uploads/auction/product/${roomInfo.auctionProduct.id}/${img.filename}`}
                                            alt={`Thumbnail ${idx}`}
                                            onClick={() => setImageIndex(idx)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="product-info-right">
                            <div style={{ 
                                marginTop: "5px", padding: "4px 8px", display: "inline-block",
                                marginLeft:'50px',
                                borderRadius: "5px", fontSize: "12px", fontWeight: "600",
                                backgroundColor: roomInfo.state==="OPEN" ? "green" : "#ff4d4d",
                                color: 'white',
                                minHeight: "20px",
                                lineHeight: "20px" // 가운데 정렬
                            }}>
                              {roomInfo.state==="OPEN" ? "경매 진행 중":"경매 마감"}
                            </div>
                            <ul>
                                <li style={{ display: 'flex' }}>
                                <div className='product-profile-box'>
                                    <img id={`mgx-${roomInfo.auctionProduct.sellerNo.id}`} className='message-who' src={roomInfo.auctionProduct.sellerNo.uploadedProfileUrl ? `${serverIP.ip}${roomInfo.auctionProduct.sellerNo.uploadedProfileUrl}` : `${roomInfo.auctionProduct.sellerNo.kakaoProfileUrl}`} alt='' width={40} height={40} style={{ borderRadius: '100%', backgroundColor: 'white', border: '1px solid gray' }} />
                                    <div id={`mgx-${roomInfo.auctionProduct.sellerNo.id}`} className='message-who' style={{ height: '40px', lineHeight: '40px', marginLeft: '5px' }}>{roomInfo.auctionProduct.sellerNo.username} &gt;</div>
                                </div>
                                </li>
                                <li style={{ display: 'flex', marginTop: '20px', fontSize: '25px', lineHeight: '30px'}}>
                                    <div className='product-info-name'>
                                        {roomInfo.auctionProduct.productName}
                                    </div>
                                </li>
                                <li style={{ marginTop:'10px',marginBottom:'20px', color:'#444'}}>
                                    <strong>시작:</strong>&nbsp; {formatDateTime(roomInfo.createdAt)}<br/>
                                    <strong>종료:</strong>&nbsp; {formatDateTime(roomInfo.endTime)}
                                </li>
                                <li>
                                    <ul className='product-info-main-box'>
                                    <li style={{borderBottom:'1px solid #ddd'}}>
                                        <span style={{ fontSize: '16px'}}>시작가격 : 
                                            &nbsp;<strong style={{ color: 'rgb(95, 95, 95)',fontSize:'18px' }}>{formatNumberWithCommas(roomInfo.firstPrice)}</strong><span>&nbsp;원</span>
                                        </span>
                                        <br/><br/>
                                        <span style={{ fontSize: '16px'}}>현재가격 : 
                                            &nbsp;<strong style={{ color: 'rgb(255, 70, 70)',fontSize:'25px' }}>{formatNumberWithCommas(roomInfo.currentPrice)}</strong><span>&nbsp;원</span>
                                            &nbsp;&nbsp;<span style={{fontSize:'26px'}}>/</span> &nbsp;즉시구매가격 : <strong>{formatNumberWithCommas(roomInfo.buyNowPrice)}</strong> 원
                                        </span> 
                                    </li>
                                    <li>
                                        <span>입찰 인원: {roomInfo.hit} 명</span>
                                    </li>
                                    <li>
                                        <span>
                                            남은 시간: <strong> {remainingTime}</strong>
                                        </span>
                                    </li>
                                    <li style={{borderTop:'1px solid #ddd'}}>
                                        <br/>
                                        <span>
                                            배송비: {formatNumberWithCommas(roomInfo.auctionProduct.shippingFee)} 원
                                        </span>
                                    </li>
                                   { user && user.user.id != roomInfo.auctionProduct.sellerNo.id &&
                                    <li style={{marginTop:'50px',display:'flex', justifyContent:'center', gap:'20px'}}>
                                    { roomInfo.state === 'OPEN' && user &&<>
                                    { roomInfo.highestBidderId !== user.user.id ?
                                    <>
                                    <button onClick={()=> moveBuy()}
                                        style={{
                                            width: '120px',
                                            height: '45px',
                                            backgroundColor: '#8CC7A5',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                            transition: 'background-color 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a7b63'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8CC7A5'}
                                    >
                                        입찰하기
                                    </button>

                                    <button
                                        style={{
                                            width: '120px',
                                            height: '45px',
                                            backgroundColor: '#FF5C5C',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                            transition: 'background-color 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d33'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF5C5C'}
                                        onClick={moveOneBuy}
                                    >
                                        즉시구매
                                    </button>
                                    </> : <div style={{fontSize:'20px'}}>'{user.user.username}' 님은 현재 최고 입찰자 입니다.</div>
                                    }
                                    </>
                                    }
                                    </li>
                                }
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc', margin: '0px', marginTop:'40px' }} />
                        <div style={{
                            display: 'flex',
                            fontSize: '16px',
                            fontWeight: '600',
                        }}>
                            <div onClick={()=> setAuctionMenu('detail')} style={{width:'50%', textAlign:'center', padding:'10px'}}>상세정보</div>
                            <div onClick={()=> setAuctionMenu('bidding')} style={{width:'50%', textAlign:'center', padding:'10px'}}>입찰내역</div>
                        </div>
                        <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc', margin: '0px' }} />
                    </div>
                    <div className='auction-bottom'>
                    <div style={{ display: isMobile ? 'block' : 'flex' }}>
                        {/* 상세정보 */}
                        {(isMobile ? auctionMenu === 'detail' : true) && (
                            <div style={{overflow:'hidden', width: isMobile ? '' : '50%'}}>
                                <div dangerouslySetInnerHTML={{ __html: roomInfo.auctionProduct.detail }} style={{ padding: '30px'}} />
                            </div>
                        )}
                        
                        {/* 입찰 내역 */}
                        {(isMobile ? auctionMenu === 'bidding' : true) && (
                            <div className='auction-bottom-right'
                                style={{
                                width: isMobile ? '100%' : '50%',
                                borderLeft: isMobile ? 'none' : '1px solid #ddd'
                                }}
                            >
                                <ul>
                                    {
                                        bidHistory.map((item, idx) => {
                                            return(<li>
                                                <div className='product-profile-box'>
                                                <img id={`mgx-${item.user.id}`} className='message-who' src={item.user.uploadedProfileUrl ? `${serverIP.ip}${item.user.uploadedProfileUrl}` : `${item.user.kakaoProfileUrl}`} alt='' width={40} height={40} style={{ borderRadius: '100%', backgroundColor: 'white', border: '1px solid gray' }} />
                                                <div id={`mgx-${item.user.id}`} className='message-who' style={{ height: '40px', lineHeight: '40px', marginLeft: '5px' }}>{item.user.username} &gt;</div>
                                                </div>
                                                <div>
                                                    { item.state=='SUCCESS' && <div className='auc-stat' style={{backgroundColor:'#FFD700'}}>최종 입찰자</div>}
                                                    { item.state=='LIVE' && <div className='auc-stat' style={{backgroundColor:'#FFD700'}}>최고 입찰자</div> } 
                                                    { item.state=='DEAD' && <div style={{backgroundColor:'#9E9E9E', color:'white'}} className='auc-stat'>유찰됨</div>}
                                                    { formatDateTime(item.bidTime)} &nbsp;&nbsp;&nbsp; <span style={{fontWeight:'bold', fontSize:'19px'}}>{formatNumberWithCommas(item.price)}₩</span>
                                                </div>
                                            </li>)
                                        })
                                    }
                                </ul>
                            </div>
                        )}
                    </div>
                    </div>
                <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc', margin: '0px' }} />
            </>
            }
        </div>
    );
}

export default AuctionRoom;