import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

function ProductCheck() {
    const location = useLocation();
    const navigate = useNavigate();
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const [agree, setAgree] = useState(false);

    const { productData, files } = location.state || {};

    useEffect(() => {
        if (!productData || !files) {
            alert("잘못된 접근입니다.");
            navigate('/');
        }
    }, [productData, files, navigate]);

    const submitData = () => {
        let newFormData = new FormData();
        
        files.forEach(file => {
            newFormData.append('files', file);
        });

        newFormData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));

        axios.post(`${serverIP.ip}/product/write`, newFormData, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => {
            alert("상품 등록 성공");
            navigate('/product/search');
        })
        .catch(err => console.error("상품 등록 실패:", err));
    };

    return (
        <div className="product-check-container" style={{paddingTop:'150px', width:'50%',margin:'auto'}}>
            <h2 style={{fontSize:'22px', marginBottom:'20px'}}>상품 판매 약관 동의</h2>

            <div style={{
                border: '1px solid #ddd',
                padding: '20px',
                marginBottom: '20px',
                fontSize: '14px',
                lineHeight: '1.6',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px'
            }}>
                <p>본 상품 등록은 판매자 본인의 책임 하에 이루어지며, 상품의 내용, 가격, 배송 등에 대한 모든 법적 책임은 판매자에게 있습니다.</p>
                <p>타인의 권리를 침해하거나 허위/과장 광고를 할 경우 민형사상 책임을 질 수 있습니다.</p>
                <p>상품 등록 전 반드시 관련 법규를 숙지하시기 바랍니다.</p>
            </div>

            <div style={{marginBottom:'30px'}}>
                <label style={{fontSize:'14px', cursor:'pointer'}}>
                    <input 
                        type="checkbox" 
                        checked={agree} 
                        onChange={(e) => setAgree(e.target.checked)}
                        style={{marginRight:'10px'}}
                    />
                    위 약관에 동의합니다.
                </label>
            </div>

            <div style={{marginBottom:'30px'}}>
                <h3 style={{fontSize:'20px', marginBottom:'10px'}}>상품 등록 내용 미리보기</h3>
                <div style={{border:'1px solid #ddd', borderRadius:'8px', padding:'20px', backgroundColor:'#fafafa'}}>
                    <div style={{marginBottom:'10px'}}><strong>상품명:</strong> {productData.productName}</div>
                    <div style={{marginBottom:'10px'}}><strong>가격:</strong> {productData.price.toLocaleString()}원</div>
                    <div style={{marginBottom:'10px'}}><strong>할인율:</strong> {productData.discountRate}%</div>
                    <div style={{marginBottom:'10px'}}><strong>배송비:</strong> {productData.shippingFee.toLocaleString()}원</div>
                    <div style={{marginBottom:'10px'}}><strong>이벤트:</strong> {productData.eventCategory}</div>
                    <div style={{marginBottom:'10px'}}><strong>대상:</strong> {productData.targetCategory}</div>
                    <div style={{marginBottom:'10px'}}><strong>카테고리:</strong> {productData.productCategory}</div>

                    <div style={{marginBottom:'10px'}}>
                        <strong>옵션 목록:</strong>
                        {productData.options.length === 0 ? (
                            <div>없음</div>
                        ) : (
                            productData.options.map((opt, i) => (
                                <div key={i} style={{marginTop:'5px'}}>
                                    <div style={{fontWeight:'bold'}}>{opt.mainOptionName}</div>
                                    {opt.subOptions.map((sub, j) => (
                                        <div key={j} style={{marginLeft:'15px', fontSize:'13px'}}>
                                            - {sub.subOptionName} / 수량: {sub.quantity}개 / 추가금액: {sub.additionalPrice.toLocaleString()}원
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{marginTop:'20px'}}>
                        <strong>썸네일:</strong>
                        <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginTop:'10px'}}>
                            {files.map((file, idx) => (
                                <img 
                                    key={idx}
                                    src={URL.createObjectURL(file)} 
                                    alt="미리보기"
                                    style={{width:'120px', height:'120px', objectFit:'cover', borderRadius:'8px', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={submitData} 
                disabled={!agree}
                style={{
                    backgroundColor: agree ? '#333' : '#aaa',
                    color: 'white',
                    padding: '12px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: agree ? 'pointer' : 'not-allowed',
                    width: '100%',
                    fontSize: '16px'
                }}
            >
                상품 등록하기
            </button>
        </div>
    );
}

export default ProductCheck;
