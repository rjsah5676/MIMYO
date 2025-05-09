import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaHeart, FaShoppingCart, FaBell, FaTimes, FaRocketchat, FaStar } from "react-icons/fa";
import { setLoginView } from "../../store/loginSlice";
import { setModal } from "../../store/modalSlice";

import axios from "axios";
import ProductReview from './ProductReview';

function ProductInfo() {
    const serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();
    const [imageIndex, setImageIndex] = useState(0);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [isWish, setIsWish] = useState(false);
    const [options, setOptions] = useState([]);
    const [selectedOptionId, setSelectedOptionId] = useState("");
    const [selectedSubOptionId, setSelectedSubOptionId] = useState("");
    const [subOptions, setSubOptions] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedCoupon, setSelectedCoupon] = useState(0);
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [addBasketItems, setAddBasketItems] = useState(null);
    const [isSubOptionRegistered, setIsSubOptionRegistered] = useState(false);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [reviewWrite, setReviewWrite] = useState(false);
    const [reviewCount, setReviewCount] = useState(0);
    
    const dispatch = useDispatch();
    
    const reviewRef = useRef(null);
    const downProduct = () =>{
        const isConfirmed = window.confirm("정말로 상품을 내리시겠습니까?\n내린 상품은 관리자에게 문의하여 재등록 가능합니다.");
        if (!isConfirmed) return;
        if(user)
            axios.get(`${serverIP.ip}/product/downProduct?id=${loc.state.product.id}`, {
        headers:{Authorization:`Bearer ${user.token}`}
    })
    .then(navigate('/product/search'))
    .catch(err => console.log(err));
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
        const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
        axios.get(`${serverIP.ip}/product/getOption?id=${loc.state.product.id}`, {
            headers
        })
        .then(res => {
            setTotalQuantity(res.data[0].product.quantity);
            setOptions(res.data);
        })
        .catch(err => console.log(err));
        getWish();
    }, []);

    // 리뷰 개수 구하기
    useEffect(()=>{
        const prod = loc.state.product ? loc.state.product : loc.state
        axios.get(`${serverIP.ip}/review/productReviewList?productId=${prod.id}`)
        .then(res=>{
            setReviewCount(res.data.length);
        })
        .catch(err => console.log(err));
    },[]);

    // 평균 별점 구하기 
    const [averageStar, setAverageStar] = useState(null);
    useEffect(() => {
        getAverageStar();
    }, []);
    const getAverageStar = () => {
        axios.get(`${serverIP.ip}/review/averageStar?productId=${loc.state.product.id}`)
            .then(res => {
                setAverageStar(res.data.average);
            })
            .catch(err => console.log(err));
    }
    // 별점 UI 렌더링 함수
    const renderStars = (average) => {
        return (
            <div style={{ display: 'flex', gap: '1px' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                    let fillPercent = 0;

                    const diff = average - (star - 1);
                    if (diff >= 1) {
                        fillPercent = 100;
                    } else if (diff > 0) {
                        fillPercent = diff * 100;
                    } else {
                        fillPercent = 0;
                    }

                    return (
                        <span key={star} style={{ position: 'relative', width: '20px', height: '20px', fontSize: '20px', display: 'inline-block' }}>
                            <FaStar style={{ color: '#C0C0C0', position: 'absolute', top: 0, left: 0, fontSize: '20px', }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    overflow: 'hidden',
                                    width: `${fillPercent}%`,
                                    height: '100%',
                                }}
                            >
                                <FaStar style={{verticalAlign: 'top', color: '#FFD700', fontSize: '20px' }} />
                            </div>
                        </span>
                    );
                })}
            </div>
        );
    };

    useEffect(() => {
        let newTotalPrice = 0;
        selectedItems.forEach(item => {
            const discountPrice = loc.state.product.discountRate === 0
                ? loc.state.product.price
                : loc.state.product.price * (100 - loc.state.product.discountRate) / 100;
            const itemPrice = discountPrice + (item.subOption ? item.subOption.additionalPrice : 0);
            newTotalPrice += itemPrice * item.quantity;
        });

        newTotalPrice -= selectedCoupon;
        newTotalPrice += loc.state.product.shippingFee;
        newTotalPrice = newTotalPrice < 0 ? 0 : newTotalPrice;
        setTotalPrice(newTotalPrice);
    }, [selectedItems, selectedCoupon, loc.state.product.price, loc.state.product.discountRate]);

    const moveBuy = () => {
        if (!isSubOptionRegistered) alert('구매하실 상품을 선택해주세요');
        else {
            if (!user) {
                dispatch(setLoginView(true));
            }
            else {
                if (user.user.id !== loc.state.product.sellerNo.id)
                    navigate('/product/buying', {
                        state: {
                            selectedItems: selectedItems,
                            product: loc.state.product,
                            totalPrice: totalPrice,
                            shippingFee: loc.state.product.shippingFee || 0,
                            selectedCoupon: selectedCoupon || 0,
                        }
                    });
                else {
                    alert('본인의 상품입니다');
                }
            }
        }
    };

    const getWish = () => {
        if (user)
            axios.get(`${serverIP.ip}/interact/getWish?userId=${user.user.id}&productId=${loc.state.product.id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    if (res.data === undefined || res.data === '') {
                        setIsWish(false);
                    } else {
                        setIsWish(true);
                    }
                })
                .catch(err => console.log(err));
    };

    const addWish = () => {
        if (user) {
            if (user.user.id !== loc.state.product.sellerNo.id)
                axios.get(`${serverIP.ip}/interact/addWish?userId=${user.user.id}&productId=${loc.state.product.id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
                    .then(res => setIsWish(true))
                    .catch(err => console.log(err));
            else {
                alert('본인의 상품입니다')
            }
        }
        else {
            dispatch(setLoginView(true));
        }
    };

    const delWish = () => {
        axios.get(`${serverIP.ip}/interact/delWish?userId=${user.user.id}&productId=${loc.state.product.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => setIsWish(false))
            .catch(err => console.log(err));
    };

    const addBasket = () => {
        if (!user) {
            dispatch(setLoginView(true));
            return;
        }
        if (selectedItems.length === 0) {
            alert("장바구니에 담을 상품을 선택해주세요.");
            return;
        }
        if (user.user.id !== loc.state.product.sellerNo.id) {
            const basketItems = selectedItems.map(item => ({
                optionId: item.option.id,
                subOptionId: item.subOption ? item.subOption.id : null,
                quantity: item.quantity
            }));

            axios.post(`${serverIP.ip}/basket/add`, basketItems, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    setAddBasketItems(res.data);
                    if ("success") {
                        alert("장바구니에 상품이 담겼습니다.");
                    } else {
                        alert("장바구니 담기에 실패했습니다.");
                    }
                })
                .catch(err => {
                    console.error("장바구니 추가 오류:", err);
                    if (err.response && err.response.data) {
                        alert(err.response.data);
                    } else {
                        alert("장바구니 담기 중 알 수 없는 오류가 발생했습니다.");
                    }
                });
        }
        else {
            alert('본인의 상품입니다');
        }
    };

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const handleOptionChange = (e) => {
        const selectedId = e.target.value;
        setSelectedOptionId(selectedId);
        const option = options.find(option => option.id == selectedId);
        setSubOptions(option ? option.subOptionCategories : []);
        setSelectedSubOptionId("");
        setQuantity(1);
    };

    const handleSubOptionChange = (e) => {
        setSelectedSubOptionId(e.target.value);
        setQuantity(1);
        setTimeout(() => {
            handleAddItem(e.target.value);
        }, 0);
    };

    const handleAddItem = (overrideSubOptionId = null) => {
        if (!selectedOptionId) {
            alert("대분류를 선택해주세요.");
            return;
        }
    
        const selectedOption = options.find(opt => opt.id == selectedOptionId);
        const actualSubOptionId = overrideSubOptionId ?? selectedSubOptionId;
        let selectedSubOption = null;
    
        if (actualSubOptionId) {
            selectedSubOption = subOptions.find(subOpt => subOpt.id == actualSubOptionId);
        }
    
        if (selectedSubOption && Number(quantity) > selectedSubOption.quantity) {
            alert(`선택한 소분류의 재고가 부족합니다. (현재 재고: ${selectedSubOption.quantity})`);
            return;
        }
    
        const existingItemIndex = selectedItems.findIndex(item => {
            const subOptionMatch = (actualSubOptionId === "" && item.subOption === null) ||
                (item.subOption && String(item.subOption.id) === String(actualSubOptionId));
            return String(item.option.id) === String(selectedOptionId) && subOptionMatch;
        });
    
        if (existingItemIndex > -1) {
            const existingItem = selectedItems[existingItemIndex];
            const newQuantity = Number(existingItem.quantity) + Number(quantity);
    
            if (selectedSubOption && newQuantity > selectedSubOption.quantity) {
                alert(`선택한 소분류의 최대 수량을 초과할 수 없습니다. (최대 재고: ${selectedSubOption.quantity})`);
                return;
            }
    
            const updatedItems = selectedItems.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: newQuantity }
                    : item
            );
            setSelectedItems(updatedItems);
        } else {
            const newItem = {
                option: selectedOption,
                subOption: selectedSubOption,
                quantity: Number(quantity)
            };
            setSelectedItems([...selectedItems, newItem]);
        }
    
        setSelectedOptionId("");
        setSelectedSubOptionId("");
        setSubOptions([]);
        setQuantity(1);
        setIsSubOptionRegistered(true);
    };
    

    const removeItem = (index) => {
        const newItems = [...selectedItems];
        newItems.splice(index, 1);

        const updatedItems = selectedItems.filter((_, i) => i !== index);
        setSelectedItems(newItems);

        const hasRemainingSubOption = updatedItems.some(item => item.subOption !== null);
        if (!hasRemainingSubOption) {
            setIsSubOptionRegistered(false);
        }
    };

    const handleItemQuantityChange = (index, newQuantity) => {
        const updatedItems = selectedItems.map((item, i) => {
            if (i === index) {
                return { ...item, quantity: Number(newQuantity) };
            }
            return item;
        });
        setSelectedItems(updatedItems);
    };

    const inquiry = () => {
        axios.get(`${serverIP.ip}/chat/createChatRoom?userId=${loc.state.product.sellerNo.id}&productId=${loc.state.product.id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => {
            navigate(`/product/chat/${res.data}`)
        })
    }

    const openMessage = (wh, name) => {
        dispatch(setModal({ selected: wh, isOpen: true, selectedItem: name }));

    };

    // changMenu 상태 추가 (상세정보, 리뷰 등등 탭에 들어갈 메뉴들)
    const [changeMenu, setChangeMenu] = useState("detail");
    useEffect(() => {
        const isRefreshed = performance?.navigation?.type === 1 || performance.getEntriesByType("navigation")[0]?.type === 'reload';

        if (!isRefreshed && loc.state.changeMenu !== undefined && loc.state.changeMenu === 'review') {
            setReviewWrite(true);
            setChangeMenu('review');

            setTimeout(() => {
                if (reviewRef.current) {
                    reviewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
        const savedMenu = localStorage.getItem("changeMenu");
        if (savedMenu) {
            setChangeMenu(savedMenu);
            localStorage.removeItem("changeMenu");
        }
    }, []);

    const moveEdit = () => {
        navigate('/product/edit', {state:{product:loc.state.product, options:options, images: loc.state.product.images}});
    }

    return (
        <>
            <div style={{ paddingTop: "140px" }}>

                <div className="product-info-container">
                    <div className="product-info-left">
                        <img
                            id="product-big-img"
                            src={`${serverIP.ip}/uploads/product/${loc.state.product.id}/${loc.state.product.images[imageIndex].filename}`}
                            alt="상품 이미지"
                        />
                        <ul className="product-thumbnail-list">
                            {loc.state.product.images.map((img, idx) => (
                                <li key={idx} className={`thumbnail-item ${idx === imageIndex ? "active" : ""}`}>
                                    <img
                                        src={`${serverIP.ip}/uploads/product/${loc.state.product.id}/${img.filename}`}
                                        alt={`Thumbnail ${idx}`}
                                        onClick={() => setImageIndex(idx)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="product-info-right">

                        <div style={{
                            marginTop: "5px", padding: "4px 8px", display: "inline-block",
                            marginLeft: '50px',
                            borderRadius: "5px", fontSize: "12px", fontWeight: "600",
                            backgroundColor: loc.state.product.shippingFee === 0 ? "#ff4d4d" : "#f2f2f2",
                            color: loc.state.product.shippingFee === 0 ? "white" : "black",
                            minHeight: "20px",
                            lineHeight: "20px" // 가운데 정렬
                        }}>
                            {loc.state.product.shippingFee === 0 ? "🚚 무료배송" : `배송비 ${loc.state.product.shippingFee}원`} {/* 배송비 */}
                        </div>
                        {loc.state.product.state === 'SOLDOUT' &&
                            <div style={{
                                marginTop: "5px", padding: "4px 8px", display: "inline-block",
                                marginLeft: '10px',
                                borderRadius: "5px", fontSize: "12px", fontWeight: "600",
                                backgroundColor: 'gray',
                                color: loc.state.product.shippingFee === 0 ? "white" : "black",
                                minHeight: "20px",
                                lineHeight: "20px" // 가운데 정렬
                            }}>
                                품절
                            </div>
                        }
                        {loc.state.product.state === 'PAUSE' &&
                            <div style={{
                                marginTop: "5px", padding: "4px 8px", display: "inline-block",
                                marginLeft: '10px',
                                borderRadius: "5px", fontSize: "12px", fontWeight: "600",
                                backgroundColor: 'gray',
                                color: loc.state.product.shippingFee === 0 ? "white" : "black",
                                minHeight: "20px",
                                lineHeight: "20px" // 가운데 정렬
                            }}>
                                정지
                            </div>
                        }
                        <ul>
                            <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className='product-profile-box'>
                                    <img id={`mgx-${loc.state.product.sellerNo.id}`} className='message-who' src={loc.state.product.sellerNo.uploadedProfileUrl ? `${serverIP.ip}${loc.state.product.sellerNo.uploadedProfileUrl}` : `${loc.state.product.sellerNo.kakaoProfileUrl.indexOf('http')===-1 ? `${serverIP.ip}${loc.state.product.sellerNo.kakaoProfileUrl}`:loc.state.product.sellerNo.kakaoProfileUrl }`} alt='' width={40} height={40} style={{ borderRadius: '100%', backgroundColor: 'white', border: '1px solid gray' }} />
                                    <div id={`mgx-${loc.state.product.sellerNo.id}`} className='message-who' style={{ height: '40px', lineHeight: '40px', marginLeft: '5px' }}>{loc.state.product.sellerNo.username} &gt;</div>
                                </div>
                                {/* 평균 별점 */}
                                {averageStar !== null ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {/* 별점 표시 */}
                                            {renderStars(averageStar)}
                                            <p
                                                style={{
                                                    marginLeft: '8px',
                                                    fontSize: '13px',
                                                    color: '#555',
                                                    fontWeight: '600',
                                                    lineHeight: '24px', // 텍스트와 별 사이 간격 조정
                                                }}
                                            >
                                                {averageStar.toFixed(1)} / 5
                                            </p>
                                        </div>
                                    </>
                                ) : null}
                            </li>
                            <li style={{ display: 'flex', marginTop: '20px', fontSize: '25px', lineHeight: '30px' }}>
                                <div className='product-info-name' style={user && user.user.id !== loc.state.product.sellerNo.id ? {width: '80%'} : {width: '100%'}}>
                                    {loc.state.product.productName}
                                </div>
                                {user && user.user.id !== loc.state.product.sellerNo.id &&
                                    <div className='product-wish'>
                                        {!isWish ? (
                                            <div className="wishlist-icon" onClick={() => { addWish() }}>
                                                <FaHeart />
                                                <span>좋아요</span>
                                            </div>
                                        ) : (
                                            <div className="wishlist-icon" onClick={() => { delWish() }} style={{ color: 'rgb(255, 70, 70)' }}>
                                                <FaHeart />
                                                <span>좋아요</span>
                                            </div>
                                        )}
                                        <div className="inquiry-icon" onClick={() => { inquiry() }}>
                                            <FaRocketchat />
                                            <span>문의하기</span>
                                        </div>

                                    </div>}
                            </li>
                            <li>
                                <ul className='product-info-main-box'>
                                    {loc.state.product.discountRate !== 0 && (
                                        <li>
                                            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{loc.state.product.discountRate}%</span>
                                            <span style={{ textDecoration: 'line-through', marginLeft: '15px', color: 'gray' }}>
                                                &nbsp;{formatNumberWithCommas(loc.state.product.price)}원&nbsp;
                                            </span>
                                        </li>
                                    )}
                                    <li><span style={{ fontWeight: 'bold', fontSize: '24px' }}>{loc.state.product.discountRate === 0 ? formatNumberWithCommas(loc.state.product.price) : formatNumberWithCommas(loc.state.product.price * (100 - loc.state.product.discountRate) / 100)}</span> 원</li>
                                    <li>
                                    </li>
                                    {(loc.state.product.discountRate !== 0 || selectedCoupon !== 0) &&
                                        <li className='info-coupon-box' style={{ color: '#d34141', border: '1px solid #ddd', width: '90%', margin: '15px 0px 15px 20px', borderRadius: '10px' }}>
                                            {loc.state.product.discountRate !== 0 && <div>상품 할인가: -{formatNumberWithCommas(loc.state.product.discountRate * loc.state.product.price / 100)}원</div>}
                                            {loc.state.product.shippingFee !== 0 && <div style={{ color: '#0288D1' }}>배송비: +{formatNumberWithCommas(loc.state.product.shippingFee)}원</div>}
                                            {selectedCoupon !== 0 && <div>쿠폰: -{selectedCoupon}원</div>}
                                        </li>
                                    }
                                    <li>
                                        <select className='info-product-info-selectbox' onChange={handleOptionChange} value={selectedOptionId}>
                                            <option value="" disabled selected>대분류를 선택해주세요</option>
                                            {options.map((option) => (
                                                <option key={option.id} value={option.id}>{option.optionName}</option>
                                            ))}
                                        </select>
                                        {subOptions.length > 0 && (
                                            <>
                                                <select
                                                    style={{ marginLeft: '15px' }}
                                                    className="info-product-info-selectbox"
                                                    onChange={handleSubOptionChange}
                                                    value={selectedSubOptionId}
                                                >
                                                    <option value="" disabled selected>소분류를 선택해주세요</option>
                                                    {subOptions
                                                        .filter(subOption => subOption.quantity > 0)
                                                        .map((subOption) => (
                                                            <option key={subOption.id} value={subOption.id}>
                                                                {subOption.categoryName} (+{formatNumberWithCommas(subOption.additionalPrice)}원)
                                                            </option>
                                                        ))}
                                                </select>
                                            </>
                                        )}
                                    </li>
                                    {selectedItems.length > 0 && (
                                        <li style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                                            <strong>선택한 옵션:</strong>
                                            <ul>
                                                {selectedItems.map((item, index) => {
                                                    const basePrice = loc.state.product.discountRate === 0
                                                        ? loc.state.product.price
                                                        : loc.state.product.price * (100 - loc.state.product.discountRate) / 100;

                                                    const subOptionPrice = item.subOption ? item.subOption.additionalPrice : 0;

                                                    const itemPrice = (basePrice + subOptionPrice) * item.quantity;

                                                    return (
                                                        <>
                                                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: '10px' }}>
                                                                <div>
                                                                    {item.option.optionName}
                                                                    {item.subOption && ` - ${item.subOption.categoryName} (+${formatNumberWithCommas(item.subOption.additionalPrice)}원)`}
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <label style={{ marginRight: '5px' }}>수량:</label>
                                                                        <div style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            border: '1px solid #ccc',
                                                                            borderRadius: '6px',
                                                                            overflow: 'hidden',
                                                                            height: '32px',
                                                                        }}>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                                                                                disabled={item.quantity <= 1}
                                                                                style={{
                                                                                    width: '32px',
                                                                                    height: '32px',
                                                                                    backgroundColor: '#f5f5f5',
                                                                                    border: 'none',
                                                                                    borderRight: '1px solid #ccc',
                                                                                    fontSize: '18px',
                                                                                    cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                                                                    color: item.quantity <= 1 ? '#aaa' : '#333',
                                                                                }}
                                                                            >
                                                                                -
                                                                            </button>

                                                                            <div style={{
                                                                                width: '40px',
                                                                                textAlign: 'center',
                                                                                fontWeight: '500',
                                                                                fontSize: '15px',
                                                                                lineHeight: '32px',
                                                                                backgroundColor: 'white',
                                                                            }}>
                                                                                {item.quantity}
                                                                            </div>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                                                                                disabled={item.quantity >= (item.subOption?.quantity || 10)}
                                                                                style={{
                                                                                    width: '32px',
                                                                                    height: '32px',
                                                                                    backgroundColor: '#f5f5f5',
                                                                                    border: 'none',
                                                                                    borderLeft: '1px solid #ccc',
                                                                                    fontSize: '18px',
                                                                                    cursor: item.quantity >= (item.subOption?.quantity || 10) ? 'not-allowed' : 'pointer',
                                                                                    color: item.quantity >= (item.subOption?.quantity || 10) ? '#aaa' : '#333',
                                                                                }}
                                                                            >
                                                                                +
                                                                            </button>
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeItem(index)}
                                                                            style={{
                                                                                color: 'red',
                                                                                border: 'none',
                                                                                background: 'none',
                                                                                cursor: 'pointer',
                                                                                marginLeft: '10px',
                                                                            }}
                                                                        >
                                                                            <FaTimes />
                                                                        </button>
                                                                    </div>

                                                                </div>
                                                            </li>
                                                            <li style={{ textAlign: 'right', listStyleType: 'none', fontSize: '17px' }}>
                                                                <div>{formatNumberWithCommas(itemPrice)}원</div>
                                                            </li>
                                                        </>
                                                    );
                                                })}
                                            </ul>
                                        </li>
                                    )}
                                </ul>
                            </li>
                            <li>
                                <div style={{ fontSize: '20px', padding: '15px' }} className='total-price'>
                                    <strong>총 금액:</strong> {formatNumberWithCommas(totalPrice)}원
                                </div>
                            </li>
                            { user && user.user.id !== loc.state.product.sellerNo.id ?
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                { loc.state.product.state === 'SELL'&&<>
                                <button className='product-basket-button' onClick={() => addBasket()}>
                                    장바구니
                                </button>
                                <button className='product-buy-button' onClick={() => moveBuy()}>
                                    구매하기
                                </button></>
                                }
                            </li>: <>{ loc.state.product.state!=='PAUSE' && user &&
                            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button className='product-buy-button' onClick={() => moveEdit()}>
                                    상품수정
                                </button>
                                <button className='product-basket-button' onClick={() => downProduct()}>
                                    상품내리기
                                </button>
                            </li>
                            }
                            </>
                            }
                        </ul>
                    </div>
                </div>

                {/* start : 상세정보, 리뷰 */}
                <div className="product-info-menu" style={{ paddingTop: "10%", width: '100%', margin: '0 auto' }}>
                    <div>
                        <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc', margin: '0px' }} />
                        <div style={{
                            display: 'flex',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            <div onClick={()=> setChangeMenu('detail')} className="product-div">상세정보</div>
                            <div onClick={()=> setChangeMenu('review')} className="product-div">리뷰({reviewCount})</div>
                        </div>
                        <hr style={{ border: 'none', height: '1px', backgroundColor: '#ccc', margin: '0px' }} />
                    </div>

                    <div style={{ display: isMobile ? 'block' : 'flex' }}>
                    {/* 상세정보 */}
                    {(isMobile ? changeMenu === 'detail' : true) && (
                        <div
                        className="product-bottom-left"
                        dangerouslySetInnerHTML={{ __html: loc.state.product.detail }}
                        style={{
                            padding: '15px',
                            width: isMobile ? '' : '50%',
                            display: loc.state.product.detail ? 'block' : 'none',
                            overflow:'hidden'
                        }}
                        />
                    )}

                    {/* 리뷰 */}
                    {(isMobile ? changeMenu === 'review' : true) && (
                        <div
                        style={{
                            width: isMobile ? '100%' : '50%',
                            borderLeft: isMobile ? 'none' : '1px solid #ddd'
                        }}
                        >
                        <ProductReview
                            ref={reviewRef}
                            getAverageStar={getAverageStar}
                            averageStar={averageStar}
                            reviewWrite={reviewWrite}
                            setReviewWrite={setReviewWrite}
                        />
                        </div>
                    )}
                    </div>

                    <div className="bell-icon" onClick={() => { openMessage('report', loc.state.product) }}
                        style={{
                            position: 'fixed',
                            right: '20px',
                            bottom: '20px',
                            zIndex: 100,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'white',
                            padding: '8px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    >
                        <FaBell />
                        <span>상품신고</span>
                    </div>
                </div>
                {/* end : 상세정보, 리뷰 */}
            </div>
        </>
    );
}

export default ProductInfo;