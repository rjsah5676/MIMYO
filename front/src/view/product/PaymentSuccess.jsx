import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("결제 처리 중입니다...");
  const [success, setSuccess] = useState(true);

  const user = useSelector((state) => state.auth.user);
  const serverIP = useSelector((state) => state.serverIP);
  const location = useLocation();

  const basketNos = searchParams.get("basketNos")?.split(',').map(Number) || [];

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderIdParam = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");
    const couponId = searchParams.get("couponId");
    const iid = searchParams.get('iid');

    setOrderId(orderIdParam);
    setAmount(amountParam);

    if (user) {
      fetch(`${serverIP.ip}/payment/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          paymentKey,
          orderId: orderIdParam,
          amount: amountParam,
          iid: iid,
          couponId: couponId
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "결제 승인 중 에러 발생");
          }
          return res.json();
        })
        .then((data) => {
          setMsg("✅ 결제가 성공적으로 완료되었습니다.");
          setSuccess(true);

          axios.delete(`${serverIP.ip}/basket/paid/delete`, {
            headers: { Authorization: `Bearer ${user.token}` },
            data: { basketNos }
          }).catch((err) => console.error("삭제 오류:", err));
        })
        .catch((err) => {
          console.error("결제 승인 실패:", err);
          axios.get(`${serverIP.ip}/order/cancel?orderGroupId=${iid}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }).catch(cancelErr => console.error("결제 취소 실패:", cancelErr));
          if (err.message === "quantity_over") {
            setMsg("❌ 결제 실패: 주문 수량보다 재고가 부족합니다.");
          } else {
            setMsg("❌ 결제 중 오류가 발생했습니다.");
          }
          setSuccess(false);
        });
    }
  }, [searchParams]);

  function formatNumberWithCommas(num) {
    return num.toLocaleString();
  }

  return (
    <div className="product-payment-container" style={{ paddingTop: '250px' }}>
      <div className="product-payment-header">
        <h2>{msg}</h2>
      </div>

      {success && (
        <div className="product-payment-info">
          <p className="product-payment-order-id">
            <strong>주문번호:</strong> {orderId}
          </p>
          <p className="product-payment-amount">
            <strong>결제금액:</strong> {formatNumberWithCommas(parseInt(amount, 10))}원
          </p>
          <p className="product-payment-thank-you">
            '{user?.user.username}'님 감사합니다 😊
          </p>
        </div>
      )}

      <div className="product-payment-buttons">
        {success && (
          <button
            onClick={() => navigate("/mypage/purchases")}
            className="product-payment-btn"
          >
            주문 내역으로
          </button>
        )}
        <button
          onClick={() => navigate("/")}
          className="product-payment-btn"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
