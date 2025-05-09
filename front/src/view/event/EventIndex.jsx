import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import first from '../../img/1.png';
import second from '../../img/2.png';
import third from '../../img/3.png';
import fourth from '../../img/4.png';
import fifth from '../../img/5.png';
import { setModal } from "../../store/modalSlice";

function EventIndex() {
    const modal = useSelector((state)=>state.modal);
    const [activeTab, setActiveTab] = useState("ongoing");
    const [visibleEvents, setVisibleEvents] = useState(3);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1월=1, 12월=12
    const isFetching = useRef(false);
    const navigate = useNavigate();
    const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);
    const [ongoingEvents, setOngoingEvents] = useState([]);
    const [endedEvents, setEndedEvents] = useState([]);

    const dispatch = useDispatch();

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
    
        axios.get(`${serverIP.ip}/event/getEventList`)
            .then(res => {
                const ongoing = res.data.filter(event => {
                    const end = new Date(event.endDate);
                    return end >= now;
                }).map(event => ({
                    ...event,
                    src: `${serverIP.ip}/uploads/event/${event.id}/${event.filename}`
                }));
    
                const ended = res.data.filter(event => {
                    const end = new Date(event.endDate);
                    return end < now;
                }).map(event => ({
                    ...event,
                    src: `${serverIP.ip}/uploads/event/${event.id}/${event.filename}`
                }));
    
                setOngoingEvents(ongoing);
                setEndedEvents(ended);
            })
            .catch(err => console.log(err));
    }, []);

    const allEvents = activeTab === "ongoing" ? ongoingEvents : endedEvents;

    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const filteredEvents = allEvents.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        const selectedMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const selectedMonthEnd = new Date(currentYear, currentMonth, 0);
        selectedMonthEnd.setHours(23, 59, 59, 999);
    
        return (eventStart <= selectedMonthEnd && eventEnd >= selectedMonthStart);
    });

    const visibleList = filteredEvents.slice(0, visibleEvents);

    useEffect(() => {
        if (inView && visibleEvents < filteredEvents.length && !isFetching.current) {
            isFetching.current = true;
            setTimeout(() => {
                setVisibleEvents(prev => Math.min(prev + 3, filteredEvents.length));
                isFetching.current = false;
            }, 500);
        }
    }, [inView, filteredEvents]);

    useEffect(() => {
        setVisibleEvents(3);
    }, [activeTab, currentMonth, currentYear]);

    const moveEvent = (tar,activeTab) => {
        if (tar.state === 'NOCOUPON') {
            navigate(`/event/info?activeTab=${activeTab}`, { state: tar });
        } else {
            navigate(tar.redirectUrl);
        }
    }

    const [index, setIndex] = useState(0);
    const colors = ['#FFCB46', '#E5C1C5', '#C3E2DD', '#6ECEDA'];

    const shapePath = `
        M67.875,0 
        C67.875,16.97 54.09,30.75 37.125,30.75 
        C-37.125,30.75 -37.125,30.75 -37.125,30.75 
        C-54.09,30.75 -67.875,16.97 -67.875,0 
        C-67.875,-16.97 -54.09,-30.75 -37.125,-30.75 
        C37.125,-30.75 37.125,-30.75 37.125,-30.75 
        C54.09,-30.75 67.875,-16.97 67.875,0z
    `;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIndex(prev => (prev + 1) % colors.length);
        }, 10); // 거의 바로 전환
        
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % colors.length);
        }, 3000); // 3초마다 색상 전환
    
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    const handleEditClick = (id) => {
        if (id) {
            navigate(`/event/edit/${id}`);
        } else {
            alert("이벤트 ID가 없습니다.");
        }
    };

    const handleNoEditClick = () => {
        alert("종료된 이벤트는 수정할 수 없습니다.");
    }

    // 이벤트 삭제
    useEffect(()=>{
        if(modal.delCheck==='event') {
            axios.get(`${serverIP.ip}/event/delEvent?eventId=${modal.selected.split('-')[2]}`,{
                headers: { Authorization: `Bearer ${user.token}` } 
            })
            .then(res=>{
                // 전체 리스트 다시가져오기 
                const now = new Date();
                now.setHours(0, 0, 0, 0);
            
                axios.get(`${serverIP.ip}/event/getEventList`)
                    .then(res => {
                        const ongoing = res.data.filter(event => {
                            const end = new Date(event.endDate);
                            return end >= now;
                        }).map(event => ({
                            ...event,
                            src: `${serverIP.ip}/uploads/event/${event.id}/${event.filename}`
                        }));
            
                        const ended = res.data.filter(event => {
                            const end = new Date(event.endDate);
                            return end < now;
                        }).map(event => ({
                            ...event,
                            src: `${serverIP.ip}/uploads/event/${event.id}/${event.filename}`
                        }));
            
                        setOngoingEvents(ongoing);
                        setEndedEvents(ended);
                        dispatch(setModal({delCheck:''}));
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }
    },[modal.delCheck])

    return (
        <div className="event-container">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '480px', background: 'linear-gradient(to bottom,rgb(255, 236, 211) 0%, #FFFFFF 100%)', zIndex: -1 }} />
            <div className="shape-text-wrapper">
                <span className="shape-text">이벤트</span>

                <svg className="animated-shape" viewBox="-80 -40 160 80"
                        style={{
                            fill: colors[index],
                            transition: 'fill 0.6s ease-in-out',
                            position: 'relative',
                            zIndex: 1
                        }}
                >
                    <path d={shapePath} />

                    <foreignObject x="-50" y="-130" width="100" height="180">
                        <div className="svg-image-container">
                            {index % 4 === 0 && <img src={first} alt="first" className="pop" />}
                            {index % 4 === 1 && <img src={second} alt="second" className="pop" />}
                            {index % 4 === 2 && <img src={third} alt="third" className="pop" />}
                            {index % 4 === 3 && <img src={fourth} alt="third" className="pop" />}
                        </div>
                    </foreignObject>
                </svg>
                <span className="shape-text">모아보기</span>
            </div>

            <div className="info-benefit">
                <div className="part">
                    <span className="info">정보는</span>
                    <span className="highlight" style={{ color: colors[index] }}>
                        {"쏙쏙!".split("").map((char, index) => (
                            <span key={index} style={{ '--i': index }}>
                                {char}
                            </span>
                        ))}
                    </span>
                </div>
                <div className="part">
                    <span className="benefit">혜택은</span>
                    <span className="highlight" style={{ color: colors[index] }}>
                        {"쏠쏠!".split("").map((char, index) => (
                            <span key={index} style={{ '--i': index }}>
                                {char}
                            </span>
                        ))}
                    </span>
                </div>
            </div>

            <div className="calendar-nav">
                <button onClick={() => handlePrevMonth()} className="arrow-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19l-7-7 7-7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <span>
                    {currentYear}.{currentMonth.toString().padStart(2, "0")}
                </span>
                <button onClick={() => handleNextMonth()} className="arrow-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5l7 7-7 7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            </div>


            <div className="tab-menu">
                <button onClick={() => setActiveTab("ongoing")} className={activeTab === "ongoing" ? "active" : ""}>
                    진행 중 이벤트
                </button>
                <button onClick={() => setActiveTab("ended")} className={activeTab === "ended" ? "active" : ""}>
                    완료된 이벤트
                </button>
                {user && user.user.authority === "ROLE_ADMIN" && (
                    <button onClick={() => navigate("/event/write")}>글쓰기</button>
                )}
            </div>

            <div className="event-list">
                {visibleList.length > 0 ? (
                    visibleList.map((event) => (
                        <div className="event-item" key={event.id}>
                            <div onClick={() => moveEvent(event, activeTab)} className={`event-banner ${activeTab === "ended" ? "ended" : ""}`} style={{cursor:'pointer'}}>
                                <img src={event.src} alt={event.eventName} />
                                {event.state === "COUPON" && <div className="coupon-badge">🎉 쿠폰 지급!</div>}
                            </div>
                            <div className="event-details">
                                <div className="event-date" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    📅 {event.startDate.substring(0, 10)} ~ {event.endDate.substring(0, 10)}

                                    {user && user.user.authority === "ROLE_ADMIN" && event.state === "COUPON" && 
                                        <div>
                                            {activeTab !== "ended" && <input type='button' value='수정' className="edit-button" style={{marginRight:'5px'}} onClick={() => handleEditClick(event.id, activeTab)}/>}
                                            {activeTab === "ended" && <input type='button' value='수정' className="edit-button" style={{marginRight:'5px'}} onClick={handleNoEditClick}/>}
                                            <input type='button' value='삭제' className="del-button" id={`event-delll-${event.id}`} />
                                        </div>
                                    }
                                </div>
                                <div className="event-title">{event.eventName}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-events">📌 해당 월에는 이벤트가 없습니다.</div>
                )}
            </div>

            <div ref={ref} className="loading-trigger"></div>
        </div>
    );
}

export default EventIndex;
