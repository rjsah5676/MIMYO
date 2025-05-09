import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AuctionPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");

  const user = useSelector((state) => state.auth.user);
  const serverIP = useSelector((state) => state.serverIP);

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderIdParam = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");
    const iid = searchParams.get('iid');
    setOrderId(orderIdParam);
    setAmount(amountParam);
    if(user)
      fetch(`${serverIP.ip}/payment/auction/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          paymentKey,
          orderId: orderIdParam,
          amount: amountParam,
          iid: iid
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("결제 성공:", data);
        })
        .catch((err) => {
          console.error("결제 승인 실패:", err);
        });
  }, [searchParams]);

  function formatNumberWithCommas(num) {
    return num.toLocaleString();
  }

  return (
    <div className="product-payment-container" style={{ paddingTop: '250px' }}>
      <div className="product-payment-header">
        <h2>결제가 성공적으로 완료되었습니다</h2>
      </div>

      <div className="product-payment-info">
        <p className="product-payment-order-id">
          <strong>주문번호:</strong> {orderId}
        </p>
        <p className="product-payment-amount">
          <strong>결제금액:</strong> {formatNumberWithCommas(parseInt(amount, 10))}원
        </p>
        <p className="product-payment-thank-you">
          '{ user && user.user.username}'님 감사합니다 😊
        </p>
      </div>

      <div className="product-payment-buttons">
        <button
          onClick={() => navigate("/mypage/purchases")}
          className="product-payment-btn"
        >
          주문 내역으로
        </button>
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

export default AuctionPaymentSuccess;