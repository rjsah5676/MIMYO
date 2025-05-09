import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../../../store/modalSlice";

import axios from "axios";

function SignupForm() {
    const loc = useLocation();
    const serverIP = useSelector((state) => {return state.serverIP});
    const modal = useSelector((state)=>{return state.modal});
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleComplete = () => {
        dispatch(setModal({isOpen: !modal.isOpen, selected: "DaumPost"}));
    }

    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const [alert, setAlert] = useState({
        userid: {content: "", state: false},
        username: {content: "", state: false},
        userpw: {content: "", state: false},
        userpwCheck: {content: "", state: false},
        tel: {content: "", state: false},
        address: {content: "", state: false}
    });
    const [user, setUser] = useState({
        userid: "",
        username: "",
        email: "",
        userpw: "",
        tel1: "",
        tel2: "",
        tel3: "",
        tel: "",
        address: "",
        addressDetail: "",
        kakaoProfileUrl: "",
        uploadedProfile: null,
        uploadedProfilePreview: null
    });

    useEffect(() => {
        if (modal.info && modal.info.address) {
            addressCheck({ target: { name: "address", value: modal.info.address } });
        }
    }, [modal.info?.address]);

    const validationRules = {
        userid: {
            regex: /^[a-z0-9]{6,12}$/,
            message: "아이디는 6자 이상 12자 이하의 영어 소문자, 숫자만 가능합니다."
        },
        username: {
            regex: /^[A-Za-z가-힣]{2,7}$/,
            message: "이름은 2자 이상 7자 이하의 한글 또는 영어 대소문자만 가능합니다."
        },
        userpw: {
            regex: /^[A-Za-z0-9`~!@#$%^&*?]{8,14}$/,
            message: "비밀번호는 8자 이상 14자 이하의 영어, 숫자, 특수문자만 가능합니다."
        },
        userpwCheck: {
            message: "비밀번호가 일치하지 않습니다."
        },
        tel: {
            regex: /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$/,
            message: "전화번호를 올바르게 입력해주세요."
        },
        address: {
            message: "주소를 입력해주세요."
        }
    }

    const changeUser = (e) => {
        const { name, value } = e.target;
        setUser({...user, [name]: value});
        const updatedUser = { ...user, [name]: value };
        
        if (name === "userid") {
            setIdCheck(false);
        }
        if (["tel1", "tel2", "tel3"].includes(name)) {
            updatedUser.tel = `${updatedUser.tel1}-${updatedUser.tel2}-${updatedUser.tel3}`;
            
            const isTelValid = validationRules.tel.regex.test(updatedUser.tel);
            setAlert({
                ...alert,
                tel: {
                    content: isTelValid ? "" : validationRules.tel.message,
                    state: isTelValid
                }
            });
            telCheck();
            setUser(updatedUser);
        } else if (name === "userpwCheck") {
            const isMatch = document.getElementById("pw1").value === document.getElementById("pw2").value;
            
            setAlert({
                ...alert,
                [name]: {
                    content: isMatch ? "" : validationRules[name].message,
                    state: isMatch
                }
            });
        } else if (validationRules[name]) {
            const isValid = validationRules[name].regex.test(value);

            setAlert({
                ...alert,
                [name]: {
                    content: isValid ? "" : validationRules[name].message,
                    state: isValid
                }
            });       
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
    
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUser((prev) => ({
                    ...prev,
                    uploadedProfile: file, 
                    uploadedProfilePreview: event.target.result, 
                    kakaoProfileUrl: null 
                }));
            };
            reader.readAsDataURL(file);
        } else {
            alert("이미지 파일만 업로드 가능합니다.");
            e.target.value = "";
        }
    };

    const addressCheck = ()=>{
        let isAddrValid = false;
        if (modal.info && modal.info.address) {
            isAddrValid = true;
        }
        setAlert({
            ...alert,
            address: {
                content: isAddrValid ? "" : validationRules.address.message,
                state: isAddrValid
            }
        });
    }

    const validateForm = () => {
        let isValid = true;
    
        telCheck();
        for (const key of Object.keys(validationRules)) {
            if (key === "userpwCheck") {
                const isMatch = user.userpw === user.userpwCheck;
                if (!isMatch) {
                    setAlert(prev => ({ 
                        ...prev, 
                        [key]: { content: validationRules[key].message, state: false } 
                    }));
                    return false;  // 첫 번째 오류에서 종료
                }
            } else if (key === "address") {
                const hasAddress = modal.info && modal.info.address;
                if (!hasAddress) {
                    setAlert(prev => ({ 
                        ...prev, 
                        [key]: { content: validationRules[key].message, state: false } 
                    }));
                    return false;
                }
            } else {
                const value = user[key] || "";
                const isValidField = validationRules[key].regex.test(value);
                if (!isValidField) {
                    setAlert(prev => ({ 
                        ...prev, 
                        [key]: { content: validationRules[key].message, state: false } 
                    }));
                    return false;
                }
            }
        }
    
        return isValid;
    };

    const doSignUp = () => {
        if (!validateForm()) {
            return;
        }

        if (!idCheck) {
            window.alert("아이디 중복 확인을 해주세요.");
            return;
        }

        if (!telNumCheck) {
            window.alert("사용 할 수 없는 번호입니다.");
            return;
        }

        if (!isVerified) {
            window.alert("이메일 인증을 해주세요.");
            return;
        }
        
        const formData = new FormData();
        formData.append("userid", user.userid);
        formData.append("username", user.username);
        formData.append("email", user.email);
        formData.append("userpw", user.userpw);
        formData.append("tel", user.tel);
        if (modal.info && modal.info.address) formData.append("address", modal.info.address);
        formData.append("addressDetail", user.addressDetail);
        if (modal.info && modal.info.zonecode) formData.append("zipcode", modal.info.zonecode);
        formData.append("infoText", user.infoText);
    
        if (user.uploadedProfile) {
            formData.append("profileImage", user.uploadedProfile);
        } else {
            window.alert("프로필 사진을 설정해주세요.");
            return;
        }
    
        if (Object.values(alert).every(item => item.state)) {
            axios.post(`${serverIP.ip}/signup/doSignUp`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            .then(res => {
                window.alert(res.data);
                dispatch(setModal({}));
                navigate('/');
            })
            .catch(err => {
                console.log(err);
                dispatch(setModal({}));
            });
        } else {
            console.log("실패");
        }
    };

    const modalBackStyle = {    //모달 배경
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: modal.isOpen ? 'block' : 'none',
        transition: 'opacity 0.3s ease'
    }

    const [idCheck, setIdCheck] = useState(false);

    const duplicateCheck = ()=>{
        if (alert.userid.state) {
            axios.get(`${serverIP.ip}/signup/duplicateCheck?userid=${user.userid}`)
            .then(res=>{
                if (res.data === 0) {
                    window.alert("사용 가능한 아이디입니다.");
                }
                else {
                    window.alert("이미 사용 중인 아이디입니다.");
                }
            })
            .catch(err=>console.log(err));
            
            setIdCheck(true);
        }
    }
    
    const [telNumCheck, setTelNumCheck] = useState(false);

    const telCheck = ()=>{
        axios.get(`${serverIP.ip}/signup/telCheck?tel=${user.tel}`)
        .then(res=>{
            if (res.data === 0) {
                setTelNumCheck(true);
            }
            else {
                setTelNumCheck(false);
            }
        })
        .catch(err=>console.log(err));
    }

    const sendVerificationCode = async () => {
        if (user.email) {
            try {
                setIsSendingCode(true);
                setEmailError("");
                await axios.post(`${serverIP.ip}/auth/signup-send-code`, {email: user.email} );
    
                setIsVerifying(true);
                window.alert("인증번호가 이메일로 전송되었습니다.");
            } catch (err) {
                window.alert(err.response.data.message);
            } finally {
                setIsSendingCode(false);
            }
        }
    };

    const verifyForEmail = async () => {
        try {
            const res = await axios.post(`${serverIP.ip}/auth/email-verify`, null, {
                params: { email: user.email, code: verificationCode },
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            window.alert(res.data.message);
            setEmailError('');
            setIsVerified(true);
            document.getElementById("email-input").disabled = true;
            document.getElementById("email-verification-btn").disabled = true;
            document.getElementById("verification-btn").disabled = true;
            document.getElementById("verification-code").disabled = true;
        } catch (err) {
            setEmailError("인증번호가 일치하지 않습니다.");
        }
      };

      
    /* 소개 */
    const [intro, setIntro] = useState("");

    useEffect(() => {
        setIntro(user.infoText || "");
      }, [user.infoText]);  // user.infoText 값이 변경될 때마다 상태 업데이트

    const handleChange = (e) => {
        const newIntro = e.target.value;
        setIntro(newIntro);
        setUser(prev => ({
            ...prev,
            infoText: newIntro
        }));
    };

    return (
        <>
        <div id="modal-background" style={modalBackStyle}></div>
        {isSendingCode && (
            <div className="blocking-overlay">
                <div className="spinner"></div>
            </div>
        )}
            <div className="sign-up-form">
                <h2>회원가입</h2>
                <label>아이디</label>
                <input type="text" name="userid" onChange={changeUser}/>
                <button id="duplicate-check-btn" onClick={duplicateCheck}>중복확인</button><br/>
                {alert.userid.content && <><span className="form-alert">{alert.userid.content}</span><br/></>}

                <label>이름</label>
                <input type="text" name="username" value={user.username} onChange={changeUser}/><br/>
                {alert.username.content && <><span className="form-alert">{alert.username.content}</span><br/></>}

                <label>이메일</label>
                <input type="text" id="email-input" name="email" value={user.email} onChange={changeUser}/>
                <button id="email-verification-btn" onClick={sendVerificationCode}>이메일인증</button><br/>

                {isVerifying && (
                    <>
                        <input
                            id="verification-code"
                            type="text"
                            placeholder="인증번호 입력"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            style={{marginLeft: '175px', border: '0', borderBottom: '1px solid #555', borderRadius: '0'}}
                        />
                        <button onClick={verifyForEmail} id="verification-btn">
                            인증 확인
                        </button><br/>
                        {emailError &&
                            <><span className="form-alert">{emailError}</span><br/></>
                        }
                    </>
                )}
                <label>비밀번호</label>
                <input type='password' id="pw1" name="userpw" onChange={changeUser}/><br/>
                {alert.userpw.content && <><span className="form-alert">{alert.userpw.content}</span><br/></>}
                
                <label>비밀번호 확인</label>
                <input type='password' id="pw2" name="userpwCheck" onChange={changeUser}/><br/>
                {alert.userpwCheck.content && <><span className="form-alert">{alert.userpwCheck.content}</span><br/></>}

                <label>휴대폰 번호</label>
                <input type="text" name="tel1" className="tel" maxLength="3" value={user.tel1} onChange={changeUser}/>-
                <input type="text" name="tel2" className="tel" maxLength="4" value={user.tel2} onChange={changeUser}/>-
                <input type="text" name="tel3" className="tel" maxLength="4" value={user.tel3} onChange={changeUser}/><br/>
                {alert.tel.content && <><span className="form-alert">{alert.tel.content}</span><br/></>}

                <label>우편번호</label>
                <input type="text" style={{width: '110px'}} name="zipcode" value={modal.info && modal.info.zonecode} disabled/>
                <button id="postcode" onClick={handleComplete}>주소찾기</button><br/>

                <label>주소</label>
                <input type="text" name="address" readOnly value={modal.info && modal.info.address}/><br/>
                {alert.address.content && <><span className="form-alert">{alert.address.content}</span><br/></>}
                
                <label>상세주소</label>
                <input type='text' name="addressDetail" value={user.addressDetail} onChange={changeUser}/><br/>

                <div style={{position: "relative"}}>
                    <label>프로필 사진</label>
                    {user.uploadedProfilePreview ? (
                    <img
                        id="profile-img"
                        src={user.uploadedProfilePreview}
                        alt="프로필 이미지"
                        referrerPolicy="no-referrer"
                    />
                    ) : (
                    <img id="profile-img" className="no-image" style={{width:'100px',height:'100px', border:'1px solid #ddd'}}/>
                    )}
                    <input type="file" id="profile-image-file" style={{display: "none"}} accept="image/*" onChange={handleImageChange} /><br/>
                    <label htmlFor="profile-image-file" id="profile-image-btn">사진첨부</label>
                </div>

                {/* 소개 */}
                <div className="info-box-style">
                    <label style={{ textAlign: "left" }}>소개</label>
                    <textarea name="infoText" maxLength={200} value={intro} onChange={handleChange} style={{height: "18vh", padding: "10px", fontFamily:'inherit'}} />
                </div>
                <div style={{ textAlign: "right", marginTop: "5px", fontSize: "0.9em", color: "#222", width: "97%", marginRight:"10px"}}>
                    <font style={{ color: "#666" }}>{intro.length}</font> / 200
                </div>
            </div>

            <button id="signup-btn" onClick={()=>doSignUp()}>회원가입</button>
        </>
    );
}

export default SignupForm;