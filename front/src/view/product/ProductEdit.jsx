import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import ProductEditor from "./ProductEditor";

function ProductEdit() {
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const { product, options, images } = location.state;

  const [originalImages, setOriginalImages] = useState(images || []);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({});

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      productCategory: e.target.value,
      subCategories: "",
      options: []
    });
  };

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
    if (!/^\d*$/.test(value)) {
      alert("금액은 숫자만 입력할 수 있습니다.");
      return;
    }
    const updatedOptions = [...formData.options];
    updatedOptions[mainIndex].subOptions[subIndex].additionalPrice = value;
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleSubCategoryChange = (sub) => {
    setFormData((prev) => ({
      ...prev,
      subCategories: prev.subCategories === sub ? "" : sub,
      options: []
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const findParentCategory = (subCategory) => {
    for (const [parent, subs] of Object.entries(productOptions)) {
      if (subs.includes(subCategory)) {
        return parent;
      }
    }
    return "";
  };

  const removeOriginalImage = (filename) => {
    setOriginalImages(prev => prev.filter(img => img !== filename));
  };

  useEffect(() => {
    const loadInitialData = async () => {
      if (product && options) {
        const parentCategory = findParentCategory(product.productCategory);
        setFormData({
          id: product.id,
          productName: product.productName || "",
          eventCategory: product.eventCategory || "",
          targetCategory: product.targetCategory || "",
          productCategory: parentCategory || "",
          subCategories: product.productCategory || "",
          detail: product.detail || "",
          price: product.price || "",
          quantity: product.quantity || 0,
          discountRate: product.discountRate || 0,
          shippingFee: product.shippingFee || 0,
          options: options.map(option => ({
            mainOptionName: option.optionName,
            quantity: option.subOptionCategories.reduce((acc, cur) => acc + (cur.quantity || 0), 0),
            subOptions: option.subOptionCategories.map(sub => ({
              subOptionName: sub.categoryName,
              quantity: sub.quantity,
              additionalPrice: sub.additionalPrice
            }))
          })) || []
        });
      }
    };
  
    loadInitialData();
  }, [product, options]);
  

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
  
  const changeFile = (e) => {
    handleFiles(e.target.files);
  };

  const handleFileChange = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitEdit = () => {
    const isConfirmed = window.confirm("정말로 수정하시겠습니까?");
    if (!isConfirmed) return;
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
      if (!formData.subCategories) {
        alert("세부 카테고리를 선택해주세요.");
        return;
      }
    
      // 옵션 검사
      if (formData.options.length === 0) {
        alert("옵션을 추가해주세요.");
        return;
      }
    
      // 대분류 옵션 이름 검사
      const emptyMainIndex = formData.options.findIndex(option => !option.mainOptionName || option.mainOptionName.trim() === "");
      if (emptyMainIndex !== -1) {
        alert("대분류 옵션 이름을 입력해주세요.");
        return;
      }
    
      // 소분류 옵션 이름 및 추가금액 검사
      for (let i = 0; i < formData.options.length; i++) {
        const option = formData.options[i];
        if (option.subOptions.length === 0) {
          alert("소분류를 추가해주세요.");
          return;
        }
        for (let j = 0; j < option.subOptions.length; j++) {
          const subOption = option.subOptions[j];
          if (!subOption.subOptionName.trim()) {
            alert("소분류 옵션 이름을 입력해주세요.");
            return;
          }
          if (subOption.additionalPrice === "") {
            alert("소분류 추가 금액을 입력해주세요.");
            return;
          }
        }
      }
    
      // 가격 검사
      if (!formData.price) {
        alert("가격을 입력해주세요.");
        return;
      }
    
    
      // 상세설명 검사
      if (!formData.detail) {
        alert("상세 설명을 입력해주세요.");
        return;
      }
    
      // 이미지 검사 (기존+새 파일 합쳐서 검사)
      const totalImageCount = originalImages.length + files.length;
      if (totalImageCount === 0) {
        alert("이미지를 최소 1개 이상 등록해주세요.");
        return;
      }
      if (totalImageCount > 5) {
        alert("이미지는 최대 5개까지만 등록할 수 있습니다.");
        return;
      }

    const editedProduct = {
      id: formData.id,
      productName: formData.productName,
      eventCategory: formData.eventCategory,
      targetCategory: formData.targetCategory,
      productCategory: formData.subCategories,
      detail: formData.detail,
      price: formData.price,
      quantity: formData.options.length > 0 ? calculateTotalQuantity() : formData.quantity,
      discountRate: formData.discountRate,
      shippingFee: formData.shippingFee,
      options: formData.options,
      originalImages: originalImages.map(img => img.filename)
    };

    const sendFormData = new FormData();
    files.forEach(file => sendFormData.append("files", file));
    sendFormData.append("product", new Blob([JSON.stringify(editedProduct)], { type: "application/json" }));

    axios.post(`${serverIP.ip}/product/write`, sendFormData, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(() => {
      alert("상품 수정 완료!");
      navigate('/product/search');
    })
    .catch(err => {
      console.error(err);
      alert("수정 실패");
    });
  };
  
  const closeButtonStyle = {
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
  };

  return (
    <div style={{ paddingTop: "150px" }}>
      <div className="product-form-container">
        <h2 className="product-form-title">상품 수정</h2>

        <fieldset className="product-fieldset">
          <label className="product-label">상품명</label>
          <input type="text" value={formData.productName} className="product-input" readOnly />

          <label className="product-label">가격</label>
          <input type="text" value={formData.price} className="product-input" readOnly />

          <label className="product-label">할인율</label>
          <input type="text" value={formData.discountRate} className="product-input" readOnly />

          <label className="product-label">배송비</label>
          <input type="text" value={formData.shippingFee} className="product-input" readOnly />
        </fieldset>

        <fieldset className="product-fieldset">
          <label className="product-label">이벤트</label>
          <select name="eventCategory" value={formData.eventCategory} onChange={handleChange} className="product-select">
            {eventOptions.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          <label className="product-label">대상</label>
          <select name="targetCategory" value={formData.targetCategory} onChange={handleChange} className="product-select">
            {targetOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <label className="product-label">수량</label>
                <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        disabled
                        className="product-input"
                        placeholder="수량은 옵션 선택시 자동 산정됩니다."
                        value={ formData.option && formData.options.length > 0 ? calculateTotalQuantity() : formData.quantity}
                        readOnly={formData.option && formData.options.length > 0}
                        onChange={handleChange}
                    /> 
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
                                            id={`mainOption-${mainIndex}`}
                                            value={option.mainOptionName}
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

          <label className="product-label">상세 설명</label>
          <ProductEditor id="content" formData={formData} setFormData={setFormData} />
        </fieldset>

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
        이미지를 드래그/선택하여 추가해주세요
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
            {originalImages.map((img, idx) => (
                <div key={`original-${idx}`} style={{ position: 'relative', width: '120px', height: '120px' }}>
                <img src={`${serverIP.ip}/uploads/product/${product.id}/${img.filename}`} alt="original-upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span onClick={() => removeOriginalImage(img)} style={closeButtonStyle}>✖</span>
                </div>
            ))}

            {files.map((file, idx) => (
                <div key={`new-${idx}`} style={{ position: 'relative', width: '120px', height: '120px' }}>
                <img src={URL.createObjectURL(file)} alt="new-upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span onClick={() => removeNewFile(idx)} style={closeButtonStyle}>✖</span>
                </div>
            ))}
            </div>

        <button onClick={submitEdit} className="submit-button" style={{ cursor:'pointer', marginTop: '30px', width: '100%', backgroundColor: '#333', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>
          수정하기
        </button>
      </div>
    </div>
  );
}

export default ProductEdit;
