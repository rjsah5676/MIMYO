import { useNavigate } from "react-router-dom";

function AdminNav({ path }) {
    const clickedStyle = { fontWeight: "bold", backgroundColor: "#555" };
    const clickedStyle2 = { fontWeight: "bold", color: "#fff" };
    const navigate = useNavigate();

    return (
        <div className="admin-nav">
            <ul>
                <li>관리자 페이지</li>
                <li onClick={() => navigate("/admin/reportlist")} style={path.l_name === "신고 목록" ? clickedStyle : {}}>
                    <span style={path.l_name === "신고 목록" ? clickedStyle2 : {}}>신고 목록</span>
                </li>
                <li onClick={() => navigate("/admin/inquirylist")} style={path.l_name === "문의 목록" ? clickedStyle : {}}>
                    <span style={path.l_name === "문의 목록" ? clickedStyle2 : {}}>문의 목록</span>
                </li>
                <li onClick={() => navigate("/admin/edit")} style={path.l_name === "개인 정보 수정" ? clickedStyle : {}}>
                    <span style={path.l_name === "개인 정보 수정" ? clickedStyle2 : {}}>회원 목록</span>
                </li>
                <li onClick={() => navigate("/admin/adminmember")} style={path.l_name === "회원 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "회원 통계" ? clickedStyle2 : {}}>회원 통계</span>
                </li>
                <li onClick={() => navigate("/admin/adminuseract")} style={path.l_name === "회원 활동 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "회원 활동 통계" ? clickedStyle2 : {}}>회원 활동 통계</span>
                </li>
            </ul>
            <ul>
                <li>매출관리</li>
                <li onClick={() => navigate("/admin/salesbyperiod")} style={path.l_name === "기간별 판매 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "기간별 판매 통계" ? clickedStyle2 : {}}>기간별 판매 통계</span>
                </li>
                <li onClick={() => navigate("/admin/salesbycategory")} style={path.l_name === "상품별 판매 통계" ? clickedStyle : {}}>
                    <span style={path.l_name === "상품별 판매 통계" ? clickedStyle2 : {}}>상품별 판매 통계</span>
                </li>
                <li onClick={() => navigate("/admin/settlementprocessing")} style={path.l_name === "정산 처리" ? clickedStyle : {}}>
                    <span style={path.l_name === "정산 처리" ? clickedStyle2 : {}}>정산 처리</span>
                </li>
            </ul>
            <ul>
                <li>기타 기능</li>
                <li onClick={() => navigate("/admin/sendCoupon")} style={path.l_name === "쿠폰 지급" ? clickedStyle : {}}>
                    <span style={path.l_name === "쿠폰 지급" ? clickedStyle2 : {}}>쿠폰 지급</span>
                </li>
            </ul>

        </div>
    );
}

export default AdminNav;
