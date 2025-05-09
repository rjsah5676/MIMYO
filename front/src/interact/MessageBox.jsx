import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";
import axios from "axios";
import { setInteract } from "../store/interactSlice";

function MessageBox() {
  let serverIP = useSelector((state) => state.serverIP);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTransform, setModalTransform] = useState('scale(0.8)');
  const mount = useRef(true);
  const modal_name = useRef('message-box-modal');
  const modalSel = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [messageList, setMessageList] = useState([]);

  const interact = useSelector((state) => state.interact);
  const [read, setRead] = useState(true);
  const [to_user, setTo_user] = useState({});
  const read_mount = useRef(false);

  const modalClose = () => {
    dispatch(setModal({ ...modalSel, isOpen: false }));
    setModalOpen(false);
    setModalTransform('scale(0.8)');
  }

  const readMessage = (id) => {
    const det = document.getElementById('comment-detail-' + id);
    det.style.display = det.style.display === 'inline-block' ? 'none' : 'inline-block';

    axios.get(`${serverIP.ip}/interact/readMessage?id=${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => setRead(!read))
      .catch(err => console.log(err));
  }

  useEffect(() => {
    if (!read_mount.current) read_mount.current = true;
    else getMsgList();
  }, [read]);

  useEffect(() => {
    if (modalSel.isOpen) {
      setModalOpen(true);
      setModalTransform('scale(1)');
      getMsgList();
    }
  }, [modalSel.isOpen]);

  const getMsgList = () => {
    if (user)
      axios.get(`${serverIP.ip}/interact/getMessageList`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => setMessageList(res.data))
        .catch(err => console.log(err));
  }

  const delMsg = (id) => {
    axios.get(`${serverIP.ip}/interact/deleteMessage?id=${id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => setRead(!read))
      .catch(err => console.log(err));
  }

  const allDelete = () => {
    axios.get(`${serverIP.ip}/interact/allDelete`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => setRead(!read))
      .catch(err => console.log(err));
  }
  const allRead = () => {
    axios.get(`${serverIP.ip}/interact/allRead`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(res => setRead(!read))
      .catch(err => console.log(err));
  }
  useEffect(() => {
    if (!mount.current) mount.current = false;
    else {
      let modal = document.getElementById(modal_name.current);
      modal.style.left = (window.innerWidth - modal.offsetWidth) / 2 + 'px';
      modal.style.top = (window.innerHeight - modal.offsetHeight) / 2 + 'px';

      let clicked = 0, f_x = 0, f_y = 0, m_x = 0, m_y = 0, c_x = 0, c_y = 0, cnt = 0;
      document.addEventListener('keyup', (e) => e.key === 'Escape' && modalClose());

      if (modal)
        modal.addEventListener("mousedown", (e) => {
          if (clicked === 0) {
            c_x = getNumberFromPixel(modal.style.left);
            c_y = getNumberFromPixel(modal.style.top);
            modal.style.cursor = "grabbing";
            clicked = 1;
          }
          setTimeout(function moveModal() {
            modal.style.left = c_x + m_x - f_x + 'px';
            modal.style.top = c_y + m_y - f_y + 'px';
            c_x = getNumberFromPixel(modal.style.left);
            c_y = getNumberFromPixel(modal.style.top);
            f_x = m_x;
            f_y = m_y;
            setTimeout(moveModal, 10);
            cnt++;
          }, 10);
          window.addEventListener("mouseup", () => {
            cnt = 0;
            clicked = 0;
            modal.style.cursor = "default";
          });
          window.addEventListener("mousemove", (e) => {
            if (clicked === 1) {
              m_x = e.clientX;
              m_y = e.clientY;
              if (cnt < 1000000) {
                cnt = 1000000;
                f_x = e.clientX;
                f_y = e.clientY;
              }
            }
          });
        });
    }
  }, []);

  function getNumberFromPixel(_px) {
    return _px ? parseInt(_px.replace("px", "")) || 0 : 0;
  }

  const reSend = (to) => {
    dispatch(setInteract({ ...interact, selected: to.id }));
    dispatch(setModal({ selected: 'message', isOpen: true }));
  }

  const modalBackStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    zIndex: 10000, opacity: modalOpen ? 1 : 0, transition: 'opacity 0.3s ease'
  };

  const modalStyle = {
    position: 'fixed', width: window.innerWidth <= 768? '350px' : '600px', height: '550px', backgroundColor: '#fff',
    zIndex: 10001, opacity: modalOpen ? 1 : 0, transform: modalTransform,
    borderRadius: '12px', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
    padding: '20px', transition: 'opacity 0.3s ease, transform 0.3s ease'
  };

  const exitStyle = {
    position: 'absolute', top: '15px', right: '25px', fontSize: '24px',
    cursor: 'pointer', fontWeight: 'bold', color: '#555'
  };

  return (
    <>
      <div id="modal-background" style={modalBackStyle}></div>

      <div id={`${modal_name.current}`} style={modalStyle}>
        <div style={exitStyle} onClick={modalClose}>x</div>
        <span style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          width: '100%',
          display: 'block',
          marginBottom: '20px'
        }}>
          쪽지 보관함
        </span>
        <ul style={{
          display: 'grid',
          gridTemplateColumns: '2fr 4fr 1.5fr 0.5fr',
          gap: '10px',
          borderBottom: '2px solid #ccc',
          paddingBottom: '10px',
          listStyle: 'none',
          margin: '0',
          padding: '0'
        }}>
          <li style={{
            fontWeight: 'bold',
            padding: '10px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>보낸이</li>
          <li style={{
            fontWeight: 'bold',
            padding: '10px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>제목</li>
          <li style={{
            fontWeight: 'bold',
            padding: '10px 0'
          }}>날짜</li>
          <li></li>
        </ul>
        <div style={{
          height: '400px',
          overflowY: 'auto',
        }}>
          {
            messageList.map((item, idx) => {
              return (
                <>
                  <ul key={idx} style={{
                    color: item.state !== 'READABLE' ? 'gray' : 'inherit',
                    display: 'grid',
                    gridTemplateColumns: '2fr 4fr 1.5fr 0.5fr',
                    gap: '10px',
                    paddingBottom: '15px',
                    listStyle: 'none',
                    margin: '0',
                    padding: '0',
                    borderBottom: '1px solid #ddd'
                  }}>
                    <li className='message-who' id={`msg-${item.userFrom.id}`} style={{
                      cursor: 'pointer',
                      padding: '10px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '16px'
                    }}>
                      {item.userFrom.username}
                    </li>
                    <li style={{
                      cursor: 'pointer',
                      padding: '10px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '16px'
                    }} onClick={() => readMessage(item.id)}>
                      {item.subject}
                    </li>
                    <li style={{
                      padding: '10px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '16px'
                    }}>
                      {item.writedate.substring(0, 10)}
                    </li>
                    <li onClick={() => delMsg(item.id)} style={{
                      cursor: 'pointer',
                      textAlign: 'center',
                      padding: '10px 0',
                      fontSize: '20px',
                      lineHeight: '12px',
                      color: 'black'
                    }}>
                      x
                    </li>
                  </ul>
                  <div className='comment-detail' id={'comment-detail-' + item.id} style={{
                    display: 'none',
                    padding: '20px',
                    backgroundColor: '#f8f8f8',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    marginTop: '10px',
                    marginBottom: '10px',
                    width: window.innerWidth >= 768 ? '540px' : ''
                  }}>

                    <span style={{
                      display: 'block',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                      color: '#333'
                    }}>보낸 사람: {item.userFrom.username}</span>

                    <div style={{
                      marginBottom: '15px',
                      color: '#555',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      whiteSpace:'pre-wrap'
                    }} dangerouslySetInnerHTML={{ __html: item.comment}}>
                    </div>
                    {item.userFrom.authority !== 'ROLE_ADMIN' &&
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
                      }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#343434'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#222222'}
                        onClick={() => reSend(item.userFrom)}>
                        답장
                      </button>
                    }
                  </div>

                </>
              );
            })
          }
        </div>
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
        }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#343434'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#222222'}
          onClick={() => allDelete()}>
          읽은 쪽지 삭제
        </button>
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
          marginTop: '20px',
          marginRight: '20px'
        }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#343434'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#222222'} onClick={() => allRead()}>
          전체 읽음
        </button>
      </div>
    </>

  );
}
export default MessageBox;