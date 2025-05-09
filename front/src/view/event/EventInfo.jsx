import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setModal } from "../../store/modalSlice";
import axios from "axios";

function EventInfo() {
    const modal = useSelector((state)=>state.modal);

    const loc = useLocation();
    const { eventName, filename, startDate, endDate, content, id } = loc.state;

    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("ongoing");
    const dispatch = useDispatch();

    useEffect(() => {
        const tab = searchParams.get("activeTab"); // URL에서 activeTab 꺼냄
        if (tab) {
            setActiveTab(tab); // 있으면 set 해주기
        }
    }, [searchParams]);


    const handleEditClick = () => {
        if (id) {
            navigate(`/event/edit/${id}`);
        } else {
            alert("이벤트 ID가 없습니다.");
        }
    };

    const handleNoEditClick = () => {
        alert("종료된 이벤트는 수정할 수 없습니다.");
    }

    useEffect(()=>{
        if(modal.delCheck==='event') {
            axios.get(`${serverIP.ip}/event/delEvent?eventId=${modal.selected.split('-')[2]}`,{
                headers: { Authorization: `Bearer ${user.token}` } 
            })
            .then(res=>{
                if(res.data==="delEventOk"){
                    dispatch(setModal({delCheck:''}));
                    navigate(`/event`);
                }
            })
            .catch(err => console.log(err));
        }
    },[modal.delCheck])


    return (
        <div style={{ paddingTop: "150px" }}>
            <div className="event-info-container">
                <h2 className="event-info-title">{eventName}</h2>  
                <div className="event-info-date">📅 {startDate.substring(0,10)} ~ 📅 {endDate.substring(0,10)}</div>
                <img
                    src={`${serverIP.ip}/uploads/event/${id}/${filename}`}
                    alt="이벤트 이미지"
                    className="event-main-image"
                />
                <div
                    className="event-info-content"
                    dangerouslySetInnerHTML={{ __html: content }}
                ></div>
                {user && user.user.authority === "ROLE_ADMIN" && (
                    <div style={{textAlign:'right'}}>
                        {activeTab !== "ended" && <input type='button' value='수정' className="edit-button" style={{marginRight:'5px'}} onClick={handleEditClick}/>}
                        {activeTab === "ended" && <input type='button' value='수정' className="edit-button" style={{marginRight:'5px'}} onClick={handleNoEditClick}/>}
                        <input type='button' value='삭제' className="del-button" id={`event-delll-${id}`}/>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventInfo;
