import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";

function InquiryModal() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTransform, setModalTransform] = useState('scale(0.8)'); 
    const mount = useRef(true);
    const modal_name = useRef('inquiry-modal');
    const modalSel = useSelector((state) => state.modal);
    const dispatch = useDispatch();

    const modalClose = () => {
        dispatch(setModal({...modalSel, isOpen:false}));
        setModalOpen(false);
        setModalTransform('scale(0.8)');
    }

    useEffect(() => {
        if (modalSel.isOpen) {
            setModalOpen(true);
            setModalTransform('scale(1)');
        }
    }, [modalSel.isOpen]);

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
        zIndex: 3000,
        opacity: modalOpen ? 1 : 0,
        transition: 'opacity 0.3s ease'
    }

    const modalStyle = {    //모달 스타일은 이런 양식으로 plz 마음대로 커스텀
        position: 'fixed',
        width: '600px',
        height: '600px',
        backgroundColor: 'white',
        zIndex: 3001,
        opacity: modalOpen ? 1 : 0,
        transform: modalTransform,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      };

    const exitStyle = { //나가기버튼임 마음대로 커스텀
        position:'absolute',
        top:'15px',
        right:'25px',
        fontSize:'30px',
        cursor:'pointer'
    }

    return (
      <>
        <div id="modal-background" style={modalBackStyle}></div>
  
        <div id={`${modal_name.current}`} style={modalStyle}>
          <div style={exitStyle} onClick={modalClose}>X</div>
          <div>답변하기</div>
        </div>
      </>
    );
  }
  
  export default InquiryModal;