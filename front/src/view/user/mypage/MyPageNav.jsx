import { useNavigate } from "react-router-dom";

function MyPageNav({ path, isOpen, closeNav }) {
    const clickedStyle = { fontWeight: "bold", backgroundColor: "#555" };
    const clickedStyle2 = { fontWeight: "bold", color: "#fff" };
    const navigate = useNavigate();

    const handleClick = (url) => {
        navigate(url);
        if (closeNav) closeNav();
      };

    return (
        <>
            {isOpen && <div className="mypage-overlay"/>}
            <div className={`mypage-nav ${isOpen ? 'open' : ''}`}>
                <ul>
                    <li>내 정보</li>
                    <li onClick={() =>  handleClick("/mypage/profile")} style={path.l_name === "프로필" ? clickedStyle : {}}>
                        <span style={path.l_name === "프로필" ? clickedStyle2 : {}}>프로필</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/edit")} style={path.l_name === "개인 정보 수정" ? clickedStyle : {}}>
                        <span style={path.l_name === "개인 정보 수정" ? clickedStyle2 : {}}>개인 정보 수정</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/deliveries")} style={path.l_name === "배송지 관리" ? clickedStyle : {}}>
                        <span style={path.l_name === "배송지 관리" ? clickedStyle2 : {}}>배송지 관리</span>
                    </li>
                </ul>
                <ul>
                    <li>나의 활동</li>
                    <li onClick={() => handleClick("/mypage/reviews")} style={path.l_name === "리뷰 관리" ? clickedStyle : {}}>
                        <span style={path.l_name === "리뷰 관리" ? clickedStyle2 : {}}>리뷰 관리</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/reports")} style={path.l_name === "신고 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "신고 내역" ? clickedStyle2 : {}}>신고 내역</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/inquiries")} style={path.l_name === "문의 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "문의 내역" ? clickedStyle2 : {}}>문의 내역</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/chatting")} style={path.l_name === "채팅 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "채팅 내역" ? clickedStyle2 : {}}>채팅 내역</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/follow")} style={path.l_name === "팔로우 목록" ? clickedStyle : {}}>
                        <span style={path.l_name === "팔로우 목록" ? clickedStyle2 : {}}>팔로우 목록</span>
                    </li>
                </ul>

                <ul>
                    <li>거래 내역</li>
                    <li onClick={() => handleClick("/mypage/purchases")} style={path.l_name === "주문 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "주문 내역" ? clickedStyle2 : {}}>주문 내역</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/sales")} style={path.l_name === "판매 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "판매 내역" ? clickedStyle2 : {}}>판매 내역</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/settles")} style={path.l_name === "정산 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "정산 내역" ? clickedStyle2 : {}}>정산 내역</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/buybid")} style={path.l_name === "구매 입찰 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "구매 입찰 내역" ? clickedStyle2 : {}}>구매 입찰 내역</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/sellbid")} style={path.l_name === "판매 입찰 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "판매 입찰 내역" ? clickedStyle2 : {}}>판매 입찰 내역</span>
                    </li>
                </ul>

                <ul>
                    <li>보관함</li>
                    <li onClick={() => handleClick("/mypage/basket")} style={path.l_name === "장바구니" ? clickedStyle : {}}>
                        <span style={path.l_name === "장바구니" ? clickedStyle2 : {}}>장바구니</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/wishlist")} style={path.l_name === "찜 목록" ? clickedStyle : {}}>
                        <span style={path.l_name === "찜 목록" ? clickedStyle2 : {}}>찜 목록</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/coupons")} style={path.l_name === "쿠폰함" ? clickedStyle : {}}>
                        <span style={path.l_name === "쿠폰함" ? clickedStyle2 : {}}>쿠폰함</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/points")} style={path.l_name === "적립 내역" ? clickedStyle : {}}>
                        <span style={path.l_name === "적립 내역" ? clickedStyle2 : {}}>적립 내역</span>
                    </li>
                </ul>

                <ul>
                    <li>통계</li>
                    <li onClick={() => handleClick("/mypage/activity")} style={path.l_name === "활동 통계" ? clickedStyle : {}}>
                        <span style={path.l_name === "활동 통계" ? clickedStyle2 : {}}>활동 통계</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/order")} style={path.l_name === "구매 통계" ? clickedStyle : {}}>
                        <span style={path.l_name === "구매 통계" ? clickedStyle2 : {}}>구매 통계</span>
                    </li>
                    <li onClick={() => handleClick("/mypage/salesstat")} style={path.l_name === "판매 통계" ? clickedStyle : {}}>
                        <span style={path.l_name === "판매 통계" ? clickedStyle2 : {}}>판매 통계</span>
                    </li>
                </ul>
            </div>
        </>
    );
}

export default MyPageNav;
