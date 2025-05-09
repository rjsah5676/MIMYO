import { Stomp } from '@stomp/stompjs';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setModal } from '../../store/modalSlice';

import SockJS from 'sockjs-client';
import '../../css/view/chatting.css'

function Chatting() {

    const { roomId } = useParams();
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);
    const modal = useSelector(state => state.modal);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const stompClientRef = useRef(null);
    const refDialogDiv = useRef();

    const [roomInfo, setRoomInfo] = useState({});
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const [files, setFiles] = useState([]);

    useEffect(()=>{
        if (user) {
            if (refDialogDiv.current) {
                refDialogDiv.current.scroll({
                    top: refDialogDiv.current.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }
    },[chatHistory])

    useEffect(()=>{
        if (user) {
            if (isOpen) {
                getRoomInfo();
                getChatList();
            }
        }
    },[isOpen]);

    useEffect(()=>{
        if (user) {
            const socket = new SockJS(`${serverIP.ip}/ws`);
            const stompClient = Stomp.over(socket);
            stompClientRef.current = stompClient;

            stompClient.connect({ Authorization: `Bearer ${user.token}` }, ()=>{
                stompClient.subscribe(`/topic/chat/${roomId}`, (msg)=>{
                    const body = JSON.parse(msg.body);
                    setChatHistory(prev => [...prev, body]);
                    setIsOpen(true);
                    if (body.urd.id != user.user.id) {
                        changeReadState(body.id);
                    }
                    stompClient.send(`/app/chat/read/${roomId}`, {}, JSON.stringify({
                        roomId: roomId,
                        urd: { userid: user.user.userid }
                    }));
                });
                stompClient.subscribe(`/topic/chat/read/${roomId}`, (msg)=>{
                    changeAllReadState();
                });
                stompClient.send(`/app/chat/read/${roomId}`, {}, JSON.stringify({
                    roomId: roomId,
                    urd: { userid: user.user.userid }
                }));
            })
            return () => {
                stompClient.disconnect(() => {
                    //추후 구현
                });
            };
        }
        
    }, [roomId, serverIP, user?.token]);

    const getRoomInfo =()=>{
        axios.get(`${serverIP.ip}/chat/getChatRoom/${roomId}`,
            { headers: {Authorization: `Bearer ${user.token}`}}
        )
        .then(res => {
            setRoomInfo(res.data);
        })
        .catch(err => console.log(err));
    }

    const getChatList = ()=> {
        axios.get(`${serverIP.ip}/chat/getChatList/${roomId}`,
            { headers: {Authorization: `Bearer ${user.token}`}}
        )
        .then(res => {
            console.log(res.data);
            setChatHistory(res.data);
        })
        .catch(err => console.log(err));
    }

    const changeReadState = (chatId)=>{
        axios.post(`${serverIP.ip}/chat/read/${chatId}`, null, {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(()=>{
            getChatList();
        }).catch(err => {
        console.error('읽음 처리 실패', err);
        });
    }
    const changeAllReadState = ()=>{
        axios.post(`${serverIP.ip}/chat/read/room/${roomId}`, null, {
            headers: { Authorization: `Bearer ${user.token}` }
        }).then(()=>{
            setTimeout(() => {
                getRoomInfo();
                getChatList();
              }, 100);
        }).
        catch(err => {
            console.error('읽음 처리 실패', err);
        });
    }

    const sendMessage = useCallback((e)=>{
        if (user) {
            e.preventDefault();
            if (stompClientRef.current && message.trim() !== '') {
                stompClientRef.current.send(`/app/chat/${roomId}`, {}, JSON.stringify({
                    roomId: roomId,
                    message: message,
                    urd: { userid: user.user.userid }
                }));
                setMessage('');
            }
        }
    },[message]);

    const sendImageMessage = useCallback(async () => {
        if (!user || files.length === 0) return;
    
        const formData = new FormData();
        files.forEach(file => formData.append("files", file));
        formData.append("roomId", roomId);
        try {
            const res = await axios.post(`${serverIP.ip}/chat/uploadImages`, formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            const { chatId, imageUrls } = res.data;

            if (stompClientRef.current) {
                stompClientRef.current.send(`/app/chat/${roomId}`, {}, JSON.stringify({
                    id: chatId,
                    roomId,
                    message: "",
                    urd: { userid: user.user.userid },
                    imageUrls: imageUrls
                }));
            }
            setMessage('');
            setFiles([]);
            dispatch(setModal({isOpen:false, selectedItem:[]}))
        } catch (err) {
            console.error("이미지 업로드 실패", err);
        }
    }, [files]);
    
    const leaveChatRoom = ()=>{
        if (window.confirm("채팅방을 나가시겠습니까?")) {
            axios.post(`${serverIP.ip}/chat/leaveChatRoom/${roomId}`, null, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(()=>{
                stompClientRef.current.send(`/app/chat/read/${roomId}`, {}, JSON.stringify({
                    roomId: roomId,
                    urd: { userid: user.user.userid }
                }));
                navigate(-1);
            })
            .catch(err=>console.log(err));
        }
    }

    const getTime = (times)=>{
        const time = new Date(times);
        const month = (time.getMonth() + 1).toString().padStart(2, '0'); // 월 (1월은 0부터 시작하므로 +1)
        const day = time.getDate().toString().padStart(2, '0'); // 일
        const hour = time.getHours().toString().padStart(2, '0'); // 시
        const minute = time.getMinutes().toString().padStart(2, '0'); // 분

        return `${month}-${day} ${hour}:${minute}`;
    }

    const openFileModal = (roomInfo) =>{
        dispatch(setModal({...modal, isOpen:true, selected:'chat-file-modal', selectedItem:roomInfo}));
    }

    useEffect(() => {
        if (!modal.isOpen && modal.selectedItem) {
          const convertBase64ToBlob = (base64Data) => {
            const contentType = base64Data.substring(base64Data.indexOf(":") + 1, base64Data.indexOf(";"));
            const byteCharacters = atob(base64Data.split(',')[1]);
            const byteArrays = [];
      
            for (let i = 0; i < byteCharacters.length; i += 512) {
              const slice = byteCharacters.slice(i, i + 512);
              const byteNumbers = new Array(slice.length);
              for (let j = 0; j < slice.length; j++) {
                byteNumbers[j] = slice.charCodeAt(j);
              }
              byteArrays.push(new Uint8Array(byteNumbers));
            }
      
            return new Blob(byteArrays, { type: contentType });
          };
            try{
            const blobs = modal.selectedItem.map((base64, idx) => {
              const blob = convertBase64ToBlob(base64);
              return new File([blob], `upload-${idx}.jpg`, { type: blob.type });
            });
            setFiles(blobs);
          } catch {
              return;
          }
        }
      }, [modal]);
      

    const removeFile = (fileToRemove) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    // 전체 이미지 리스트 모으기
    const [showAllImages, setShowAllImages] = useState(false);
    const [modalImage, setModalImage] = useState(null); // 이미지 클릭 시 모달처럼 확대된 이미지 설정
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleImageClick = (imgUrls) => {
        setModalImage(imgUrls);
        setShowAllImages(true);
        setCurrentIndex(0);
    };

    return (
        <div style={{paddingTop: '100px'}}>
            {showAllImages && modalImage.length > 0 && (
            <div
                style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.8)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
                }}
                onClick={() => setShowAllImages(false)}
            >
                <div
                style={{
                    position: 'relative',
                    maxWidth: '90vw',
                    maxHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
                >
                {currentIndex > 0 && (
                    <button
                    onClick={() => setCurrentIndex(currentIndex - 1)}
                    style={{
                        position: 'absolute',
                        left: '-40px',
                        fontSize: '60px',
                        color: 'white',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    >
                    ‹
                    </button>
                )}

                {/* 이미지 */}
                <img
                    src={`${serverIP.ip}${modalImage[currentIndex]}`}
                    alt={`img-${currentIndex}`}
                    style={{
                    maxWidth: '300px',
                    maxHeight: '80vh',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    }}
                />

                {currentIndex < modalImage.length - 1 && (
                    <button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    style={{
                        position: 'absolute',
                        right: '-40px',
                        fontSize: '60px',
                        color: 'white',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    >
                    ›
                    </button>
                )}
                </div>

                <button
                onClick={() => setShowAllImages(false)}
                style={{
                    marginTop: '20px',
                    padding: '8px 20px',
                    fontSize: '14px',
                    backgroundColor: '#e54d4b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
                >
                닫기
                </button>
            </div>
            )}
            {
                user &&
                <>
                    <div className="iphone-frame">
                        <div className='chat-container'>
                            {
                                roomInfo.state !== 'CLOSED' &&
                                <div style={{padding: '10px', display: 'flex', alignItems: 'center'}}>
                                    <div style={{width: 'calc(100% - 60px)'}}><b style={{fontSize: '12pt'}}>{roomInfo.product?.productName}</b></div>
                                    {
                                        <div style={{width: '60px'}}><span style={{width: '50px', float: 'right', textAlign: 'center', padding: '5px', background: '#e54d4b', color: '#fff', borderRadius: '10px', fontSize: '10pt', cursor: 'pointer'}}
                                            onClick={leaveChatRoom}>나가기</span></div>
                                    }
                                </div>
                            }
                            <div className="chat-display" ref={refDialogDiv}>
                                {
                                    roomInfo.state === "OPEN"
                                    ?
                                    roomInfo.product &&
                                    <div id="info-message">
                                        💬 작품 관련 궁금한 점이 있다면 편하게 문의해 주세요.<br/>
                                        ⏱ 판매자는 최대한 빠르게 답변드릴게요.<br/>
                                        🤝 서로를 존중하며 예의 있게 대화해 주세요.<br/>
                                        🚫 부적절한 언행은 제재될 수 있어요.
                                    </div>
                                    :
                                    chatHistory.map((history, idx)=>{
                                        const isMe = history.urd.id === user.user.id;
                                        return (
                                            <div className='chat-content'>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                                    alignItems: 'flex-end',
                                                    gap: '8px',
                                                    marginBottom: '10px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <img className="chat-user-img" src={history.urd.imgUrl.indexOf('http') !== -1 ? history.urd.imgUrl : `${serverIP.ip}${history.urd.imgUrl}`} alt='' />
                                                        <span className='message-who' id = {isMe ? `mgx-${user.user.id}`: `mgx-${history.urd.id}`} style={{fontWeight:'bold', fontSize:'10pt', cursor:'pointer'}}>{history.urd.username}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                        { history.imageUrls && history.imageUrls.length !== 0 ?
                                                        <div className={isMe ? 'me' : 'other'} style={{maxWidth:'250px', cursor:'pointer'}} onClick={()=>handleImageClick(history.imageUrls)}><img width='100' height='100' src={`${serverIP.ip}${history.imageUrls[0]}`}></img></div>
                                                        :<div className={isMe ? 'me' : 'other'} style={{maxWidth:'250px'}}>{history.message}</div>
                                                        }
                                                        <div className={isMe ? 'me-date' : 'other-date'}>{getTime(history.sendTime)}</div>
                                                        {
                                                            !history.read &&
                                                            <span id='unread-sticker'>읽지 않음</span>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                                {
                                    roomInfo.state === 'LEFT' &&
                                    <div style={{textAlign: 'center', padding: '10px', color: '#555'}}>
                                        - {user.user.id === roomInfo.participantA.id ? roomInfo.participantB.username : roomInfo.participantA.username}님이 방을 나가셨습니다 -
                                    </div> 
                                }
                            </div>
                            { files.length === 0 ?
                            <div className="chat-input">
                                <div className="chat-file-button" onClick={()=> openFileModal(roomInfo)}>+</div>
                                <textarea id="chat-textarea"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    onKeyDown={e => {if (e.key === 'Enter') {sendMessage(e);}}}
                                    disabled={roomInfo.state === 'LEFT'}
                                />
                                <input type="button" value="보내기" id="chat-send-btn"
                                    onClick={sendMessage}
                                    disabled={roomInfo.state === 'LEFT'}
                                />
                            </div> :
                            <>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {files.map((file, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', padding:'5px', paddingBottom:'15px' }}>
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
                                <div className="chat-input">
                                    <div className="chat-file-button" onClick={()=> openFileModal(roomInfo)}>+</div>
                                    <textarea id="chat-textarea"
                                        value={''}
                                        onChange={e => setMessage(e.target.value)}
                                        onKeyDown={e => {if (e.key === 'Enter') {sendMessage(e);}}}
                                        disabled
                                    />
                                    <input type="button" value="사진 보내기" id="chat-send-btn"
                                        onClick={sendImageMessage}
                                    />
                                </div>
                            </>
                            }
                        </div>
                        <div className="home-button" onClick={()=> navigate(-1)}></div>
                    </div>
                </>
            }
        </div>
    )
}

export default Chatting;