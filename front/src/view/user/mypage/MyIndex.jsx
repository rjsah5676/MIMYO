import MyPageHeader from "./MyPageHeader";
import MyPageNav from "./MyPageNav";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import MyBasket from "./MyBasket";
import MyReport from "./MyReport";
import MyPurchases from "./MyPurchases";

import '../../../css/view/mypage.css';
import MyWish from "./MyWish";
import MyInquiryList from "./MyInquiryList";
import UserInfo from "../UserInfo";
import MyFollow from "./MyFollow";
import MySell from "./MySell";
import MyChatting from "./MyChatting";
import MyInfoEdit from "./MyInfoEdit";
import MyDeliveries from "./MyDeliveries";
import MyReviewList from "./MyReviewList";
import MyBid from "./MyBid";
import MyActivity from "./MyActivity";
import MyOrder from "./MyOrder";
import MySales from "./MySales";
import MyCoupon from "./MyCoupon";
import MyPoint from "./MyPoint";
import UserDelete from "./UserDelete";
import MySettlement from "../../product/MySettlement";
import MySellBid from "./MySellBid";

function MyIndex(){
    const location = useLocation();
    const [path, setPath] = useState({f_name:'',l_name:''});
    const [hamburgerOpen, setHamburgerOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const isDesktop = windowWidth >= 1280;

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
    
    useEffect(() => {
        window.scrollTo({top:0,left:0,behavior:'smooth'});
        let pathname = location.pathname.split("/");
        let page = pathname[2];
        const pathMap = {
            profile: { f_name: "내 정보", l_name: "프로필" },
            edit: { f_name: "내 정보", l_name: "개인 정보 수정" },
            deliveries: { f_name: "내 정보", l_name: "배송지 관리" },
            posts: { f_name: "나의 활동", l_name: "작성한 글" },
            reviews: { f_name: "나의 활동", l_name: "리뷰 관리" },
            comments: { f_name: "나의 활동", l_name: "댓글 관리" },
            reports: { f_name: "나의 활동", l_name: "신고 내역" },
            inquiries: { f_name: "나의 활동", l_name: "문의 내역" },
            chatting: { f_name: "나의 활동", l_name: "채팅 내역" },
            follow: { f_name: "나의 활동", l_name: "팔로우 목록" },
            purchases: { f_name: "거래 내역", l_name: "주문 내역" },
            sales: { f_name: "거래 내역", l_name: "판매 내역" },
            settles: { f_name: "거래 내역", l_name: "정산 내역" },
            basket: { f_name: "보관함", l_name: "장바구니" },
            coupons: { f_name: "보관함", l_name: "쿠폰함" },
            points: { f_name: "보관함", l_name: "적립 내역" },
            wishlist: { f_name:"보관함", l_name:"찜 목록"},
            buybid: { f_name:"거래내역", l_name:"구매 입찰 내역"},
            activity: { f_name: "통계", l_name: "활동 통계" },
            order: { f_name: "통계", l_name: "구매 통계" },
            salesstat: { f_name: "통계", l_name: "판매 통계" },
            deleteAccount: { f_name: "회원 탈퇴", l_name: "회원 탈퇴" },
            sellbid : { f_name: "거래 내역", l_name: "판매 입찰 내역" },
        };

        if (pathMap[page]) {
            setPath(pathMap[page]);
        } else if (pathname.length > 3) {
            setPath({ f_name: pathname[pathname.length - 2], l_name: pathname[pathname.length - 1] });
        } else {
            setPath({ f_name: "마이페이지", l_name: "" });
        }
    }, [location]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
      
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

      useEffect(() => {
        if (isDesktop) {
            setHamburgerOpen(true);
        } else {
            setHamburgerOpen(false);
        }
      }, [isDesktop]);

    return(
        <>
            <div className='mypage-container'>
            </div>
            <div className="mypage-hamburger" onClick={() => setHamburgerOpen(prev => !prev)}>☰</div>
            <MyPageHeader path={path} setPath={setPath}/>
            <MyPageNav path={path} setPath={setPath}
                isOpen={isDesktop || hamburgerOpen} closeNav={() => setHamburgerOpen(false)}/>
            <div className={isDesktop || hamburgerOpen ? 'mypage-wrap' : 'mypage-wrap-with-nav'}>
                <div className='mypage-box'>
                <div className='mypage-title'>{path.l_name}</div>
                    { path.l_name == '프로필' && <UserInfo/> }
                    { path.l_name == '개인 정보 수정' && <MyInfoEdit/> }
                    { path.l_name == '배송지 관리' && <MyDeliveries/> }
                    { path.l_name == '장바구니' && <MyBasket/> }
                    { path.l_name == '신고 내역' && <MyReport/> }
                    { path.l_name == '문의 내역' && <MyInquiryList/> }
                    { path.l_name == '찜 목록' && <MyWish/> }
                    { path.l_name == '주문 내역' && <MyPurchases/> }
                    { path.l_name == '채팅 내역' && <MyChatting/> }
                    { path.l_name == '팔로우 목록' && <MyFollow/> }
                    { path.l_name == '판매 내역' && <MySell/> }
                    { path.l_name == '정산 내역' && <MySettlement/> }
                    { path.l_name == '리뷰 관리' && <MyReviewList/> }
                    { path.l_name == '구매 입찰 내역' && <MyBid/> }
                    { path.l_name == '활동 통계' && <MyActivity/> }
                    { path.l_name == '구매 통계' && <MyOrder/> }
                    { path.l_name == '판매 통계' && <MySales/> }
                    { path.l_name == '쿠폰함' && <MyCoupon/> }
                    { path.l_name == '적립 내역' && <MyPoint/> }
                    { path.l_name == '회원 탈퇴' && <UserDelete/>}
                    { path.l_name == '판매 입찰 내역' && <MySellBid/>}
                </div>
            </div>
        </>
    )
}

export default MyIndex;