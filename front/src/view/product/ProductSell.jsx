import { useState,useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ProductEditor from "./ProductEditor";
import { useNavigate } from "react-router-dom";

function ProductSell() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        productName: "",
        eventCategory: "",
        targetCategory: "",
        productCategory: "",
        subCategories: "",
        detail: "",
        price: "",
        quantity: "",
        discountRate: "",
        options: [],
        shippingFee:""
    });
    
    const addMainOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { mainOptionName: "", quantity: 0, subOptions: [] }]
        }));
    };

    const removeMainOption = (index) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleMainOptionChange = (index, value) => {
        const updatedOptions = [...formData.options];
        updatedOptions[index].mainOptionName = value;
        setFormData({ ...formData, options: updatedOptions });
    };

    const calculateTotalQuantity = () => {
        let totalQuantity = 0;
    
        formData.options.forEach(option => {
            option.subOptions.forEach(subOption => {
                totalQuantity += subOption.quantity;
            });
        });
        return totalQuantity;
    };

    const addSubOption = (index) => {
        const updatedOptions = [...formData.options];
        updatedOptions[index].subOptions.push({ subOptionName: "", quantity: 1, additionalPrice: "" });
        setFormData({ ...formData, options: updatedOptions });
    };

    const removeSubOption = (mainIndex, subIndex) => {
        const updatedOptions = [...formData.options];
        updatedOptions[mainIndex].subOptions = updatedOptions[mainIndex].subOptions.filter((_, i) => i !== subIndex);
        setFormData({ ...formData, options: updatedOptions });
    };

    const handleSubOptionChange = (mainIndex, subIndex, value) => {
        const updatedOptions = [...formData.options];
        updatedOptions[mainIndex].subOptions[subIndex].subOptionName = value;
        setFormData({ ...formData, options: updatedOptions });
    };

    const handleSubOptionQuantityChange = (mainIndex, subIndex, value) => {
        const updatedOptions = [...formData.options];
        updatedOptions[mainIndex].subOptions[subIndex].quantity = parseInt(value, 10) || 0;
        setFormData({ ...formData, options: updatedOptions });
    };

    const handleSubOptionAdditionalPriceChange = (mainIndex, subIndex, value) => {
        // 숫자가 아닌 문자가 포함되었는지 검사
        if (!/^\d*$/.test(value)) {
            alert("금액은 숫자만 입력할 수 있습니다.");
            return;
        }
        const updatedOptions = [...formData.options];
        updatedOptions[mainIndex].subOptions[subIndex].additionalPrice = value;
        setFormData({ ...formData, options: updatedOptions });
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

        if (name === "price" || name === "shippingFee" || name === "discountRate") {
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

    // 대분류 옵션 입력값 유효성 검사 함수
    const validateMainOptions = () => {
        const emptyIndex = formData.options.findIndex(option => {
            return !option.mainOptionName || option.mainOptionName.trim() === "";
        });
    
        if (emptyIndex !== -1) {
            alert("대분류 옵션 이름을 입력해주세요.");
            return false;
        }
        return true;
    };

    const submitProduct = () => {
        /* focus를 위해 각각의 id값 추가 */
        //상품명 검사
        if (!formData.productName) {
            alert("상품명을 입력해주세요.");
            return;
        }

        // 이벤트 카테고리 검사
        if (!formData.eventCategory) {
            alert("이벤트 카테고리를 선택해주세요.");
            return;
        }

        // 대상 카테고리 검사
        if (!formData.targetCategory) {
            alert("대상 카테고리를 선택해주세요.");
            return;
        }

        // 상품 카테고리 검사
        if (!formData.productCategory) {
            alert("상품 카테고리를 선택해주세요.");
            return;
        }

        // 세부 카테고리 검사 
        if (formData.subCategories.length === 0) {
            alert("세부 카테고리를 선택해주세요.");
            return;
        }
        if(formData.options.length === 0) {
            alert("옵션을 추가해주세요.");
            return;
        }
        // 옵션 추가 버튼 클릭시 대분류 옵션 이름이 비어있으면 검사 
        if (!validateMainOptions()) {
            return;
        }
        // 소분류 옵션 추가시에 소분휴 이름이 비어있으면 검사
        for (let i = 0; i < formData.options.length; i++) {
            if(formData.options[i].subOptions.length === 0) {
                alert("소분류를 추가해주세요.");
                return;
            }
            for (let j = 0; j < formData.options[i].subOptions.length; j++) {
                let subOption = formData.options[i].subOptions[j];
                if (subOption.subOptionName.trim() === "") {
                    alert("소분류 옵션 이름을 입력해주세요.");
                    return;
                }
        
                if (!subOption.additionalPrice) {
                    alert("소분류 옵션 금액을 입력해주세요.");
                    setTimeout(() => {
                        const inputElement = document.getElementById(`additionalPrice-${i}-${j}`);
                    }, 0);
                    return;
                }
            }
        }

        // 가격 검사 
        if (!formData.price) {
            alert("가격을 입력해주세요.");
            return;
        }

        if (!formData.shippingFee) {
            alert("배송비를 입력해주세요.");
            return;
        }

        // 상세 설명 검사
        if (!formData.detail) {
            alert("상세 설명을 입력해주세요.");
            return;
        }

        // 이미지 검사
        if (files.length === 0) {
            alert("이미지를 최소 1개 이상 선택해주세요.");
            return;
        }

        let new_formData = new FormData();
    
        for (let i = 0; i < files.length; i++) {
            new_formData.append("files", files[i]);
        }

        const productData = {
            productName: formData.productName,
            eventCategory: formData.eventCategory,
            targetCategory: formData.targetCategory,
            productCategory: formData.subCategories,
            detail: formData.detail,
            price: parseInt(formData.price, 10) || 0,
            quantity: formData.options.length > 0 ? calculateTotalQuantity() : formData.quantity,
            discountRate: parseFloat(formData.discountRate) || 0.0,
            shippingFee:formData.shippingFee,
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

          new_formData.append("product", new Blob([JSON.stringify(productData)], {
            type: "application/json"
          }));
 
        navigate('/product/check', { state: { productData, files } });
    };

    return (
        <div style={{paddingTop:'150px'}}>
        <div className="product-form-container">
            <h2 className="product-form-title">상품 등록</h2>

            <fieldset className="product-fieldset">
                <legend className="product-legend">기본 정보</legend>
                <label className="product-label">상품명</label>
                <input type="text" placeholder="등록할 상품의 이름을 입력해주세요" id="productName" name="productName" className="product-input" value={formData.productName} 
                       onChange={(e) => {
                           if (e.target.value.length > 100) {
                               alert("100글자까지만 입력 가능합니다.");
                           } else {
                               handleChange(e);
                           }
                       }} maxLength="100"
                />
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
                {formData.productCategory && productOptions[formData.productCategory] && (
                    <>
                    <div className="product-checkbox-group">
                        <div className="product-checkbox-title">세부 카테고리 선택</div>
                        <div>
                        {productOptions[formData.productCategory].map((sub) => (
                            <label key={sub} className="product-checkbox-label">
                                <input
                                    type="checkbox"
                                    name="subCategories"
                                    value={sub}
                                    checked={formData.subCategories === sub} // 체크박스 → 한개만 선택되도록 
                                    onChange={() => handleSubCategoryChange(sub)}
                                />
                                {sub}
                            </label>
                        ))}
                        </div>
                    </div>
                    <div style={{fontSize:'13px', color:'#888', marginBottom: '20px', padding: '0 20px'}}>
                        세부 카테고리를 고른후 1개 이상의 대분류 옵션과 1개 이상의 소분류 옵션을 설정하세요<br/>
                        각 소분류 옵션에는 설정 가격 + 추가금액 으로 가격이 산정됩니다.
                    </div>
                    </>
                )}     
                    {formData.subCategories && (
                        <>
                            <button type="button" onClick={addMainOption} className="option-button">옵션 추가</button>
                            <div className="option-container">
                                {formData.options.map((option, mainIndex) => (
                                    <div key={mainIndex} style={{ marginBottom: "15px" }}>
                                        <input
                                            type="text"
                                            id={`mainOption-${mainIndex}`} // 각 대분류 옵션에 고유 id 추가
                                            value={option.optionName}
                                            onChange={(e) => handleMainOptionChange(mainIndex, e.target.value)}
                                            placeholder="EX) 빨강"
                                            className="option-input-style"
                                        />

                                        <button type="button" onClick={() => addSubOption(mainIndex)} className="option-button">+ 소분류 옵션 추가</button>
                                        <button type="button" onClick={() => removeMainOption(mainIndex)} className="option-delete-button">대분류 삭제</button>
                                        <div style={{ marginLeft: "20px" }}>
                                            {option.subOptions.map((subOption, subIndex) => (
                                                <div key={subIndex}>
                                                    <input
                                                        type="text"
                                                        value={subOption.subOptionName}
                                                        onChange={(e) => handleSubOptionChange(mainIndex, subIndex, e.target.value)}
                                                        placeholder="EX) XL"
                                                        className="option-input-style"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={subOption.quantity}
                                                        onChange={(e) => handleSubOptionQuantityChange(mainIndex, subIndex, e.target.value)}
                                                        placeholder="수량"
                                                        min="1"
                                                        className="option-input-style"
                                                    />
                                                    <input
                                                        type="text"
                                                        id={`additionalPrice-${mainIndex}-${subIndex}`} // 고유한 ID 값 설정
                                                        value={subOption.additionalPrice}
                                                        onChange={(e) => handleSubOptionAdditionalPriceChange(mainIndex, subIndex, e.target.value)}
                                                        placeholder="추가 금액"
                                                        min="1"
                                                        className="option-input-style"
                                                    />
                                                     <button type="button" onClick={() => removeSubOption(mainIndex, subIndex)} className="option-delete-button">소분류 삭제</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                <label className="product-label">가격</label>
                <input type="text" id="price" name="price" className="product-input" value={formData.price} onChange={handleChange} maxLength="50"/>

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
                <label className="product-label">할인율</label>
                <input 
                    type="number" 
                    id="discountRate" 
                    name="discountRate" 
                    className="product-input" 
                    value={formData.discountRate} 
                    onChange={handleChange} 
                    max="40"
                    min="0"
                    step="1"
                    /> 
                    <label className="product-label">배송비</label>
                    <input type="text" id="shippingFee" name="shippingFee" className="product-input" value={formData.shippingFee} onChange={handleChange} />
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
            <button onClick={(()=>submitProduct())} style={{ 
                        marginTop:'30px',
                        width:'100%',
                        backgroundColor: '#333', 
                        color: 'white', 
                        padding: '10px 15px', 
                        border: 'none', 
                        cursor: 'pointer',
                        borderRadius: '5px'
                    }} >상품 등록</button>
        </div>
        </div>
    );
}

export default ProductSell;
