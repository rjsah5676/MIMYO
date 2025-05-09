import { useState } from "react";

import SignupForm from "./mypage/SignupForm";

function SignupInfo() {
    const [isTermsChecked, setIsTermsChecked] = useState(false);
    const [firstCheck, setFirstCheck] = useState(false);
    const [secondCheck, setSecondCheck] = useState(false);


    const termsCheck = ()=>{
        if (document.getElementById("terms-alert")) {
            document.getElementById("terms-alert").style.display = "block";
        }
        setFirstCheck(document.querySelector('input[name="agreeFirst"]:checked'));
        setSecondCheck(document.querySelector('input[name="agreeSecond"]:checked'));

        if (firstCheck && secondCheck) {
            setIsTermsChecked(true);
        } else {
            setIsTermsChecked(false);
        }
    }

    return (
        <>
        <div className="sign-up-container">
            {
                isTermsChecked ? <SignupForm/> :
                <div className="terms">
                    <h4>1. 이용약관</h4>
                    <div className="terms-box">
                        <span className="terms-title">제1조 (목적)</span><br/>
                        이 약관은 MIMYO(이하 "회사")가 제공하는 온라인 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.<br/>

                        <br/><span className="terms-title">제2조 (용어의 정의)</span><br/>
                        "회원"이란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.<br/>
                        "판매자"란 수제품을 제작하여 사이트를 통해 판매하는 회원을 의미합니다.<br/>
                        "구매자"란 사이트에서 판매자가 등록한 상품을 구매하는 회원을 의미합니다.<br/>
                        "콘텐츠"란 회사가 제공하는 서비스 내에서 게시되는 모든 정보(텍스트, 이미지, 영상 등)를 의미합니다.<br/>

                        <br/><span className="terms-title">제3조 (약관의 효력 및 변경)</span><br/>
                        본 약관은 회원이 사이트 가입 시 동의함으로써 효력이 발생합니다.<br/>
                        회사는 필요 시 관련 법령을 위배하지 않는 범위 내에서 약관을 개정할 수 있으며, 변경된 약관은 공지 후 즉시 효력이 발생합니다.<br/>
                        회원은 변경된 약관에 동의하지 않을 경우 탈퇴할 수 있으며, 변경된 약관 시행일 이후에도 서비스를 계속 이용하는 경우 약관 변경에 동의한 것으로 간주됩니다.<br/>

                        <br/><span className="terms-title">제4조 (회원 가입 및 관리)</span><br/>
                        회원 가입은 본 약관과 개인정보 처리방침에 동의한 후, 회사가 정한 절차에 따라 이루어집니다.<br/>
                        회원은 본인의 정확한 정보를 제공해야 하며, 타인의 정보를 도용하거나 허위 정보를 기재할 경우 서비스 이용이 제한될 수 있습니다.<br/>
                        회원은 언제든지 회사에 회원 탈퇴를 요청할 수 있으며, 회사는 즉시 회원의 정보를 삭제합니다.<br/>

                        <br/><span className="terms-title">제5조 (서비스의 이용 및 제한)</span><br/>
                        회원은 회사가 제공하는 서비스를 자유롭게 이용할 수 있습니다.<br/>
                        단, 다음과 같은 경우 회사는 회원의 서비스 이용을 제한할 수 있습니다.<br/>
                        불법 행위 또는 부정 거래를 시도하는 경우<br/>
                        타인의 권리를 침해하거나 명예를 훼손하는 경우<br/>
                        회사의 운영을 방해하는 행위를 하는 경우<br/>

                        <br/><span className="terms-title">제6조 (판매자 및 구매자의 책임)</span><br/>
                        판매자는 상품의 품질 및 배송에 대한 모든 책임을 가지며, 허위 정보 제공 및 부정 거래 시 서비스 이용이 제한될 수 있습니다.<br/>
                        구매자는 정당한 방법으로 결제를 진행해야 하며, 부정한 방법을 사용할 경우 법적 책임을 질 수 있습니다.<br/>

                        <br/><span className="terms-title">제7조 (면책 조항)</span><br/>
                        회사는 회원 간의 거래에 직접 개입하지 않으며, 거래 과정에서 발생하는 문제에 대해 책임을 지지 않습니다.<br/>
                        회사는 천재지변, 시스템 오류 등 불가항력적인 사유로 인해 발생한 서비스 중단에 대해 책임을 지지 않습니다.<br/>

                        <br/><span className="terms-title">제8조 (기타 사항)</span><br/>
                        본 약관에서 정하지 않은 사항은 관련 법령 및 일반적인 상관례를 따릅니다.<br/>
                    </div>

                    <label htmlFor="agreeFirst" style={{cursor: 'pointer'}}>
                        <input type="radio" id="agreeFirst" name="agreeFirst" required onChange={()=>setFirstCheck(true)}
                         style={{cursor: 'pointer'}}/>
                        (필수) 위 내용을 확인하였으며, 이용약관에 동의합니다.
                    </label><br/>
                    {!firstCheck && <div id="terms-alert">이용약관에 동의해야 회원가입을 진행할 수 있습니다.</div>}

                    <h4>2. 개인정보의 수집 및 이용에 대한 동의</h4>
                    <div className="terms-box">
                        MIMYO(이하 "회사")는 회원 가입 및 서비스 제공을 위해 아래와 같이 개인정보를 수집 및 이용합니다.<br/>

                        <br/><span className="terms-title">1. 수집하는 개인정보 항목</span><br/>
                        필수 항목: 이름, 이메일 주소, 휴대폰 번호, 아이디, 비밀번호<br/>
                        선택 항목: 프로필 사진, 배송지 주소<br/>

                        <br/><span className="terms-title">2. 개인정보의 이용 목적</span><br/>
                        회원 가입 및 서비스 이용 관리<br/>
                        주문 및 결제 처리, 배송 서비스 제공<br/>
                        고객 문의 응대 및 서비스 관련 공지사항 전달<br/>
                        부정 이용 방지 및 법적 의무 준수<br/>

                        <br/><span className="terms-title">3. 개인정보의 보유 및 이용 기간</span><br/>
                        회원 탈퇴 시 즉시 삭제 (단, 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관)<br/>
                        전자상거래법에 따른 거래 기록 보관 (5년)<br/>

                        <br/><span className="terms-title">4. 개인정보의 제3자 제공 및 위탁</span><br/>
                        회사는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다.<br/>
                        단, 서비스 제공을 위해 필요한 경우 회원의 동의를 받아 제3자에게 정보를 제공할 수 있습니다.<br/>

                        <br/><span className="terms-title">5. 동의를 거부할 권리 및 불이익</span><br/>
                        회원은 개인정보 제공에 대한 동의를 거부할 수 있으며, 이 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.<br/>
                        
                    </div>
                    <label htmlFor="agreeSecond" style={{cursor: 'pointer'}}>
                        <input type="radio" id="agreeSecond" name="agreeSecond" required onChange={()=>setSecondCheck(true)}
                         style={{cursor: 'pointer'}}/>
                        (필수) 위 내용을 확인하였으며, 개인정보 수집 및 이용에 동의합니다.
                    </label><br/>
                    {!secondCheck && <div id="terms-alert">개인정보 수집 및 이용에 동의해야 서비스를 이용할 수 있습니다.</div>}
                    
                    <button id="terms-next" onClick={termsCheck}>다음</button>
                </div>
            }
        </div>
        </>
    );
}

export default SignupInfo;