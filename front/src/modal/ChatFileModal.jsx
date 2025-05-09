import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";

function ChatFileModal() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTransform, setModalTransform] = useState('scale(0.8)'); 
    const mount = useRef(true);
    const modal_name = useRef('chat-file-modal');
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
        width: '400px',
        height: '340px',
        backgroundColor: 'white',
        zIndex: 3001,
        opacity: modalOpen ? 1 : 0,
        transform: modalTransform,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        borderRadius:'10px',
        paddingTop:'60px'
      };

    const exitStyle = { //나가기버튼임 마음대로 커스텀
        position:'absolute',
        top:'5px',
        right:'10px',
        fontSize:'20px',
        cursor:'pointer'
    }

    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const changeFile = (e) => {
      handleFiles(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
    };

    const handleFiles = (selectedFiles) => {
      if (selectedFiles.length + files.length > 5) {
        alert("이미지를 최대 5개 까지 선택해주세요.");
        return;
      }
        const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("image/"));
        if (imageFiles.length !== selectedFiles.length) {
            alert("이미지 파일만 업로드 가능합니다.");
        }
        setFiles(prevFiles => [...prevFiles, ...imageFiles]);
    };

    const removeFile = (fileToRemove) => {
      setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    const submitChatFile = async() => {
      if (files.length === 0) {
        alert("이미지를 최소 1개 이상 선택해주세요.");
        return;
      }
      if (files.length > 5) {
        alert("이미지를 최대 5개 까지 선택해주세요.");
        return;
      }
      const base64List = await Promise.all(files.map(fileToBase64));
      dispatch(setModal({...modalSel, isOpen:false, selected:'chat-file-modal', selectedItem:base64List}));
    }

    return (
      <>
        <div id="modal-background" style={modalBackStyle}></div>
  
        <div id={`${modal_name.current}`} style={modalStyle}>
          <div style={exitStyle} onClick={modalClose}>X</div>
          <div 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={handleDrop}
                style={{
                    width: '80%', 
                    height: '150px', 
                    border: '2px dashed #ccc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    margin:'auto',
                }}
                onClick={() => fileInputRef.current.click()}
            >
                사진을 드래그/선택하여 1~5개 첨부해주세요
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="file"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={changeFile}
                />
                <button 
                    style={{ 
                        backgroundColor: '#333', 
                        color: 'white', 
                        padding: '10px 15px', 
                        border: 'none', 
                        cursor: 'pointer',
                        borderRadius: '5px',
                        marginRight:'10%',
                        marginTop:'10px'
                    }} 
                    onClick={() => fileInputRef.current.click()}
                >
                    이미지 선택
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', paddingLeft:'20px' }}>
                {files.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
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
                                width: '15px', 
                                height: '15px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '50%', 
                                fontSize: '10px', 
                                cursor: 'pointer'
                            }}
                            onClick={() => removeFile(file)}
                        >
                            ✕
                        </span>
                    </div>
                ))}
            </div>
            <button style={{width:'80%', marginLeft:'10%', marginTop:'15px',
              backgroundColor: '#333', color:'white', border:'none',
              padding:'10px', borderRadius:'6px', cursor:'pointer'}} onClick={() => submitChatFile()}>등록하기</button>
        </div>
      </>
    );
  }
  
  export default ChatFileModal;