import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";

import axios from "axios";

function ReportApprove() {
  let serverIP = useSelector((state) => state.serverIP);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTransform, setModalTransform] = useState('scale(0.8)');
  const mount = useRef(true);
  const modal_name = useRef('message-modal');
  const modalSel = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const interact = useSelector((state) => state.interact);
  const modal = useSelector((state) => state.modal);
  const [comment, setComment] = useState('');

  const [report_cat, setReport_cat] = useState('신고 취소')

  const [isRegex, setIsRegex] = useState({
    isOpen: false,
    msg: '제목을 입력해주세요'
  });

  const modalClose = () => {
    dispatch(setModal({ ...modalSel, isOpen: false }));
    setModalOpen(false);
    setModalTransform('scale(0.8)');
  }

  useEffect(() => {
    if (modalSel.isOpen) {
      setModalOpen(true);
      setModalTransform('scale(1)');
    }
  }, [modalSel.isOpen]);

  const changeCat = (e) => {
    setReport_cat(e.target.value);
  }

  const changeComment = (e) => {
    setComment(e.target.value);
  }

  const sendMessage = (id) => {
    if (comment.length === 0) {
      setIsRegex({ isOpen: true, msg: '내용을 입력해주세요' });
      return;
    }
    if (comment.length > 200) {
      setIsRegex({ isOpen: true, msg: '내용이 너무 깁니다' });
      return;
    }
    if (user)
      axios.get(`${serverIP.ip}/admin/reportApprove?toId=${modal.info.toId}&fromId=${modal.info.fromId}&reportId=${modal.info.reportId}&sort=${modal.info.sort}&sortId=${modal.info.sortId}&approveType=${report_cat}&comment=${encodeURIComponent(comment)}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
        .then(res => {
          modalClose();
        })
        .catch(err => console.log(err))
  }

  useEffect(() => {
    if (!mount.current) mount.current = false;
    else {
      let modal = document.getElementById(modal_name.current);

      modal.style.left = (window.innerWidth - modal.offsetWidth) / 2 + 'px';
      modal.style.top = (window.innerHeight - modal.offsetHeight) / 2 + 'px';

      let clicked = 0;
      let f_x = 0;
      let f_y = 0;

      let m_x = 0;
      let m_y = 0;

      let c_x = 0;
      let c_y = 0;

      let cnt = 0;

      document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
          modalClose();
        }
      });

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
          window.addEventListener("mouseup", (e) => {
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
    if (_px === null || _px === "") {
      return 0;
    }
    _px = _px + "";
    if (_px.indexOf("px") > -1) {
      _px = _px.replace("px", "");
    }
    if (_px.indexOf("PX") > -1) {
      _px = _px.replace("PX", "");
    }
    var result = parseInt(_px, 10);
    if ((result + "") == "NaN") {
      return 0;
    }
    return result;
  }
  const modalBackStyle = {    //모달 배경
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(5px)',
    zIndex: 10000,
    opacity: modalOpen ? 1 : 0,
    transition: 'opacity 0.3s ease'
  }

  const modalStyle = {    //모달 스타일은 이런 양식으로 plz 마음대로 커스텀
    position: 'fixed',
    width: '500px',
    height: '360px',
    backgroundColor: 'white',
    zIndex: 10001,
    opacity: modalOpen ? 1 : 0,
    transform: modalTransform,
    borderRadius: '12px',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
    padding: '20px',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  };

  const exitStyle = { //나가기버튼임 마음대로 커스텀
    position: 'absolute',
    top: '15px',
    right: '25px',
    fontSize: '30px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#555',
  };

  const labelStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    marginTop: '12px',
    textAlign: 'left',
  };

  const inputStyle = {
    marginTop: '10px',
    width: '99.5%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
  };

  const textareaStyle = {
    marginTop: '10px',
    width: '96%',
    padding: '8px',
    height: '120px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
    resize: 'none',
  };

  const buttonStyle = {
    backgroundColor: '#222222',
    color: '#fff',
    padding: '7px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    float: 'right',
    transition: 'background-color 0.3s ease',
    fontSize: '14px',
    marginTop: '10px',
  };

  const profileStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    padding: '10px',

    borderRadius: '10px',
  };

  const usernameStyle = {
    fontSize: '18px',
    color: '#333',
  };

  const profileContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };


  return (
    <>
      <div id="modal-background" style={modalBackStyle}></div>

      <div id={`${modal_name.current}`} style={modalStyle}>
        <div style={exitStyle} onClick={modalClose}>x</div>
        {modal.info.sort === "USER" ? (
          <>
            {modal.info.toUrl && (
              <div style={profileStyle}>
                <span style={usernameStyle}>
                  <b>처리 대상</b> &gt;
                </span>
                <div style={profileContainerStyle}>
                  <span style={usernameStyle}>&nbsp;{modal.info.toName}</span>
                </div>
              </div>
            )}
            <span style={labelStyle}>처리 내용</span>
            <select style={inputStyle} onChange={changeCat}>
              <option value="신고 취소">신고 취소</option>
              <option value="이용 정지 10일">이용 정지 10일</option>
              <option value="이용 정지 30일">이용 정지 30일</option>
              <option value="이용 정지 60일">이용 정지 60일</option>
              <option value="회원 강제 탈퇴">회원 강제 탈퇴</option>
            </select>
          </>
        ) : (
          <>
            {modal.info.toUrl && (
              <div style={profileStyle}>
                <span style={usernameStyle}>
                  <b>처리 대상</b> &gt;
                </span>
                <div style={profileContainerStyle}>
                  <span style={usernameStyle}>&nbsp;'{modal.info.toName}'의 상품</span>
                </div>
              </div>
            )}
            <span style={labelStyle}>처리 내용</span>
            <select style={inputStyle} onChange={changeCat}>
              <option value="신고 취소">신고 취소</option>
              <option value="해당 상품 삭제">해당 상품 삭제</option>
            </select>
          </>
        )}
        <span style={labelStyle}>내용</span>
        <textarea onChange={changeComment} style={textareaStyle} />
        <button
          onClick={() => sendMessage()}
          style={buttonStyle}
          onMouseOver={(e) => e.target.style.backgroundColor = '#343434'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#222222'}
        >
          처리
        </button>
        {isRegex.isOpen && <span style={{ color: 'red', fontSize: '14px', marginLeft: '5px' }}>{isRegex.msg}</span>}
      </div>
    </>
  );
}

export default ReportApprove;