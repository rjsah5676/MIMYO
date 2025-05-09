import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../store/authSlice";

const NaverSignupHandler = () => {
    const [isLoading, setIsLoading] = useState(true); // 초기값 true (로딩 시작)
    const code = new URL(window.location.href).searchParams.get('code');
    const serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (param) => {
        try {
            const response = await axios.post(`${serverIP.ip}/auth/socialLogin`, param, { withCredentials: true });

            if (response.status === 200) {
                dispatch(setUser(response.data));
                window.location.href='/';
            }
        } catch (err) {
            if(err.response.data.substring(0,2) === '정지') {
                alert('정지된 사용자입니다.');
            }
            else alert((err.response.data || "서버 오류"));
        }
    };

    useEffect(() => {
        if (code) {
            axios.get(`${serverIP.ip}/signup/naver?code=${code}`)
                .then((res) => {
                    setIsLoading(false);
                    if (!res.data) {
                        navigate('/already');
                    } else {
                        handleLogin(res.data);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert("회원가입에 실패했습니다. 다시 시도해주세요.");
                    navigate("/");
                });
        }
    }, [code, serverIP, navigate]);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            {isLoading && <div className="loader"></div>} {/* 🔄 로딩 화면 표시 */}
        </div>
    );
}

export default NaverSignupHandler;