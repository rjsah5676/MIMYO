import axios from "axios";
import { useSelector } from "react-redux";
import { useState } from "react";

function AdminCoupon() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const [formData, setFormData] = useState({
        couponName: "",
        userId: "",
        discount: 0
    });

    const changeData = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const giveCoupon = () => {
        if (user)
            axios.post(`${serverIP.ip}/admin/giveCoupon`, formData, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    if (res.data === "no_user") alert("해당 사용자가 없습니다.");
                    else {
                        alert("쿠폰 지급 성공!");
                        window.location.reload();
                    }
                })
                .catch(err => {
                    console.log(err);
                });
    };

    return (
        <div style={{
            maxWidth: "400px",
            margin: "50px auto",
            padding: "30px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            backgroundColor: "white"
        }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>쿠폰 지급하기</h2>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>쿠폰명</label>
                <input
                    type="text"
                    name="couponName"
                    value={formData.couponName}
                    onChange={changeData}
                    style={{
                        width: "95%",
                        padding: "8px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "14px"
                    }}
                />
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>사용자 번호</label>
                <input
                    placeholder="0으로 설정시 모두에게 지급"
                    type="text"
                    name="userId"
                    value={formData.userId}
                    onChange={changeData}
                    style={{
                        width: "95%",
                        padding: "8px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "14px"
                    }}
                />
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>할인 가격</label>
                <input
                    type="text"
                    name="discount"
                    value={formData.discount}
                    onChange={changeData}
                    style={{
                        width: "95%",
                        padding: "8px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        fontSize: "14px"
                    }}
                />
            </div>

            <button
                onClick={giveCoupon}
                style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#444",
                    color: "white",
                    fontSize: "16px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                지급
            </button>
        </div>
    );
}

export default AdminCoupon;
