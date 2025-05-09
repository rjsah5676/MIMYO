import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import '../../../css/address.css';
import { setModal } from "../../../store/modalSlice";

function MyDeliveries() {
    let serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const modal = useSelector((state) => state.modal);
    // 배송지 목록을 저장할 상태
    const [addressList, setAddressList] = useState([]);

    const [recipientName, setRecipientName] = useState("");
    const [address, setAddress] = useState("");
    const [addressDetail, setAddressDetail] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [tel, setTel] = useState("");
    const [addressType, setType] = useState("HOME");
    const [isAddressFormVisible, setIsAddressFormVisible] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    // 배송지 목록을 가져오는 함수
    useEffect(() => {
        if (user)
            axios.get(`${serverIP.ip}/mypage/getAddrList`, {
                headers : {Authorization:`Bearer ${user.token}`}
            })
            .then((res) => {
                setAddressList(res.data);
            })
            .catch((error) => {
                console.error("Error fetching deliveries:", error);
            });
    }, [user, serverIP]);

    function ENUUUM(a) {
        if (a === 'HOME') return '집'
        if (a === 'COMPANY') return '회사'
        if (a === 'OTHER') return '기타'
    }

    const dispatch = useDispatch();

    const openPost = () => {
        dispatch(setModal({ isOpen: !modal.isOpen, selected: "DaumPost" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newAddress = { recipientName, address: modal.info.address, addressDetail, zipcode: modal.info.zonecode, tel, addressType };
        // 새로운 주소 등록 처리
        if (user)
            axios.post(`${serverIP.ip}/mypage/insertAddrList`, newAddress, {
                headers: { Authorization: `Bearer ${user.token}` },
            })
            .then(res => {
                setAddressList(prev => [...prev, res.data]);
                setRecipientName("");
                setAddress("");
                setAddressDetail("");
                setZipcode("");
                setTel("");
                setType("HOME");
                setIsAddressFormVisible(false);
            })
            .catch(err => {
                console.error("주소 추가 실패:", err);
            });
    };

    // 배송지 등록폼과 포커스 주기
    const addressFormRef = useRef(null);
    const modalTitleRef = useRef(null);
    const handleShowForm = () => {
        setIsAddressFormVisible(true);
        setTimeout(() => {
            if (modalTitleRef.current) {
                modalTitleRef.current.focus();
            }
        }, 0);
    };

    // 주소 삭제 함수
    const handleDelete = (addressId) => {
        const isConfirmed = window.confirm("정말로 삭제하시겠습니까?");
        if(isConfirmed){
            if (user)
                axios.get(`${serverIP.ip}/mypage/deleteAddr`, {
                    params: { id: addressId },
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                    if(res.data==="deleteAddrOk"){
                        alert("삭제되었습니다.");
                        // 삭제 후 상태 갱신 (주소 리스트 다시 받아오기)
                        setAddressList(prev => prev.filter(item => item.id !== addressId));
                    }else{
                        alert("실패하였습니다.");
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    };

    const resetAddressForm = () => {
        setRecipientName("");
        setAddress("");
        setAddressDetail("");
        setZipcode("");
        setTel("");
        setType("HOME");
        dispatch(setModal({ isOpen: false, selected: "", info: {} }));
        setIsAddressFormVisible(false);
    };

    return(
        <>
            <div className="address-box">
                <div className="address-form" style={{margin:'0', padding:'0'}}>
                    <button className="add-address-button" onClick={handleShowForm}>+ 배송지 등록</button>
                    {addressList.length > 0 ? (
                        <div>
                            <ul className="mypage-address-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                                <li>번호</li>
                                <li>수령인</li>
                                <li>주소</li>
                                <li>상세 주소</li>
                                <li>전화번호</li>
                                <li>구분</li>
                                <li>삭제</li>
                            </ul>
                        {addressList
                        .filter((addressItem)=>addressItem.addressState !== "DELETED")
                        .map((addressItem, index) => (
                            <ul className="mypage-address-list" key={addressItem.id}>
                                <li style={{lineHeight:'80px'}}>{index+1}</li>
                                <li style={{lineHeight:'80px'}}>{addressItem.recipientName}</li>
                                <li style={{lineHeight:'80px'}}>{addressItem.address}</li>
                                <li style={{lineHeight:'80px'}}>{addressItem.addressDetail}</li>
                                <li style={{lineHeight:'80px'}}>{addressItem.tel}</li>
                                <li style={{lineHeight:'80px'}}>{ENUUUM(addressItem.addressType)}</li>
                                <li onClick={() => handleDelete(addressItem.id)} style={{ lineHeight:'80px', cursor: "pointer", color: "red" }}>❌</li>
                            </ul>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <p>등록된 배송지가 없습니다.</p>
                        </div>
                    )}

                    {isAddressFormVisible && (
                        <div className="address-form-modal" ref={addressFormRef}>
                            <h3 ref={modalTitleRef} tabIndex={-1}>배송지 등록</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <label>우편번호</label>
                                    <div className="zipcode-wrapper">
                                        <input
                                            className="input-field zipcode-input"
                                            type="text"
                                            value={modal.info && modal.info.zonecode}
                                            readOnly
                                        />
                                        <button type="button" className="zipcode-search-button" onClick={openPost}>
                                            우편번호 찾기
                                        </button>
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <label>주소</label>
                                    <input style={{ width: '90%' }}
                                        className="input-field"
                                        type="text"
                                        value={modal.info && modal.info.address}
                                        readOnly
                                    />
                                </div>
                                <div className="form-grid">
                                    <label>상세 주소</label>
                                    <input style={{ width: '90%' }}
                                        className="input-field"
                                        type="text"
                                        value={addressDetail}
                                        onChange={(e) => setAddressDetail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-grid">
                                    <label>수령인 이름</label>
                                    <input style={{ width: '90%' }}
                                        className="input-field"
                                        type="text"
                                        value={recipientName}
                                        onChange={(e) => setRecipientName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-grid">
                                    <label>전화번호</label>
                                    <input style={{ width: '90%' }}
                                        className="input-field"
                                        type="text"
                                        value={tel}
                                        onChange={(e) => setTel(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-grid">
                                    <label>구분</label>
                                    <select style={{ width: '25%' }}
                                        className="input-field"
                                        onChange={(e) => setType(e.target.value)} >
                                        <option value="HOME">집</option>
                                        <option value="COMPANY">회사</option>
                                        <option value="OTHER">기타</option>
                                    </select>
                                </div>
                                <div className="address-button-container">
                                    <button type="submit" className="button">등록</button>
                                    <button type="button" className="cancel-button" onClick={resetAddressForm}>취소</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>            
    );
}

export default MyDeliveries;
