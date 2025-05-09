import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setInteract } from "../store/interactSlice";
import { setModal } from "../store/modalSlice";
import axios from "axios";

function Interact() {
    const [dm, setDm] = useState(false);
    const [report, setReport] = useState(false);

    const loc = useLocation();

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);
    const interact = useSelector((state) => state.interact);
    const modal = useSelector((state) => state.modal);

    const closePopup = () => {
        dispatch(setInteract({ ...interact, isOpen: false }));
    };

    const moveInfo = (where) => {
        dispatch(setInteract({ ...interact, isOpen: false }));
        navigate('/userinfo', { state: interact.selected });
        window.scrollTo({ top: 0 });
    }

    const openMessage = (wh) => {
        dispatch(setModal({ selected: wh, isOpen: true }));
    }

    const openChatting = () => {
        axios.get(`${serverIP.ip}/chat/createChatRoom?userId=${interact.selected}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => {
            navigate(`/product/chat/${res.data}`);
        })
        .catch(err=>console.log(err));
    }

    return (
        <>
            <div className="interact-popup" style={{ left: interact.pageX, top: interact.pageY, zIndex: modal.isOpen ? 10005 : 2000 }}>
                <div className="interact-exit" onClick={closePopup}>x</div>
                <ul className="interact-list">
                    <li className="interact-item" onClick={() => moveInfo(interact.selected)}>정보 보기</li>
                    <li className="interact-item" onClick={() => openMessage('message')}>쪽지 보내기</li>
                    <li className="interact-item" onClick={() => openChatting()}>채팅 하기</li>
                    <li className="interact-item" onClick={() => openMessage('report')}>신고 하기</li>
                </ul>
            </div>
        </>
    );
}

export default Interact;