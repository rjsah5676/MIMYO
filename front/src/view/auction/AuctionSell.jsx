import { useState,useRef, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ProductEditor from '../product/ProductEditor';
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { forwardRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { ko } from 'date-fns/locale';

const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <div 
      onClick={onClick} 
      ref={ref}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 15px',
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: 'white',
        cursor: 'pointer',
        fontSize: '16px',
      }}
    >
      <span style={{ color: value ? '#000' : '#aaa' }}>
        {value || "날짜를 선택하세요"}
      </span>
      <FaCalendarAlt style={{ marginLeft: '10px', color: '#888' }} />
    </div>
));

function AuctionSell() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [endTime, setEndTime] = useState(new Date());
    const [formData, setFormData] = useState({
        subject:"",
        productName: "",
        eventCategory: "",
        targetCategory: "",
        productCategory: "",
        subCategories: "",
        detail: "",
        first_price: "",
        buy_now_price:"",
        deposit:"",
        options: [],
        shippingFee:"",
        endTime:"",
    });
    
    useEffect(() => {
        const now = new Date();
        const twoDaysLater = new Date(now);
        twoDaysLater.setDate(now.getDate() + 2);  // 2일 후  나중에 +2로바꾸기 테스트용 0
        twoDaysLater.setHours(twoDaysLater.getHours() + 9);
   
        const twoDaysLaterString = twoDaysLater.toISOString().slice(0, 16);

        setFormData({
          ...formData, endTime: twoDaysLaterString,
        });
    }, []);

     const now = new Date();
    const oneDayLater = new Date(now);
    oneDayLater.setDate(now.getDate() + 1);  // 1일 후

    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(now.getDate() + 7);  

    const nowString = now.toISOString().slice(0, 16);  // 현재 시간
    const oneDayLaterString = oneDayLater.toISOString().slice(0, 16);  // 1일 후의 시간
    const twoDaysLaterString = twoDaysLater.toISOString().slice(0, 16); 


    const calculateTotalQuantity = () => {
        let totalQuantity = 0;
    
        formData.options.forEach(option => {
            option.subOptions.forEach(subOption => {
                totalQuantity += subOption.quantity;
            });
        });
        return totalQuantity;
    };

    const eventOptions = ["생일", "결혼", "졸업", "시험", "출산","기념일","기타"];
    const targetOptions = ["여성", "남성", "연인", "직장동료", "부모님", "선생님","친구","기타"];
    const productOptions = {
        "디저트": ["베이커리", "떡", "초콜릿","사탕","전통간식", "음료"],
        "수제먹거리": ["건강식품", "간편식", "가공식품", "반찬", "소스/장류"],
        "농축수산물": ["과일/채소", "잡곡/견과", "정육/계란", "수산물"],
        "의류": ["홈웨어/언더웨어", "티셔츠/니트","셔츠","바지/스커트", "아우터"],
        "패션잡화": ["신발", "모자", "가방", "지갑","파우치","악세사리"],
        "홈인테리어": ["가구", "꽃", "캔들", "홈데코"],
        "주방/생활": ["주방용품", "욕실"],
        "케이스": ["폰케이스", "노트북케이스"],
        "문구": ["인형", "장난감", "다이어리", "노트", "필기도구","키링"],
        "일러스트/사진": ["드로잉", "사진"],
        "화장품": ["네일", "메이크업", "향수"],
        "기타": ["기타"]
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "first_price" || name === "shippingFee" || name === "buy_now_price") {
            if (!/^\d*\.?\d*$/.test(value)) {
                alert("숫자만 입력할 수 있습니다.");
                return;
            }
        }
        if (name === "discountRate") {
            const numericValue = Math.min(40, Math.max(0, parseFloat(value)));
            setFormData({
              ...formData,
              [name]: numericValue,
            });
          } else {
            setFormData({
              ...formData,
              [name]: value,
            });
          }
    };

    const handleCategoryChange = (e) => {
        setFormData({
            ...formData,
            productCategory: e.target.value,
            subCategories: "",
            options: []
        });
    };

    const handleSubCategoryChange = (sub) => {
        setFormData((prev) => ({
            ...prev,
            subCategories: prev.subCategories === sub ? "" : sub,
            options: []
        }));
    };

    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const changeFile = (e) => {
        handleFiles(e.target.files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (selectedFiles) => {
        const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("image/"));
        if (imageFiles.length !== selectedFiles.length) {
            alert("이미지 파일만 업로드 가능합니다.");
        }
        setFiles(prevFiles => [...prevFiles, ...imageFiles]);
    };

    const removeFile = (fileToRemove) => {
        setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };

    const submitProduct = () => {
        if (!formData.productName) {
            alert("상품명을 입력해주세요.");
            setTimeout(() => document.getElementById("productName").focus(), 0);
            return;
        }
        if (!formData.eventCategory) {
            alert("이벤트 카테고리를 선택해주세요.");
            setTimeout(() => document.getElementById("eventCategory").focus(), 0);
            return;
        }
        if (!formData.targetCategory) {
            alert("대상 카테고리를 선택해주세요.");
            setTimeout(() => document.getElementById("targetCategory").focus(), 0);
            return;
        }
        if (!formData.productCategory) {
            alert("상품 카테고리를 선택해주세요.");
            setTimeout(() => document.getElementById("productCategory").focus(), 0);
            return;
        }
        if (!formData.detail) {
            alert("상세 설명을 입력해주세요.");
            return;
        }
        if (!formData.shippingFee) {
            alert("배송비를 입력해주세요.");
            return;
        }
        if (files.length === 0) {
            alert("이미지를 최소 1개 이상 선택해주세요.");
            return;
        }
        const firstPrice = parseInt(formData.first_price, 10) || 0;
        const buyNowPrice = parseInt(formData.buy_now_price, 10) || 0;
        
        if (buyNowPrice > 0 && firstPrice < buyNowPrice / 5) {
            alert("시작 가격은 즉시 구매가의 1/5 이상이어야 합니다.");
            return;
        }
    
        // 여기부터 navigate
        const adjustedEndTime = new Date(endTime.getTime() + 9 * 60 * 60 * 1000);

        const productData = {
            productName: formData.productName,
            eventCategory: formData.eventCategory,
            targetCategory: formData.targetCategory,
            productCategory: formData.productCategory,
            detail: formData.detail,
            firstPrice: parseInt(formData.first_price, 10) || 0,
            buyNowPrice: parseInt(formData.buy_now_price, 10) || 0,
            shippingFee: formData.shippingFee,
            endTime: adjustedEndTime.toISOString().slice(0, 16),
            deposit: parseInt(formData.buy_now_price * 0.1) || 0,
            options: formData.options.map(option => ({
                mainOptionName: option.mainOptionName,
                quantity: option.quantity,
                subOptions: option.subOptions.map(subOption => ({
                    subOptionName: subOption.subOptionName,
                    quantity: subOption.quantity,
                    additionalPrice: subOption.additionalPrice
                })),
            })),
        };
    
        navigate('/auction/check', { state: { productData, files } });
    };
    

    return (
        <div style={{paddingTop:'150px'}}>
        <div className="product-form-container">
            <h2 className="product-form-title">경매 상품 등록</h2>

            <fieldset className="product-fieldset">
                <legend className="product-legend">기본 정보</legend>
                <label className="product-label">상품명</label>
                <input type="text" id="productName" name="productName" className="product-input" value={formData.productName} onChange={handleChange} />
            </fieldset>

            <fieldset className="product-fieldset">
                <legend className="product-legend">상품 정보</legend>
                <label className="product-label">이벤트</label>
                <select id="eventCategory" name="eventCategory" className="product-select" value={formData.eventCategory} onChange={handleChange}>
                    <option value="">선택</option>
                    {eventOptions.map((event) => (
                        <option key={event} value={event}>{event}</option>
                    ))}
                </select>

                <label className="product-label">대상</label>
                <select id="targetCategory" name="targetCategory" className="product-select" value={formData.targetCategory} onChange={handleChange}>
                    <option value="">선택</option>
                    {targetOptions.map((target) => (
                        <option key={target} value={target}>{target}</option>
                    ))}
                </select>

                <label className="product-label">상품 카테고리</label>
                <select id="productCategory" name="productCategory" className="product-select" value={formData.productCategory} onChange={handleCategoryChange}>
                    <option value="">선택</option>
                    {Object.keys(productOptions).map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                
                    
                <label className="product-label">수량</label>
                <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        disabled
                        className="product-input"
                        placeholder="수량은 옵션 선택시 자동 산정됩니다."
                        value={formData.options.length > 0 ? calculateTotalQuantity() : formData.quantity}
                        readOnly={formData.options.length > 0}
                        onChange={handleChange}
                    /> 
                <label className="product-label">시작 가격</label>
                <input type="text" id="first_price" name="first_price" className="product-input" value={formData.first_price} onChange={handleChange} />

                <label className="product-label">즉시 구매 가격</label>
                <input type="text" id="buy_now_price" name="buy_now_price" className="product-input" value={formData.buy_now_price} onChange={handleChange} />
                    <label className="product-label">배송비</label>
                    <input type="text" id="shippingFee" name="shippingFee" className="product-input" value={formData.shippingFee} onChange={handleChange} />
                    <label className="product-label">보증금</label>
                    <input type="number" id="deposit" name="deposit" className="product-input" readOnly value={parseInt(formData.buy_now_price*0.1)} onChange={handleChange} />
                    <label className="product-label">시작 시간</label>
                    <input type="text" disabled className="product-input" value={'경매 등록 시간으로 설정됩니다.'} onChange={handleChange} />
                    <label className="product-label">종료 시간</label>
                    <DatePicker
                    selected={endTime}
                    onChange={(date) => {
                        setEndTime(date);
                        setFormData(prev => ({
                        ...prev,
                        endTime: date.toISOString().slice(0,16)
                        }));
                    }}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    minDate={oneDayLater}
                    maxDate={twoDaysLater}
                    locale={ko}
                    calendarClassName="custom-calendar"
                    popperPlacement="bottom-start"
                    customInput={<CustomInput />}
                    renderCustomHeader={({
                        date,
                        changeYear,
                        changeMonth,
                        decreaseMonth,
                        increaseMonth,
                        prevMonthButtonDisabled,
                        nextMonthButtonDisabled
                    }) => (
                        <div style={{ display: "flex", justifyContent: "space-between", margin: 10 }}>
                        <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>{'<'}</button>
                        <select
                            value={date.getFullYear()}
                            onChange={({ target: { value } }) => changeYear(value)}
                        >
                            {[2024, 2025, 2026].map((year) => (
                            <option key={year} value={year}>{year}년</option>
                            ))}
                        </select>

                        <select
                            value={date.getMonth()}
                            onChange={({ target: { value } }) => changeMonth(value)}
                        >
                            {["1월", "2월", "3월", "4월", "5월", "6월",
                            "7월", "8월", "9월", "10월", "11월", "12월"].map((month, index) => (
                            <option key={month} value={index}>{month}</option>
                            ))}
                        </select>
                        <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>{'>'}</button>
                        </div>
                    )}
                    />

            </fieldset>

            <fieldset className="product-fieldset">
                <legend className="product-legend">상세 정보</legend>
                <label className="product-label">상세 설명</label>
                <ProductEditor id='content' formData={formData} setFormData={setFormData}/>
                </fieldset>
            <div style={{fontWeight:'bold', marginBottom:'10px',fontSize:'18px'}}>썸네일 등록</div>
            <div 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={handleDrop}
                style={{
                    width: '100%', 
                    height: '150px', 
                    border: '2px dashed #ccc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '10px',
                    cursor: 'pointer'
                }}
                onClick={() => fileInputRef.current.click()}
            >
                이미지를 드래그/선택하여 1~5개 첨부해주세요
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
                        borderRadius: '5px'
                    }} 
                    onClick={() => fileInputRef.current.click()}
                >
                    이미지 선택
                </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {files.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '120px', height: '120px' }}>
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
            <button onClick={()=>submitProduct()} style={{ 
                        marginTop:'30px',
                        width:'100%',
                        backgroundColor: '#333', 
                        color: 'white', 
                        padding: '10px 15px', 
                        border: 'none', 
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} >경매 등록</button>
        </div>
        </div>
    );
}

export default AuctionSell;
