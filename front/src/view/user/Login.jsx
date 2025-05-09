import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SiKakaotalk } from "react-icons/si";
import { Check, X } from "lucide-react"; 
import Logo from '../../img/mimyo_logo-removebg.png';
import Spinner from "../../effect/Spinner";
import { setLoginView } from "../../store/loginSlice";
import NaverLogo from '../../img/naver.png';

function Login({ onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [userid, setUserid] = useState("");
    const [userpw, setUserpw] = useState("");
    const [useridValid, setUseridValid] = useState(null);
    const [userpwValid, setUserpwValid] = useState(null);
    const [isLogin,setIsLogin] = useState(null);

    const serverIP = useSelector((state) => state.serverIP.ip);

    const [showFindId, setShowFindId] = useState(false);
    const [showResetPw, setShowResetPw] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [userId, setUserId] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [isSendingCode, setIsSendingCode] = useState(false);
    const [emailError, setEmailError] = useState("");

    const [newPasswordValid, setNewPasswordValid] = useState(null); // 비밀번호 재설정

    const moveSignUp = () => {
      navigate('signup/info');
      dispatch(setLoginView(false));
    }

    const handleNewPasswordChange = (e) => { // 비밀번호 찾기 -> 재설정
      const value = e.target.value;
      setNewPassword(value);
  
      const passwordRegex = /^[A-Za-z0-9`~!@#$%^&*?]{8,14}$/;
      if (passwordRegex.test(value)) {
          setNewPasswordValid(true);
      } else {
          setNewPasswordValid(false);
      }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${serverIP}/auth/login`, {
                userid,
                userpw
            }, { withCredentials: true });

            if (response.status === 200) {
                dispatch(setUser(response.data));
                window.location.href='/';
                onClose();
            }
        } catch (err) {
            setIsLogin(true);
            if(err.response.data.substring(0,2) === '유저')setUseridValid(false);
            else if(err.response.data.substring(0,2) === '비밀') {
                setUseridValid(true);
                setUserpwValid(false);
            }
            else if(err.response.data.substring(0,2) === '정지') {
                alert('정지된 사용자입니다.');
            }
            else alert((err.response.data || "서버 오류"));
        }
    };


    const sendVerificationCode = async () => {
      try {
        setIsSendingCode(true);
        setEmailError("");
        if (showResetPw) {
          const formData = new URLSearchParams();
          formData.append("userid", userid);
          formData.append("email", email);
    
          await axios.post(`${serverIP}/auth/reset-password/request`, formData, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            withCredentials: true,
          });
        } else {
          await axios.post(`${serverIP}/auth/send-code`, { userid, email });
        }
    
        setIsVerifying(true);
        alert("인증번호가 이메일로 전송되었습니다.");
      } catch (err) {
        if(err.response.data.message) {
          setEmailError(err.response.data.message || "인증 요청 중 오류가 발생했습니다.");
        }
        else setEmailError(err.response.data || "인증 요청 중 오류가 발생했습니다.");
      } finally {
        setIsSendingCode(false);
      }
    };

    const verifyForFindId = async () => {
      try {
        const res = await axios.post(`${serverIP}/auth/find-id/verify`, null, {
          params: { email, code: verificationCode },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        setUserId(res.data.userid);
        setStep(2);
      } catch (err) {
        setEmailError("인증번호가 일치하지 않습니다.");
      }
    };
  
    const verifyForResetPw = async () => {
      try {
        const res = await axios.post(
          `${serverIP}/auth/reset-password/verify`,
          null,
          {
            params: { email, code: verificationCode },
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setStep(2);
      } catch (err) {
        console.log("❌ Error details:", err.response?.data);
        setEmailError("인증번호가 일치하지 않습니다.");
        const errorMsg =
          err.response?.data?.message ||
          JSON.stringify(err.response?.data) ||
          "알 수 없는 오류";
      }
    };

    const resetPassword = async () => {
      try {
        await axios.post(`${serverIP}/auth/reset-password`, null, {
          params: { email, newPassword },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
        alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
        resetForm();
      } catch (err) {
        alert(
          "비밀번호 변경 실패: " +
            (err.response?.data?.message || "알 수 없는 오류")
        );
      }
    };
  
    const resetForm = () => {
      setShowFindId(false);
      setShowResetPw(false);
      setStep(1);
      setEmail("");
      setVerificationCode("");
      setIsVerifying(false);
      setUserId("");
      setNewPassword("");
      setEmailError("");
    };

    const handleSignup = () => {
        const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&redirect_uri=${process.env.REACT_APP_KAKAO_REDIRECT_URL}&response_type=code&prompt=login`;
        window.location.href = kakaoLoginUrl;
    };
    const handleNaverSignup = () => {
      const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.REACT_APP_NAVER_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_NAVER_REDIRECT_URL}&state=naver`;
      window.location.href = naverLoginUrl;
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

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    const renderAuthFlow = () => {
      return (
        <div>
          <h3 style={{color:'white'}}>{showFindId ? "아이디 찾기" : "비밀번호 재설정"}</h3>
          {step === 1 ? (
            <>
              {showResetPw && !isVerifying && (
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="아이디 입력"
                    value={userid}
                    onChange={(e) => setUserid(e.target.value)}
                  />
                </div>
              )}
              { !isVerifying && <>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="이메일 입력"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSendingCode}
                />
              </div>
              {emailError && (
                <p style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "-8px", marginBottom: "10px" }}>
                  {emailError}
                </p>
              )}
              {isSendingCode ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Spinner/>
                </div>
              ) : (
                <button style={{marginBottom:'10px'}} onClick={sendVerificationCode}>인증번호 요청</button>
              )}</>
            }
              {isVerifying && (
                <>
                  <div className="input-wrapper">
                    <FaLock className="input-icon" />
                    <input
                      type="text"
                      placeholder="인증번호 입력"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                  {emailError && (
                    <p style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "-8px", marginBottom: "10px" }}>
                      {emailError}
                    </p>
                  )}
                  <button style={{marginBottom:'10px'}}
                    onClick={showFindId ? verifyForFindId : verifyForResetPw}
                  >
                    인증 확인
                  </button>
                </>
              )}
            </>
          ) : showFindId ? (
            <div>
              <p style={{color:'white'}}>아이디: <strong>{userId}</strong></p>
            </div>
          ) : (
            <>
              <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                      type="password"
                      placeholder="새 비밀번호 입력"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                  />
                  {newPasswordValid !== null  && newPassword !== "" && (
                      newPasswordValid ? <Check className="input-status valid" /> : <X className="input-status invalid" />
                  )}
              </div>
              {newPasswordValid === false  && newPassword !== "" && (
                  <p style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "-8px", marginBottom: "10px" }}>
                      비밀번호는 8자 이상 14자 이하의 영어, 숫자, 특수문자만 가능합니다.
                  </p>
              )}
              <button style={{marginBottom:'10px'}}onClick={resetPassword}>비밀번호 변경</button>
            </>
          )}
          {isSendingCode ? (
            <></>
          ) : (
            <button onClick={resetForm} className="back-btn">
              돌아가기
            </button>
          )}
        </div>
      );
    };


    return (
        <div className="login-container">
            <span className="close-btn" onClick={onClose}>x</span>

            <img src={Logo} alt="로고" className="login-logo" />

            {showFindId || showResetPw ? (
              renderAuthFlow()
            ) : (
              <>
            <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input 
                    type="text" 
                    placeholder="아이디" 
                    value={userid} 
                    onChange={(e) => {
                        setUserid(e.target.value);
                    }}
                    onKeyDown={handleKeyPress}
                />
                {isLogin && (
                    useridValid ? <Check className="input-status valid" /> : <X className="input-status invalid" />
                )}
            </div>

            <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input 
                    type="password" 
                    placeholder="비밀번호" 
                    value={userpw} 
                    onChange={(e) => {
                        setUserpw(e.target.value);
                    }}
                    onKeyDown={handleKeyPress} 
                />
                {isLogin && (
                    userpwValid ? <Check className="input-status valid" /> : <X className="input-status invalid" />
                )}
            </div>
            
            <button onClick={handleLogin}>로그인</button>

            <div className="login-links">
                <span onClick={() => moveSignUp()}>회원 가입</span>
                <span onClick={() => setShowResetPw(true)}>비밀번호 찾기</span>
            </div>
            </>
            )}

            <div className="social-login">
                <button className="kakao-login" onClick={handleSignup}>
                    <SiKakaotalk size={20} />
                    카카오 로그인
                </button>
                <button className="google-login" onClick={handleGoogleSignup}>
                    <FcGoogle size={20} />
                    구글 로그인
                </button>
                <button style={{position:'relative'}} onClick={handleNaverSignup}>
                  <img style={{position:'absolute',left:'83px',top:'12px'}}width='20px' src={NaverLogo}/>  
                  <span style={{paddingLeft:'25px'}}>네이버 로그인</span>
                </button>
            </div>
        </div>
    );
}

export default Login;