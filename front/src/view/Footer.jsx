import React, { useEffect, useState } from 'react';
import '../css/view/footer.css';
import facebookIcon from '../img/footer_facebook.png';
import instagramIcon from '../img/footer_insta.png';
import kakaoIcon from '../img/footer_kakao.png';
import { useLocation, useNavigate } from 'react-router-dom';

function Footer({ loginStatus, contextPath }) {
    const loc = useLocation();
    const [isMargin, setIsMargin] = useState(true);
    const navigate = useNavigate();

    useEffect(()=>{
        if (loc.pathname === "/product/buying") {
            setIsMargin(false)
        } else {
            setIsMargin(true);
        }
    },[loc.pathname]);

    return (
        <ul className="footer" style={isMargin ? {marginTop: '200px'} : {}}>
            <li className="footer-info">
                <h3 className="footer-title">(주)MIMYO</h3>
                <ul className="footer-list">
                    <li>대표이사 : 이건모</li>
                    <li>주소 : 서울시 성동구 아차산로 113 2층</li>
                    <li>사업자등록번호 : 123-45-67890 | <a href="https://www.ftc.go.kr/www/selectBizCommList.do?key=253&token=78EE9F4C-413C-820A-7398-B340B79BAF7DE0C2B52E069C60B33029F901F8639F73" className="business-info-link">사업자 정보 확인</a></li>
                    <li>통신판매업신고 : 2025-성동-2025호</li>
                    <li>호스팅서비스 제공자 : Naver Cloud Platform</li>
                    <li>대표번호 : <a href="tel:010-6385-4676">010-6385-4676</a></li><br/>

                                       
                </ul>
            </li>
            <li className="footer-cs">
                <h3 className="footer-title">고객 센터</h3>
                <ul className="footer-list">
                    <li>오전 10시 ~ 오후 5시 (주말, 공휴일 제외)</li>
                    <li><button className="cs-chat" onClick={()=>navigate('/customerservice/inquiryWrite')}>문의하기</button></li><br/>
                    <li>MIMYO는 통신판매중개자이며 통신판매의 당사자가 아닙니다.</li>
                    <li>따라서 MIMYO는 상품 거래 정보 및 거래에 대하여 책임을 지지 않습니다.</li> 
                    <li><a href="mailto:rjsah5676@gmail.com" className="partnership-link">제휴 문의: rjsah5676@gmail.com</a></li>
                </ul>
                
                
            </li>
            <li className="footer-add-info">
                <h3 className="footer-title">구매안전서비스</h3>
                <ul className="footer-list">
                    <li>고객이 현금 등으로 결제시 당사에서 가입한</li>
                    <li>구매안전서비스를 이용하실 수 있습니다.</li>              
                    <li><button className="verify-membership">가입 사실 확인</button></li>
                </ul>

                <h3 className="footer-title">SNS</h3>
                <div className="social-icons">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon"><img src={facebookIcon} alt="Facebook" width="30" height="30" /></a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon"><img src={instagramIcon} alt="Instagram" width="30" height="30" /></a>
                    <a href="https://www.kakao.com" target="_blank" rel="noopener noreferrer" className="social-icon"><img src={kakaoIcon} alt="Kakao" width="30" height="30" /></a>
                   
                </div>
            </li>
            <li className="footer-copyright">
                Copyright ⓒ 2025 MIMYO Co., Ltd. All rights reserved.
            </li>
        </ul>
    );
}

export default Footer;