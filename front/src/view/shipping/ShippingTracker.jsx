import { useState } from "react";

const ShippingTracker = () => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [shippingInfo, setShippingInfo] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = () => {
    fetch(`http://localhost:9977/shipping/track?invoiceNumber=${invoiceNumber}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("조회 실패");
        }
        return res.json();
      })
      .then((data) => {
        setShippingInfo(data);
        setError("");
      })
      .catch((err) => {
        setError("송장 번호를 확인할 수 없습니다.");
        setShippingInfo(null);
      });
  };

  return (
    <div style={{ padding: "80px" }}>
      <h2>배송 조회</h2>
      <input
        type="text"
        value={invoiceNumber}
        onChange={(e) => setInvoiceNumber(e.target.value)}
        placeholder="송장번호 입력"
        style={{ padding: "10px", width: "250px" }}
      />
      <button onClick={handleTrack} style={{ marginLeft: "10px", padding: "10px 20px" }}>
        조회하기
      </button>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {shippingInfo && (
        <div style={{ marginTop: "40px" }}>
          <h3>배송 정보</h3>
          <p><strong>송장번호:</strong> {shippingInfo.invoiceNumber}</p>
          <p><strong>보내는 분:</strong> {shippingInfo.sender}</p>
          <p><strong>받는 분:</strong> {shippingInfo.receiver}</p>
          <p><strong>현재 상태:</strong> {shippingInfo.status}</p>
          <p><strong>현재 위치:</strong> {shippingInfo.location}</p>
          <p><strong>업데이트 시간:</strong> {new Date(shippingInfo.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default ShippingTracker;