import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";
import { setSearch } from "../store/searchSlice";

function CategoryModal() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTransform, setModalTransform] = useState('scale(0.8)');
    const mount = useRef(true);
    const modal_name = useRef('category-modal');
    const modalSel = useSelector((state) => state.modal);

    const search = useSelector((state) => state.search);

    const [selectedCategories, setSelectedCategories] = useState({});

    const dispatch = useDispatch();

    const modalClose = () => {
        dispatch(setModal({...modalSel, isOpen:false}));
        setModalOpen(false);
        setModalTransform('scale(0.8)');
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
        if (modalSel.isOpen) {
            setModalOpen(true);
            setModalTransform('scale(1)');

            const selectedData = search.productCategory || [];
            const updatedCategories = {};

            Object.keys(modalSel.info).forEach(category => {
                const subCategories = modalSel.info[category] || [];
                const selectedSubCategories = subCategories.filter(sub => selectedData.includes(sub));

                if (selectedSubCategories.length > 0) {
                    updatedCategories[category] = {
                        isChecked: selectedSubCategories.length === subCategories.length,
                        subCategories: selectedSubCategories
                    };
                }
            });

            setSelectedCategories(updatedCategories);
        }
    }, [modalSel.isOpen, search.productCategory, modalSel.info]);

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

    const modalBackStyle = {
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
    };

    const modalStyle = {
        position: 'fixed',
        width: isMobile ? '400px' : '650px',
        maxHeight: '80vh',
        backgroundColor: 'white',
        zIndex: 10001,
        opacity: modalOpen ? 1 : 0,
        transform: modalTransform,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
    };

    const contentStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        maxHeight: 'calc(80vh - 100px)'
    };

    const headerStyle = {
        padding: '20px',
        borderBottom: '1px solid #eee',
        marginBottom: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const titleStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: 0
    };

    const exitStyle = {
        fontSize: '24px',
        cursor: 'pointer',
        color: '#777'
    };

    const categoryWrapperStyle = {
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '1px solid #f2f2f2'
    };

    const categoryLabelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    };

    const categoryContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginLeft: '15px',
        alignItems: 'center'
    };

    const subCategoryLabelStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        marginBottom: '5px',
        marginRight: '10px',
        cursor: 'pointer'
    };

    const subCategoryInputStyle = {
        marginRight: '5px'
    };

    const buttonContainerStyle = {
        padding: '20px',
        borderTop: '1px solid #eee',
        display: 'flex',
        justifyContent: 'flex-end'
    };

    const confirmButtonStyle = {
        backgroundColor: '#8cc7a5',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: '#4a7b63',
        }
    };

    const checkboxStyle = {
        accentColor: '#8cc7a5',
    };

    const handleCategoryChange = (category) => {
        const isChecked = !selectedCategories[category]?.isChecked;
        const subCategories = modalSel.info[category] || [];

        setSelectedCategories(prev => {
            const updated = { ...prev };
            updated[category] = {
                isChecked,
                subCategories: isChecked ? subCategories : []
            };
            return updated;
        });
    };

    const handleSubCategoryChange = (category, subCategory) => {
        setSelectedCategories(prev => {
            const updated = { ...prev };
            const subCategories = new Set(updated[category]?.subCategories || []);
            if (subCategories.has(subCategory)) {
                subCategories.delete(subCategory);
            } else {
                subCategories.add(subCategory);
            }
            updated[category] = {
                isChecked: subCategories.size === modalSel.info[category]?.length,
                subCategories: Array.from(subCategories)
            };
            return updated;
        });
    };

    // 확인 버튼 클릭 시 선택된 소분류 부모로 전달
    const modal = useSelector((state) => state.modal);

    const handleConfirm = () => {
        const selectedData = Object.values(selectedCategories)
            .flatMap(category => category.subCategories); // 선택된 소분류만 추출
        dispatch(setSearch({...search, productCategory: selectedData}));
        dispatch(setModal({ ...modal, isOpen: false })); // 모달 닫기
    };

    return (
        <>
            <div id="modal-background" style={modalBackStyle}></div>
            <div id={`${modal_name.current}`} style={modalStyle}>
                <div style={headerStyle}>
                    <h3 style={titleStyle}>상품 카테고리 선택</h3>
                    <div style={exitStyle} onClick={modalClose}>&times;</div>
                </div>

                <div style={contentStyle}>
                    {Object.keys(modalSel.info).map((category) => (
                        <div key={category} style={categoryWrapperStyle}>
                            <label style={categoryLabelStyle}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories[category]?.isChecked || false}
                                    onChange={() => handleCategoryChange(category)}
                                    style={{ ...subCategoryInputStyle, ...checkboxStyle }}
                                />
                                <strong>{category}</strong>
                            </label>
                            <div style={categoryContainerStyle}>
                                {modalSel.info[category]?.map((subCategory) => (
                                    <label key={subCategory} style={subCategoryLabelStyle}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories[category]?.subCategories.includes(subCategory) || false}
                                            onChange={() => handleSubCategoryChange(category, subCategory)}
                                            style={{ ...subCategoryInputStyle, ...checkboxStyle }}
                                        />
                                        {subCategory}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={buttonContainerStyle}>
                    <button onClick={handleConfirm} style={confirmButtonStyle}>확인</button>
                </div>
            </div>
        </>
    );
}

export default CategoryModal;