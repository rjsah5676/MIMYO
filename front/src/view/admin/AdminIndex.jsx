import AdminHeader from "./AdminHeader";
import AdminNav from "./AdminNav";
import AdminReport from "./AdminReport";
import AdminInquiry from "./AdminInquiry";
import AdminEdit from "./AdminEdit";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import '../../css/view/admin.css';
import SalesByPeriod from "./SalesByPeriod";
import SalesByCategory from "./SalesByCategory";
import AdminMember from "./AdminMember";
import AdminUserAct from "./AdminUserAct";
import AdminSettlement from "./AdminSettlement";
import AdminCoupon from "./AdminCoupon";

function AdminIndex() {
    const location = useLocation();
    const [path, setPath] = useState({ f_name: '', l_name: '' });

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        let pathname = location.pathname.split("/");
        let page = pathname[2];
        const pathMap = {
            reportlist: { f_name: "관리자 페이지", l_name: "신고 목록" },
            inquirylist: { f_name: "관리자 페이지", l_name: "문의 목록" },
            edit: { f_name: "관리자 페이지", l_name: "회원 목록" },
            adminmember: { f_name: "매출관리", l_name: "회원 통계" },
            adminuseract: { f_name: "매출관리", l_name: "회원 활동 통계" },
            salesbycategory: { f_name: "매출관리", l_name: "상품별 판매 통계" },
            salesbyperiod: { f_name: "매출관리", l_name: "기간별 판매 통계" },
            settlementprocessing: { f_name: "매출관리", l_name: "정산 처리" },
            sendCoupon: { f_name: "기타 기능", l_name: "쿠폰 지급" },

        };

        if (pathMap[page]) {
            setPath(pathMap[page]);
        } else if (pathname.length > 3) {
            setPath({ f_name: pathname[pathname.length - 2], l_name: pathname[pathname.length - 1] });
        } else {
            setPath({ f_name: "마이페이지", l_name: "" });
        }
    }, [location]);


    return (<>
        <div className='admin-container'>
        </div>
        <AdminHeader path={path} setPath={setPath} />
        <AdminNav path={path} setPath={setPath} />
        <div className='admin-wrap'>
            <div className='admin-box'>
                <div className='admin-title'>{path.l_name}</div>
                {path.l_name == '신고 목록' && <AdminReport />}
                {path.l_name == '문의 목록' && <AdminInquiry />}
                {path.l_name == '회원 목록' && <AdminEdit />}
                {path.l_name == '회원 통계' && <AdminMember />}
                {path.l_name == '회원 활동 통계' && <AdminUserAct />}
                {path.l_name == '기간별 판매 통계' && <SalesByPeriod />}
                {path.l_name == '상품별 판매 통계' && <SalesByCategory />}
                {path.l_name == '정산 처리' && <AdminSettlement />}
                {path.l_name == '쿠폰 지급' && <AdminCoupon />}
            </div>
        </div>
    </>)
}

export default AdminIndex;