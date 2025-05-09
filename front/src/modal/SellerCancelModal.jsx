import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";
import axios from "axios";

function SellerCancelModal() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTransform, setModalTransform] = useState('scale(0.8)'); 
    const mount = useRef(true);
    const modal_name = useRef('refund-modal');
    const modalSel = useSelector((state) => state.modal);
    const dispatch = useDispatch();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const [agree, setAgree] = useState(false);

    const doCancel = () => {
      if (!agree) return;

      if(user) {
        const isConfirmed = window.confirm("정말로 이 주문을 취소 하시겠습니까?");
        if (!isConfirmed) return;
        setAgree(false);
        axios.get(`${serverIP.ip}/order/cancelOrder?orderId=${modalSel.selectedItem}&msgg=seller`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => {
            if(res.data === "ok"){
                window.alert("정상 취소 처리되었습니다.");
                modalClose();
            }
        })
        .catch(err => {
            console.log(err);
            alert('오류가 발생했습니다.');
        });
      }
    }

    const modalClose = () => {
        dispatch(setModal({...modalSel, isOpen:false}));
        setModalOpen(false);
        setModalTransform('scale(0.8)');
        setAgree(false);
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
  
        let clicked = 0, f_x = 0, f_y = 0, m_x = 0, m_y = 0, c_x = 0, c_y = 0, cnt = 0;
  
        document.addEventListener('keyup', (e) => {
          if (e.key === 'Escape') modalClose();
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
      if (!_px) return 0;
      _px = _px.toString().replace(/px/i, "");
      return parseInt(_px, 10) || 0;
    }

    const modalBackStyle = {
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

    const modalStyle = {
        position: 'fixed',
        width: '400px',
        height: '530px',
        backgroundColor: 'white',
        zIndex: 3001,
        opacity: modalOpen ? 1 : 0,
        transform: modalTransform,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        padding: '20px',
        boxSizing: 'border-box',
        borderRadius: '10px'
    };

    const exitStyle = {
        position:'absolute',
        top:'5px',
        right:'15px',
        fontSize:'25px',
        cursor:'pointer',
    }

    const buttonStyle = {
        marginTop:'20px',
        cursor: agree ? 'pointer' : 'not-allowed',
        border:'none',
        padding:'10px 20px',
        fontSize:'18px',
        borderRadius:'5px',
        backgroundColor: agree ? '#D97B6D' : '#ccc',
        color: 'white',

    }

    return (
      <>
        <div id="modal-background" style={modalBackStyle}></div>
  
        <div id={`${modal_name.current}`} style={modalStyle}>
          <div style={exitStyle} onClick={modalClose}>x</div>
          <div>
            <h2 style={{textAlign:'center'}}>주문 취소</h2>
            <pre style={{whiteSpace:'pre-wrap', fontSize:'14px', border:'1px solid #ddd', padding:'10px', fontFamily:'inherit'}}>
{`주문 취소는 상품 준비 이전 단계에서만 가능하므로, 상품 준비가 시작되기 전에 구매자의 취소 요청 여부를 반드시 확인해 주세요.

주문 제작 상품(예: 이니셜 각인, 맞춤형 제작 등)의 경우, 제작이 시작된 이후에는 구매자의 단순 변심에 의한 취소가 불가하다는 점을 명확히 안내해 주세요.

상품이 발송된 이후에는 주문 취소가 불가능하며, 이 경우 구매자에게 수령 후 반품 절차를 안내해 주셔야 합니다.

결제 완료 후 일정 시간이 지나면 자동으로 제작이 시작되므로, 가능한 한 빠르게 주문 상태를 점검하고, 구매자의 취소 요청이 있는 경우 즉시 대응해 주세요.`}
            </pre>

            <div style={{marginTop:'15px', fontSize:'14px'}}>
              <input 
                type="checkbox" 
                id="agreeRefund" 
                checked={agree} 
                onChange={() => setAgree(prev => !prev)} 
              />
              <label htmlFor="agreeRefund" style={{marginLeft: '4px', cursor:'pointer'}}>
                위 취소 약관에 동의합니다.
              </label>
            </div>
            
            <div style={{textAlign:'center'}}>
            <button 
              style={buttonStyle} 
              onClick={doCancel} 
              disabled={!agree}
            >
              주문 취소
            </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  export default SellerCancelModal;
