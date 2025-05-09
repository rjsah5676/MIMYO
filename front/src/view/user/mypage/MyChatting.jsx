import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

function MyChatting() {
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedTab = searchParams.get('tab') || 'default';
    const stompClientRef = useRef(null);

    const [chatRoomList, setChatRoomList] = useState([]);
    const [productChatRoomList, setProductChatRoomList] = useState([]);
    const [isMessage, setIsMessage] = useState(false);
    
    useEffect(()=>{
        getChatRoomList();
        getProductChatRoomList();
    }, [isMessage]);

    const getChatRoomList = ()=>{
        axios.get(`${serverIP.ip}/chat/chatRoomList?tab=default`,
            { headers: {Authorization: `Bearer ${user.token}`}})
        .then(res=>{
            setChatRoomList(res.data);
            console.log(res.data.filter(room => room.state === 'LEFT' && room.firstLeftUser !== user.user.id).length);
            console.log(res.data.filter(room => room.state === 'ACTIVE').length);
            res.data.map(room=>{
                const socket = new SockJS(`${serverIP.ip}/ws`);
                const stompClient = Stomp.over(socket);
                stompClientRef.current = stompClient;
    
                stompClient.connect({ Authorization: `Bearer ${user.token}` }, ()=>{
                    stompClient.subscribe(`/topic/chat/${room.chatRoomId}`, (msg)=>{
                        setIsMessage(!isMessage);
                    });
                })
            })
        })
        .catch(err=>console.log(err));
    }

    const getProductChatRoomList = ()=>{
        axios.get(`${serverIP.ip}/chat/chatRoomList?tab=product`,
            { headers: {Authorization: `Bearer ${user.token}`}})
        .then(res=>{
            setProductChatRoomList(res.data);
            res.data.map(room=>{
                const socket = new SockJS(`${serverIP.ip}/ws`);
                const stompClient = Stomp.over(socket);
                stompClientRef.current = stompClient;
    
                stompClient.connect({ Authorization: `Bearer ${user.token}` }, ()=>{
                    stompClient.subscribe(`/topic/chat/${room.chatRoomId}`, (msg)=>{
                        setIsMessage(!isMessage);
                    });
                })
            })
        })
        .catch(err=>console.log(err));
    }

    const getTime = (times)=>{
        const time = new Date(times);
        const month = (time.getMonth() + 1).toString().padStart(2, '0'); // 월 (1월은 0부터 시작하므로 +1)
        const day = time.getDate().toString().padStart(2, '0'); // 일
        const hour = time.getHours().toString().padStart(2, '0'); // 시
        const minute = time.getMinutes().toString().padStart(2, '0'); // 분

        return `${month}-${day} ${hour}:${minute}`;
    }

    return (
        <div>
            <ul className='chat-menu'>
                <li className={selectedTab === 'default' ? 'selected-menu' : {}} onClick={() => navigate('?tab=default')}>일반 채팅</li>
                <li className={selectedTab === 'product' ? 'selected-menu' : {}} onClick={() => navigate('?tab=product')}>상품 문의 채팅</li>
            </ul>

            <hr className='menu-divider'/>
            {
                (selectedTab === 'default' && chatRoomList.filter(room => room.state === 'ACTIVE' || (room.state === 'LEFT' && room.firstLeftUser !== user.user.id)).length === 0) ||
                (selectedTab === 'product' && productChatRoomList.filter(room => room.state === 'ACTIVE' || (room.state === 'LEFT' && room.firstLeftUser !== user.user.id)).length === 0) ? (
                    <div style={{padding: '50px', textAlign: 'center'}}>진행 중인 채팅이 없습니다.</div>
                ) : null
            }
            {
                (selectedTab === 'default' ? chatRoomList : productChatRoomList).map((room, idx)=>{
                    const selectedUser = user.user.id === room.participantA.id ? room.participantB : room.participantA
                    if (room.state === 'ACTIVE' || (room.state === 'LEFT' && (room.firstLeftUser != undefined && room.firstLeftUser !== user.user.id)))
                    return (
                        <div key={idx} className="chat-room" onClick={()=>navigate(`/product/chat/${room.chatRoomId}`)}
                            style={room.lastChat.read || room.lastChat.sender.id === user.user.id ? {background: '#f8f8f8'} : {}}>
                            {
                                room.product
                                ? 
                                <img className="chat-room-img" 
                                    style={{borderRadius: '5px'}}
                                    src = {`${serverIP.ip}/uploads/product/${room.product.id}/${room.product.images[0].filename}`} alt=''
                                />
                                :
                                <img className="chat-room-img" 
                                    src = {selectedUser.profileImageUrl.indexOf('http') !==-1 ? `${selectedUser.profileImageUrl}`:`${serverIP.ip}${selectedUser.profileImageUrl}`} alt=''
                                />
                            }
                            <div style={{display: 'flex', flexDirection: 'column', paddingLeft: '3%', width: '85%'}}>
                                <div>
                                    <span style={{color: room?.product?.sellerNo.id === user.user.id ? '#2e704a' : ''}}><b>{room.product ? room.product.productName : selectedUser.username}</b></span>
                                    <span className='date'>{getTime(room.lastChat.sendTime)}</span><br/>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%'
                                }}>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '90%' }}>
                                        {room.lastChat.message ? room.lastChat.message : "(사진)"}
                                    </span>
                                    {
                                        !room.lastChat.read && room.lastChat.sender.id !== user.user.id &&
                                        <span id="new-chat-sticker">new</span>
                                    }
                                </div>
                            </div>
                        </div>
                    )
                })
            }

        </div>
    )
}

export default MyChatting;