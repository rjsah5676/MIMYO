import { NavLink, Outlet } from "react-router-dom";
import '../../css/view/CenterHome.css';
function CenterHome(){
return(
    <div className="CustomerServiceLayout-container"> 
    <div className="CenterHome-container">
        <ul className="center-menu">
            <li><div className="center-menu3"><span><NavLink
 to="/customerservice/faq">자주묻는질문</NavLink></span></div></li>
            <li><div className="center-menu2"><span><NavLink
 to="/customerservice/inquiryWrite">1:1문의하기</NavLink></span></div></li>
            <li><div className="center-menu4"><span><NavLink
to="/customerservice/Notice">공지사항</NavLink></span></div></li>
        </ul>
    </div>

    <div className="customer-service-content"> {/* Outlet을 감싸는 div (스타일링 목적) */}
    <Outlet /> {/* 자식 라우트의 컴포넌트가 여기에 렌더링됩니다 */}
    </div>
    </div>
    )
}
export default CenterHome