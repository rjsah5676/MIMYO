import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";
import axios from "axios";

function RefundModal() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTransform, setModalTransform] = useState('scale(0.8)'); 
    const mount = useRef(true);
    const modal_name = useRef('refund-modal');
    const modalSel = useSelector((state) => state.modal);
    const dispatch = useDispatch();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const [invoice, setInvoice] = useState('');
    const [agree, setAgree] = useState(false);

    const doRefund = () => {
      if (!agree) return;

      if(user) {
        const isConfirmed = window.confirm("정말로 이 주문을 환불 처리하시겠습니까?");
        if (!isConfirmed) return;
        setAgree(false);
        axios.get(`${serverIP.ip}/order/refundOrder?orderId=${modalSel.selectedItem}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => {
            if(res.data === "ok"){
                window.alert("정상 환불 처리되었습니다.");
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
        height: '400px',
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
        backgroundColor: agree ? '#8CC7A5' : '#ccc',
        color: 'white',

    }

    return (
      <>
        <div id="modal-background" style={modalBackStyle}></div>
  
        <div id={`${modal_name.current}`} style={modalStyle}>
          <div style={exitStyle} onClick={modalClose}>x</div>
          <div>
            <h2 style={{textAlign:'center'}}>환불 처리</h2>
            <pre style={{whiteSpace:'pre-wrap', fontSize:'14px', border:'1px solid #ddd', padding:'10px', fontFamily:'inherit'}}>
{`상품 수령일로부터 14일 이내 신청 가능합니다.

단, 다음의 경우에는 환불 및 교환이 불가합니다

- 고객님의 부주의로 상품이 훼손된 경우
- 사용 또는 세탁한 경우
- 상품 가치가 현저히 감소된 경우
- 주문제작 상품(이니셜 각인, 맞춤형 상품 등)`}
            </pre>

            <div style={{marginTop:'15px', fontSize:'14px'}}>
              <input 
                type="checkbox" 
                id="agreeRefund" 
                checked={agree} 
                onChange={() => setAgree(prev => !prev)} 
              />
              <label htmlFor="agreeRefund" style={{marginLeft: '4px'}}>
                위 환불 약관에 동의합니다.
              </label>
            </div>
            
            <div style={{textAlign:'center'}}>
            <button 
              style={buttonStyle} 
              onClick={doRefund} 
              disabled={!agree}
            >
              환불 처리
            </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  export default RefundModal;
