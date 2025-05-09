import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../../../store/modalSlice";
import { clearUser } from "../../../store/authSlice";

import axios from "axios";
import MyPwdEdit from "./MyPwdEdit";

function MyInfoEdit() {
    // start : 개인정보 수정
    const getUser = useSelector((state) => state.auth.user);
    const [userInfo, setUserInfo] = useState({});
    const [currentPage, setCurrentPage] = useState('infoEditPage');
    // end : 개인정보 수정

    const serverIP = useSelector((state) => {return state.serverIP});
    const modal = useSelector((state)=>{return state.modal});
    const dispatch = useDispatch();

    const uuser = useSelector((state) => state.auth.user);

    const handleComplete = (e) => {
        e.preventDefault();
        dispatch(setModal({isOpen: !modal.isOpen, selected: "DaumPost"}));
    }

    function handleLogout() {
        localStorage.removeItem("token");
        dispatch(clearUser());
        window.location.href = '/';
    }

    const [alert, setAlert] = useState({
        userid: {content: "", state: false},
        username: {content: "", state: false},
        tel: {content: "", state: false},
        address: {content: "", state: false}
    });
    
    const [user, setUser] = useState({
        zipcode: "",
        address: "",
        detailAddress: ""
    });

    const validationRules = {
        username: {
            regex: /^[A-Za-z가-힣]{2,7}$/,
            message: "이름은 2자 이상 7자 이하의 한글 또는 영어 대소문자만 가능합니다."
        },
        address: {
            message: "주소를 입력해주세요."
        }
    }

    const changeUser = (e) => {
        const { name, value } = e.target;
        setUser({...user, [name]: value}); // 입력하는 데이터값 저장

        if (name === "userpwCheck") {
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
            setUser((prev) => ({
                ...prev,
                uploadedProfile: null,
                uploadedProfilePreview: null,
                kakaoProfileUrl:  null
            }));
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


    useEffect(()=> {
        if(modal.info !== undefined) {
            if(modal.info.address !== undefined && modal.info.address !== null && modal.info.address !== '') {
                setUser(prev => ({ 
                    ...prev, 
                    address: modal.info.address,
                    zipcode: modal.info.zonecode
                }));
            }
        }
    },[modal.info]);

    const validateForm = () => {
        const currentProfileImage = user.uploadedProfilePreview || user.kakaoProfileUrl || (user.uploadedProfileUrl && `${serverIP.ip}${user.uploadedProfileUrl}`);
        const originalProfileImage = userInfo.kakaoProfileUrl || (userInfo.uploadedProfileUrl && `${serverIP.ip}${userInfo.uploadedProfileUrl}`);

        if (
            (user.username || '') === (userInfo.username || '') && 
            (user.address || '') === (userInfo.address || '') && 
            (user.addressDetail || '') === (userInfo.addressDetail || '') &&
            (user.infoText || '') === (userInfo.infoText || '') &&
            currentProfileImage === originalProfileImage
        ) {
            window.alert("변경사항이 없습니다.");
            return false;
        }

        let isValid = true;

        for (const key of Object.keys(validationRules)) {
            if (key === "address") {
                const hasAddress = user.address !== "";
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

    const myInfoEdit = (event) => {
        event.preventDefault(); // 폼이 제출될 때 페이지 리로드를 막음

        if (!validateForm()) {
            return;
        }
    
        const formData = new FormData();
        const userCopy = { ...user };
    
        // uploadedProfile이 없고, 기존에 등록한 이미지 URL이 있다면 서버에 전달
        if (!user.uploadedProfile && user.profileImageUrl) {
            userCopy.profileImageUrl = user.profileImageUrl; // 기존 이미지 유지 요청
        }
    
        formData.append(
            "user",
            new Blob([JSON.stringify(userCopy)], { type: "application/json" })
        );
    
        if (user.uploadedProfile) {
            formData.append("profileImage", user.uploadedProfile);
        }
        
        if(uuser)        
            axios.post(`${serverIP.ip}/mypage/editInfo`,formData, {
                headers: {
                    Authorization:`Bearer ${uuser.token}`,
                    'Content-Type': 'multipart/form-data',
                }
            })
            .then(res => {
                if(res.data==="editInfoOk"){
                    window.alert("정상적으로 수정이 완료되었습니다.\n다시 로그인해주세요.");
                    handleLogout();
                }
            })
            .catch(err=> console.log(err))
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

    /* 개인정보수정 */
    useEffect(() => {
        if (getUser) {
            axios.get(`${serverIP.ip}/mypage/getUser`, {
                headers: { Authorization: `Bearer ${getUser.token}` }
            })
            .then((res) => {
                const tel = res.data.tel || '';
                const [tel1, tel2, tel3] = tel.split('-');
                setUser({ 
                    ...res.data,
                    tel1: tel1 || '',
                    tel2: tel2 || '',
                    tel3: tel3 || ''
                });
                setUserInfo({ 
                    ...res.data,
                    tel1: tel1 || '',
                    tel2: tel2 || '',
                    tel3: tel3 || ''
                });
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }, [getUser, serverIP.ip]);

    /* 소개 */
    const [intro, setIntro] = useState(user.infoText || "");

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
        { currentPage === "infoEditPage" &&
            <>
                <div id="modal-background" style={modalBackStyle}></div>
                <form className="sign-up-form" onSubmit={myInfoEdit}>
                    <label>아이디</label>
                    <input id="info-edit-id" type="text" name="userid" value={user.userid || ''} style={{width:'calc(65%)', backgroundColor:'#ddd'}} disabled/>

                    <label>이름</label>
                    <input type="text" name="username" value={user.username || ''} onChange={changeUser}/><br/>
                    {alert.username.content && <><span className="form-alert">{alert.username.content}</span><br/></>}

                    <label>이메일</label>
                    <input id="info-edit-email" type="text" name="email" value={user.email || ''} style={{width:'calc(65%)', backgroundColor:'#ddd'}} autoComplete="useremail" disabled/><br/>

                    {!userInfo.kakaoProfileUrl && (
                        <>
                            <label>휴대폰 번호</label>
                            <input type="text" name="tel1" className="tel" maxLength="3" value={user.tel1 || ''} onChange={changeUser} style={{backgroundColor:'#ddd'}} disabled/>-
                            <input type="text" name="tel2" className="tel" maxLength="4" value={user.tel2 || ''} onChange={changeUser} style={{backgroundColor:'#ddd'}} disabled/>-
                            <input type="text" name="tel3" className="tel" maxLength="4" value={user.tel3 || ''} onChange={changeUser} style={{backgroundColor:'#ddd'}} disabled/><br/>
                            {alert.tel.content && <><span className="form-alert">{alert.tel.content}</span><br/></>}
                        </>
                    )}

                    <label>우편번호</label>
                    <input type="text" style={{width: '110px'}} name="zipcode" value={user.zipcode} disabled/>
                    <button id="postcode" onClick={handleComplete}>주소찾기</button><br/>

                    <label>주소</label>
                    <input type="text" name="address" readOnly value={user.address}/><br/>
                    {alert.address.content && <><span className="form-alert">{alert.address.content}</span><br/></>}
                    
                    <label>상세주소</label>
                    <input type='text' name="addressDetail" value={user.addressDetail || ''} onChange={changeUser}/><br/>

                    {/* uploadedProfilePreview 미리보기 이미지 */}
                    <div style={{position: "relative"}}>
                        <label>프로필 사진</label>
                        <img id="profile-img" src={
                                                    // user.uploadedProfilePreview
                                                    // ? user.uploadedProfilePreview
                                                    // : user.kakaoProfileUrl
                                                    // ? user.kakaoProfileUrl.startsWith("http")
                                                    //     ? user.kakaoProfileUrl
                                                    //     : `${serverIP.ip}${user.kakaoProfileUrl}`
                                                    // : user.uploadedProfileUrl
                                                    // ? `${serverIP.ip}${user.uploadedProfileUrl}`
                                                    // : ''

                                                    user.uploadedProfilePreview
                                                    ? user.uploadedProfilePreview
                                                    : user.uploadedProfileUrl
                                                    ? `${serverIP.ip}${user.uploadedProfileUrl}`
                                                    : user.kakaoProfileUrl
                                                    ? user.kakaoProfileUrl.startsWith("http")
                                                    ? user.kakaoProfileUrl
                                                    : `${serverIP.ip}${user.kakaoProfileUrl}`
                                                    : ''
                                                } 
                                                alt="프로필 이미지" 
                                                referrerPolicy="no-referrer" 
                                                onClick={() => document.getElementById('profile-image-file').click()} 
                        />
                        <input type="file" id="profile-image-file" style={{display: "none"}} accept="image/*" onChange={handleImageChange} /><br/>
                        <label htmlFor="profile-image-file" id="profile-image-btn">사진첨부</label><br/>
                    </div>

                    {/* 소개 */}
                    <div className="info-box-style">
                        <label style={{ textAlign: "left" }}>소개</label>
                        <textarea name="infoText" maxLength={200} value={intro} onChange={handleChange} style={{height: "18vh", padding: "10px", fontFamily:'inherit'}} />
                    </div>
                    <div style={{ textAlign: "right", marginTop: "5px", fontSize: "0.9em", color: "#222", width: "97%", marginRight:"10px"}}>
                        <font style={{ color: "#666" }}>{intro.length}</font> / 200
                    </div>

                    <button type="submit" id="signup-btn">수정</button>
                </form>
                <div className="new-pwd-style" onClick={()=>setCurrentPage("pwdPage")} >비밀번호 재설정</div>
            </>
        }

        {currentPage === "pwdPage" && <MyPwdEdit/>}
        </>
        
    );
}

export default MyInfoEdit;