import { FcGoogle } from "react-icons/fc";
import { SiKakaotalk } from "react-icons/si";
import { useNavigate } from "react-router-dom";

function Already(){
    const navigate = useNavigate();
    
    const handleSignup = () => {
        const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_REDIRECT_URL}&response_type=code&prompt=login`;
        window.location.href = kakaoLoginUrl;
    };

    const handleGoogleSignup = () => {
        const params = new URLSearchParams({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            redirect_uri: process.env.REACT_APP_GOOGLE_REDIRECT_URL,
            response_type: "code",
            scope: "openid email profile",
            prompt: "select_account",
        });
        window.location.href = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
    };

    return(
        <div className="already-container">
            <div className="message-box">
                <h2>이미 가입된 계정이 있습니다.<br />
                로그인해 주세요.</h2>
                
                <div style={{fontSize:'13px'}}>
                    <a className="id-find" onClick={() => navigate("/")}>아이디 찾기</a>
                    <a className="pw-find" onClick={() => navigate("/")}>비밀번호 찾기</a>
                </div>

                <div className="social-login">
                    <button className="kakao-login" onClick={handleSignup}>
                        <SiKakaotalk size={20} />
                        카카오 회원가입
                    </button>
                    <button className="google-login" onClick={handleGoogleSignup}>
                        <FcGoogle size={20} />
                        구글 회원가입
                    </button>
                </div>
                
            </div>
        </div>
    );
}

export default Already;