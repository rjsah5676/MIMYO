import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { setSearch } from "../store/searchSlice";
import { motion } from 'framer-motion';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HotProduct from "./product/HotProduct";
import RAWProduct from "./product/RAWProduct";
import PopProduct from "./product/PopProduct";

import back from './../img/back.png';

function Main() {
    const [activeTab, setActiveTab] = useState("ongoing");
    const [visibleSubMenus, setVisibleSubMenus] = useState(12);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const isFetching = useRef(false);
    const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.1 });
    const [ongoingSubMenus, setOngoingSubMenus] = useState([]);
    const [endedSubMenus, setEndedSubMenus] = useState([]);
    let serverIP = useSelector((state) => state.serverIP);
    let dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [event_list, setEvent_list] = useState([]);

    const moveToEvent = (tar) => {
        if (tar.state === 'NOCOUPON') {
            navigate('/event/info', { state: tar });
        }
        else {
            navigate(tar.redirectUrl);
        }
    }

    useEffect(() => {
        const now = new Date();
        axios.get(`${serverIP.ip}/event/getEventList`)
            .then(res => {
                const ongoing = res.data.filter(event => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);
                    return start <= now && now <= end;
                })
                .slice(0, 10)
                .map(event => ({
                    ...event,
                    src: `${serverIP.ip}/uploads/event/${event.id}/${event.filename}`
                }));
            setEvent_list(ongoing);
            })
            .catch(err => console.log(err))
    }, [])

    const settings = {
        dots: true,
        infinite: event_list.length > 1,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: event_list.length > 1,
        centerPadding: event_list.length > 1 && window.innerWidth >= 768 ? "20%" : "0",
        autoplay: event_list.length > 1,
        autoplaySpeed: 5000,
        appendDots: (dots) => (
            <div
                style={{
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <ul> {dots} </ul>
            </div>
        ),
        dotsClass: 'dots_custom'
    };

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        axios.get(`${serverIP.ip}/submenu/getSubMenuList`)
            .then(res => {
                const ongoing = res.data.filter(submenu => {
                    const end = new Date(submenu.endDate);
                    return end >= now;
                }).map(submenu => ({
                    ...submenu,
                    src: `${serverIP.ip}/uploads/submenu/${submenu.id}/${submenu.filename}`
                }));

                const ended = res.data.filter(submenu => {
                    const end = new Date(submenu.endDate);
                    return end < now;
                }).map(submenu => ({
                    ...submenu,
                    src: `${serverIP.ip}/uploads/submenu/${submenu.id}/${submenu.filename}`
                }));

                setOngoingSubMenus(ongoing);
                setEndedSubMenus(ended);
            })
            .catch(err => console.log(err));
    }, []);

    const allSubMenus = activeTab === "ongoing" ? ongoingSubMenus : endedSubMenus;


    const filteredSubMenus = allSubMenus.filter((submenu) => {
        const subMenuStart = new Date(submenu.startDate);
        const subMenuEnd = new Date(submenu.endDate);
        const selectedMonthStart = new Date(currentYear, currentMonth - 1, 1);
        const selectedMonthEnd = new Date(currentYear, currentMonth, 0);
        selectedMonthEnd.setHours(23, 59, 59, 999);

        return (subMenuStart <= selectedMonthEnd && subMenuEnd >= selectedMonthStart);
    });

    const visibleList = filteredSubMenus.slice(0, visibleSubMenus);

    useEffect(() => {
        if (inView && visibleSubMenus < filteredSubMenus.length && !isFetching.current) {
            isFetching.current = true;
            setTimeout(() => {
                setVisibleSubMenus(prev => Math.min(prev + 3, filteredSubMenus.length));
                isFetching.current = false;
            }, 500);
        }
    }, [inView, filteredSubMenus]);

    useEffect(() => {
        setVisibleSubMenus(12);
    }, [activeTab, currentMonth, currentYear]);

    const moveSubMenu = (tar) => {
        const str = tar.subMenuCategory;

        const result = [];
        const regex = /\[[^\]]*\]|[^,]+/g;
        
        let match;
        while ((match = regex.exec(str)) !== null) {
          result.push(match[0]);
        }

        const cleaned = result.map(item =>
            item.startsWith('[') && item.endsWith(']')
              ? item.slice(1, -1)
              : item
        );
        const [a, b, c] = cleaned;
        let ec='';
        let tc='';
        let cList=[];
        if(a!=='전체') ec=a;  
        if(b!=='전체') tc=b;
        if(c.length > 0)
            cList = c.split(',');
        dispatch(setSearch({searchWord:'',eventCategory:ec,targetCategory:tc, productCategory:cList}));
        navigate('/product/search');
    }

    const { ref: hotRef, inView: isHotInView } = useInView({
        triggerOnce: true,
        threshold: 0.15,
        rootMargin: "0px 0px -350px 0px"
    });

    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (isHotInView && !hasAnimated) {
            setHasAnimated(true);
        }
    }, [isHotInView, hasAnimated]);

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: 'easeOut',
          },
        },
    };

    const { ref: rawRef, inView: rawInView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
        rootMargin: "0px 0px -200px 0px"
    });
    const [rawAnimated, setRawAnimated] = useState(false);
    
    useEffect(() => {
        if (rawInView && !rawAnimated) {
            setRawAnimated(true);
        }
    }, [rawInView, rawAnimated]);

    const { ref: popRef, inView: popInView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
        rootMargin: "0px 0px -200px 0px"
    });
    const [popAnimated, setPopAnimated] = useState(false);
    
    useEffect(() => {
        if (popInView && !popAnimated) {
            setPopAnimated(true);
        }
    }, [popInView, popAnimated]);


    return (
        <div style={{ paddingTop: '80px' }}>

            <div className="image-container">
                <img src={back} alt="back" className="background-image" />
                <div className="main-text-box">
                    <div className="main-text">
                        <span className="word" style={{ animationDelay: '0.3s' }}>손끝에서&nbsp;</span>
                        <span className="word" style={{ animationDelay: '0.6s' }}>탄생한&nbsp;</span>
                        <span className="word" style={{ animationDelay: '0.9s' }}>특별함,&nbsp;</span>
                        <span className="word" style={{ animationDelay: '1.2s' }}>당신을&nbsp;</span>
                        <span className="word" style={{ animationDelay: '1.5s' }}>위한&nbsp;</span>
                        <span className="word" style={{ animationDelay: '1.8s' }}>
                            <span className="highlight-circle">수</span>
                            <span className="highlight-circle">제</span>
                            <span className="highlight-circle">작</span>
                            <span className="highlight-circle">품</span>&nbsp;
                        </span>
                        <span className="word" style={{ animationDelay: '2.1s' }}>공간</span>
                    </div>
                </div>
            </div>

            <div className="slider-container">
                <Slider {...settings} className={event_list.length === 1 ? "slick-center" : ""}>
                    {event_list.map((item, idx) => (
                        <div key={idx} className="slider-image-banner">
                            <div className="slider-image-wrapper">
                                <img
                                    className="slider-image"
                                    src={item.src}
                                    alt={item.eventName}
                                />
                                <div className="event-date-badge">
                                    📅 {item.startDate.substring(0, 10)} ~ 📅 {item.endDate.substring(0, 10)}
                                </div>
                                {item.state === "COUPON" && <div className="main-coupon-badge">🎉 쿠폰 지급!</div>}
                                <div className="event-button" onClick={() => moveToEvent(item)}>👀 자세히보기 ➔</div>
                            </div>

                        </div>
                    ))}
                </Slider>
            </div>

            <div className="mimyo-main-section">
                <h2 className="mimyo-main-title">🎁 MIMYO 핸드메이드 셀렉션</h2>
                <p className="mimyo-main-subtext">
                    정성과 감성을 담아 만든 핸드메이드 아이템,<br />
                    <span className="mimyo-main-highlight">MIMYO가 이번 달 추천하는 컬렉션</span>을 만나보세요.
                </p>
            </div>

            <div className="submenu-grid">
                {visibleList.length > 0 ? (
                    visibleList.map((submenu) => (
                        <div className="submenu-grid-item" onClick={() => moveSubMenu(submenu)} key={submenu.id}>
                            <img id="submenu-img" src={submenu.src} alt={submenu.subMenuName}/>
                            <div style={{fontSize: '11pt', padding: '10px 0'}}>{submenu.subMenuName}</div>
                        </div>
                    ))
                ) : (
                    <></>
                )}
            </div>
            <motion.div
                className='hot-product-container'
                ref={hotRef}
                initial="hidden"
                animate={hasAnimated ? 'visible' : 'hidden'}
                variants={fadeUp}
                style={{marginBottom:'150px'}}
            >
                <HotProduct/>
            </motion.div>
            <motion.div
                className='raw-container'
                ref={rawRef}
                initial="hidden"
                animate={rawAnimated ? 'visible' : 'hidden'}
                variants={fadeUp}
                style={{marginBottom:'150px'}}
            >
                <RAWProduct/>
            </motion.div>
            <motion.div
                className='hot-product-container'
                ref={popRef}
                initial="hidden"
                animate={popAnimated ? 'visible' : 'hidden'}
                variants={fadeUp}
                style={{marginBottom:'150px'}}
            >
                <PopProduct/>
            </motion.div>
        </div>
    );
}

export default Main;