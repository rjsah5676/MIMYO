import { useSearchParams, useNavigate } from "react-router-dom";

function PaymentFail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "100px" }}>
      <h2>결제 실패</h2>
      <p>
        <strong>실패 코드:</strong> {params.get("code")}
      </p>
      <p>
        <strong>사유:</strong> {params.get("message")}
      </p>
      <button
        onClick={() => navigate("/")}
        style={{ marginTop: "30px", padding: "10px 20px" }}
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

export default PaymentFail;
