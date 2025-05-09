import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../../store/authSlice";

function MyPwdEdit(){

    const serverIP = useSelector((state) => {return state.serverIP});
    const user = useSelector((state) => state.auth.user);

    //로그아웃
    const dispatch = useDispatch();
    function handleLogout() {
        localStorage.removeItem("token");
        dispatch(clearUser());
        window.location.href = '/';
    }

    //현재 비밀번호 입력값, 재설정할 비밀번호 담을 변수
    let [modData, setModData] = useState({
        currentUserPw : '',
        modUserPw : ''
    })

    //현재 비밀번호 입력값이 맞으면 재설정 화면 보여주기위해 
    let [pwFound, setPwFound] = useState(false);

    //현재 비밀번호 입력값이 맞는지 체크
    async function pwdCheck(event) {
        event.preventDefault();

        if(user)        
            axios.post(`${serverIP.ip}/mypage/pwdCheck`, JSON.stringify({userId: user.user.id, currentUserPw: modData.currentUserPw}) , {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:`Bearer ${user.token}`
                }
            })
            .then(res => {
                if(res.data === "pwdCheckOk") {
                    setPwFound(true);
                }
            })
            .catch(err => {
                if (err.response && err.response.data === "pwdCheckFail") {
                    alert("비밀번호가 일치하지 않습니다. 다시 작성해주세요.");
                } else {
                    console.log(err);
                }
            })
    }

    //입력하는 값이 변경되면 호출됨
    function setFormData(event) {
        const { name, value } = event.target;

        setModData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    /* start : 유효성 검사 */
    let [pwError, setPwError] = useState("");
    let [pwCheckError, setPwCheckError] = useState("");
    const passwordPattern = /^[A-Za-z0-9`~!@#$%^&*?]{8,14}$/;

    function handlePasswordChange(event) {
        const { name, value } = event.target;
        setModData((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if (name === "modUserPw") {
            // 비밀번호 패턴 검사
            if (value && !passwordPattern.test(value)) {
                setPwError("비밀번호는 8자 이상 14자 이하의 영어, 숫자, 특수문자만 가능합니다.");
            } else {
                setPwError("");
            }
        }

        if (name === "modUserPw" || name === "modUserPwCheck") {
            const pw = name === "modUserPw" ? value : modData.modUserPw;
            const pwCheck = name === "modUserPwCheck" ? value : modData.modUserPwCheck || "";
        
            // 비밀번호 패턴 검사
            if (name === "modUserPw") {
                if (value && !passwordPattern.test(value)) {
                    setPwError("비밀번호는 8자 이상 14자 이하의 영어, 숫자, 특수문자만 가능합니다.");
                } else {
                    setPwError("");
                }
            }
        
            // 비밀번호 일치 검사
            if (pwCheck === "") {
                setPwCheckError("");
            } else if (pw !== pwCheck) {
                setPwCheckError("비밀번호가 일치하지 않습니다.");
            } else {
                setPwCheckError("");
            }
        }
    }
    /* end : 유효성 검사 */

    //비밀번호 재설정
    async function pwdMod(event) {
        event.preventDefault();

        // 유효성 검사 실패 시 요청 막기
        if (pwError || pwCheckError) {
            alert("비밀번호 입력을 확인해주세요.");
            return;
        }

        if(user)        
            axios.post(`${serverIP.ip}/mypage/pwdEdit`, JSON.stringify({userId: user.user.id, modUserPw: modData.modUserPw}) , {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:`Bearer ${user.token}`
                }
            })
            .then(res => {
                if(res.data==="pwdEditOk"){
                    window.alert("정상적으로 수정이 완료되었습니다.\n다시 로그인해주세요.");
                    handleLogout();
                }else{
                    alert("비밀번호 변경에 실패했습니다.");
                }
            })
            .catch(err => {
                console.log(err);
                alert("비밀번호 변경에 실패했습니다.");
            })
    }

    return(
        <div>
            <form onSubmit={pwdCheck}>
                <div className="sign-up-form">
                    <input type="text" name="username" value={user?.user?.id || ''} autoComplete="username" style={{ display: 'none'}} readOnly />{/* 숨겨진 username 필드 추가 - console경고떠서추가해줌 */}

                    <label>현재 비밀번호</label>
                    <input type='password' id="currentUserPw" name="currentUserPw" onChange={setFormData} autoComplete="new-password" disabled={pwFound} style={pwFound ? { backgroundColor: '#ddd', marginBottom:'50px' } : {}}/><br/>
                    {!pwFound && (
                        <input type="submit" id="signup-btn" value="비밀번호 확인" />
                    )}
                </div>
            </form>

            {pwFound && (
                <form onSubmit={pwdMod}>
                    <div className="sign-up-form">
                        <input type="text" name="username" value={user?.user?.id || ''} autoComplete="username" style={{ display: 'none' }} readOnly />{/* 숨겨진 username 필드 추가 - console경고떠서추가해줌 */}

                        <label>비밀번호 재설정</label>
                        <input type='password' id="modUserPw" name="modUserPw" onChange={handlePasswordChange} autoComplete="new-password" /><br/>
                        {pwError && <><span style={{lineHeight:'1.6', fontSize:'9pt', fontWeight:'bold', color:'#f37373', marginLeft:'10px'}}>{pwError}</span><br/></>} 

                        <label>비밀번호 재설정 확인</label>
                        <input type='password' id="modUserPwCheck" name="modUserPwCheck" autoComplete="new-password" onChange={handlePasswordChange}/><br/>
                        {pwCheckError && <><span style={{lineHeight:'1.6', fontSize:'9pt', fontWeight:'bold', color:'#f37373', marginLeft:'10px'}}>{pwCheckError}</span><br/></>}

                        <input type="submit" id="signup-btn" value="수정하기" />
                    </div>
                </form>
            )}
        </div>
        
    )
}

export default MyPwdEdit;