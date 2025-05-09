import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";
import axios from "axios";

function BasketBox() {
  let serverIP = useSelector((state) => state.serverIP);

  const [modalTransform, setModalTransform] = useState('scale(0.8)');
  const mount = useRef(true);
  const modal_name = useRef('basket-box-modal');
  const modalSel = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const selectedItem = modalSel.selectedItem;
  const item = selectedItem;

  const modalClose = () => {
    dispatch(setModal({ ...modalSel, isOpen: false }));

    setModalTransform('scale(0.8)');
    setQuantityError(false);
  }

  useEffect(() => {
    if (modalSel.isOpen && modalSel.selected === 'basket-box') {
      setModalTransform('scale(1)');
      if (selectedItem) {
        setQuantity(selectedItem.quantity);
        setQuantityError(false);
      }
    }
  }, [modalSel.isOpen, modalSel.selected, selectedItem]);

  useEffect(() => {
  }, [modalSel.isOpen, selectedItem]);

  const handleQuantityChange = (e) => {
    const newQty = parseInt(e.target.value, 10);
    if (!isNaN(newQty) && newQty > 0) {
      setQuantity(newQty);
      setQuantityError(false);
    }
    if (newQty > item.categoryQuantity) {
      setQuantityError(true);
    }
    else {
      setQuantity(newQty);
      setQuantityError(false);
    }
  };

  const handleSave = () => {
    if (!user || !selectedItem || quantityError) {
      if (quantityError) {
        alert("수량 오류를 확인해주세요.");
      }
      return;
    }
    setIsSaving(true);

    axios.patch(`${serverIP.ip}/basket/update`, {
      basketNo: selectedItem.basketNo,
      quantity: quantity
    }, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then(() => {
        alert("수정이 완료되었습니다.");
        dispatch(setModal({ ...modalSel, isOpen: false }));
      })
      .catch((err) => {
        alert("수정 중 오류가 발생했습니다.");
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

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
    dispatch(setModal({ selected: 'message', isOpen: true }));
  }

  const modalBackStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    zIndex: 10000, opacity: modalSel.isOpen ? 1 : 0, transition: 'opacity 0.3s ease'
  };

  const modalStyle = {
    position: 'fixed', width: window.innerWidth <= 768 ? '350px' : '600px', height: '550px', backgroundColor: '#fff',
    zIndex: 10001, opacity: modalSel.isOpen ? 1 : 0, transform: modalTransform,
    borderRadius: '12px', boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
    padding: '20px', transition: 'opacity 0.3s ease, transform 0.3s ease'
  };

  const exitStyle = {
    position: 'absolute', top: '15px', right: '25px', fontSize: '24px',
    cursor: 'pointer', fontWeight: 'bold', color: '#555'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    marginRight: '100px',
    width: '50%',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null) {
      return "0";
    }
    return number.toLocaleString();
  };

  return (
    <>
      <div id="modal-background" style={modalBackStyle}></div>
      <div id={`${modal_name.current}`} style={modalStyle}>
        {modalSel.isOpen && modalSel.selected === 'basket-box' && (
          <>
            <div style={exitStyle} onClick={modalClose}>x</div>
            <div style={headerStyle}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>주문 수정</span>
            </div>

            {selectedItem && (
              <div style={{ padding: '10px' }}>
                <img style={{ width: '240px', height: '240px', borderRadius: '10px' }}
                  src={`${serverIP.ip}/uploads/product/${item.productNo}/${item.productImage}`}
                />
                <p><strong>상품명: </strong>{selectedItem.productName}</p>
                <p><strong>주문한 수량: </strong>{selectedItem.quantity}개, (남은 수량 : {selectedItem.categoryQuantity}개)</p>
                <p><strong>가격: </strong>{formatNumber((selectedItem.productPrice) + (selectedItem.additionalPrice))}원</p>
                <p><strong>변경할 수량: </strong>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    style={{ padding: '6px', width: '100px', borderColor: quantityError ? 'red' : '' }}
                  />
                  {quantityError && <p style={{ color: 'red' }}>변경할 수량이 남은 수량보다 많습니다.</p>}</p>

                <button style={buttonStyle} onClick={handleSave} disabled={isSaving || quantityError}>
                  {isSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
export default BasketBox;