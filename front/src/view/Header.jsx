import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/authSlice";
import { setLoginView } from "../store/loginSlice";
import { setModal } from "../store/modalSlice";
import { setSearch } from "../store/searchSlice";

import axios from "axios";

import { motion } from "framer-motion";
import Logo from '../img/mimyo_logo-removebg.png';
import Login from "./user/Login";
import { setMenuModal } from "../store/menuSlice";

function Header() {
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const search = useSelector((state => state.search));
    const [searchWord, setSearchWord] = useState('');
    const navigate = useNavigate();

    const menuModal = useSelector((state) => state.menuModal);

    const user = useSelector((state) => state.auth.user);
    const loginView = useSelector((state) => state.loginView);
    const dispatch = useDispatch();
    const menuButtonRef = useRef(null);
    const menuRef = useRef(null);
    let serverIP = useSelector((state) => state.serverIP);
    const [messageCount, setMessageCount] = useState(0);
    const [couponCount, setCouponCount] = useState(0);

    const [messageList, setMessageList] = useState([]);

    const [grade, setGrade] = useState(['✊', '☝️', '✌️', '🖐️']);
    const [hamburgerOpen, setHamburgerOpen] = useState(false);

    const [basketCount, setBasketCount] = useState(0);

    const [hotSearch, setHotSearch] = useState([]);
    const [currentRank, setCurrentRank] = useState(0);
    const [hotSearchOpen, setHotSearchOpen] = useState(false);
    const [recentSearchList, setRecentSearchList] = useState([]);
    const [isFocused, setIsFocused] =useState(false);
    
    useEffect(() => {
        const changeRankInterval = setInterval(() => {
            setCurrentRank((prevRank) => (prevRank + 1) % hotSearch.length); // 순위를 순차적으로 변경
        }, 3000);

        return () => clearInterval(changeRankInterval);
    }, [hotSearch]);

    function handleLogout() {
        localStorage.removeItem("token");
        dispatch(clearUser());
        window.location.href = '/';
    }

    useEffect(()=>{
        if (user) {
            getRecentSearch();
        }

        const fetchKeywords = async () => {
            const res = await axios.get(`${serverIP.ip}/log/searchRank?hours=24&topN=10`);
            setHotSearch(res.data);
        };
    
        fetchKeywords();
        const intervalId = setInterval(fetchKeywords, 600000); //10분이용
    
        return () => clearInterval(intervalId);
    },[])

    useEffect(() => {
        if (user)
            axios.get(`${serverIP.ip}/interact/getMessageList`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    setMessageList(res.data);
                    let cnt = 0;
                    res.data.forEach((item) => {
                        if (item.state == 'READABLE') cnt++;
                    })
                    setMessageCount(cnt);
                })
                .catch(err => console.log(err))

        if (user)
            axios.get(`${serverIP.ip}/basket/list`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    setBasketCount(res.data.length);
                })
                .catch(err => console.log(err));

        if (user) {
            axios.get(`${serverIP.ip}/checkLogin`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(res => {
            })
            .catch(err => {
                alert("다시 로그인 해주세요");
                /*
                if (err.response && err.response.status === 401) {
                    
                }*/
                handleLogout();
            });
        }

        if (user)
            axios.get(`${serverIP.ip}/interact/getCouponList`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    setCouponCount(res.data.length);
                })
                .catch(err => console.log(err));

        function updateMenuPosition() {
            if (menuButtonRef.current) {
                const rect = menuButtonRef.current.getBoundingClientRect();
                setMenuPosition({
                    top: rect.bottom + 5,
                    left: rect.left + window.scrollX
                });
            }
        }

        if (menuModal) {
            updateMenuPosition();
            window.addEventListener("resize", updateMenuPosition);
        }

        return () => {
            window.removeEventListener("resize", updateMenuPosition);
        };
    }, [menuModal]);

    const changeSearch = (e) => {
        setSearchWord(e.target.value);
    }

    const handleSearch = (event) => {
        if (event.key === "Enter") {
            dispatch(setSearch({ ...search, searchWord: searchWord }));
            navigate('/product/search');
        }
    }

    const movePage = (where) => {
        dispatch(setMenuModal(false));
        navigate(where);
    }

    const getRecentSearch = ()=>{
        axios.get(`${serverIP.ip}/log/recentSearch`, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res=>{
            setRecentSearchList(res.data);
        })
        .catch(err=>console.log(err));
    }
    const deleteRecentSearch = (searchWord)=>{
        const url = searchWord
        ? `${serverIP.ip}/log/deleteRecentSearch?searchWord=${searchWord}`
        : `${serverIP.ip}/log/deleteRecentSearch`;

        axios.get(url, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(()=>getRecentSearch())
        .catch(err=>console.log(err));
    }

    return (
        <div className={user && user.user.authority == 'ROLE_ADMIN' ? 'header-container-admin' : 'header-container'}>
            <ul className='header-nav'>
                <li className='header-left'>
                    <Link to='/'>
                        <img src={Logo} width='100' className="header-logo" />
                    </Link>
                </li>
                {user && user.user.authority == 'ROLE_ADMIN' ?
                    <li className='header-center'>
                        <ul>
                            <Link to='/admin/reportlist'><li>관리자 페이지</li></Link>
                            <Link to='/event'><li>이벤트 관리</li></Link>
                            <Link to='/submenu'><li>서브메뉴 관리</li></Link>
                        </ul>
                    </li> : <li className='header-center'>
                        <ul>
                            <li style={{ cursor: 'pointer' }} onClick={() => movePage('/product/search')}>상품 검색</li>
                            <Link to='/recommend'><li>상품 추천</li></Link>
                            <Link to='/event'><li>이벤트</li></Link>
                            <Link to='/auction'><li>실시간 경매</li></Link>
                        </ul>
                    </li>
                }
                <li className='header-right'>
                    {user ? (
                        <>
                            <div ref={menuButtonRef} className="menu-icon" onClick={() => dispatch(setMenuModal(!menuModal))}>
                                <img src={user.user.imgUrl.indexOf('http') !== -1 ? `${user.user.imgUrl}` : `${serverIP.ip}${user.user.imgUrl}`} alt='' width={40} height={40} style={{ objectFit: 'cover', borderRadius: '100%', backgroundColor: 'white' }} />
                                <div style={{ color: 'white', textAlign: 'center', width: '120px', fontSize: '15px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.user.username} {grade[user.user.grade]}</div>
                            </div>
                        </>
                    ) : (
                        <div style={{color:'white', justifyContent:'center'}} className="menu-icon" onClick={() => dispatch(setLoginView(true))}><div style={{width:'70%',textAlign:'right', paddingRight:'20px'}}>로그인</div></div>
                    )}
                    <div className='header-hot-box' onMouseEnter={() => setHotSearchOpen(true)}
                                onMouseLeave={() => setHotSearchOpen(false)}>
                    {hotSearch.length > 0 && (
                        <div className="hot-search-item">
                            <div style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
                                <span style={{paddingLeft:'10px'}}>{currentRank + 1} </span>
                                {hotSearch[currentRank]?.keyword}
                            </div>
                        </div>
                    )}
                    {hotSearchOpen && hotSearch.length > 0 && (
                        <div className="hot-search-dropdown" onMouseEnter={() => setHotSearchOpen(true)}
                        onMouseLeave={() => setHotSearchOpen(false)}>
                            {hotSearch.map((item, index) => (
                                <div key={index} className="hot-search-list-item">
                                    <div onClick={()=>{dispatch(setSearch({ ...search, searchWord: item.keyword }));navigate('/product/search');}} style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
                                        <span>{index + 1} </span>
                                        {item.keyword}
                                        <span style={item.change>0?{fontSize:'12px',color:'red'}:{fontSize:'12px',color:'blue'}}> {item.change > 0  ? `${item.change}▲` : item.change < 0 ? `${-item.change}▼` : ''}</span>
                                        <span style={{fontSize:'12px',color:'green'}}> {item.change === 'NEW' && 'NEW' }</span>
                                    </div>
                                    
                                </div>
                            ))}
                        </div>
                    )}
                    </div>
                    <div className='header-search-box'>
                        <svg style={{ paddingLeft: '10px' }} className='search-icon' width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="2" />
                            <line x1="15" y1="15" x2="22" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input type='text' className="search-input" placeholder="검색어를 입력해주세요"
                            onChange={changeSearch} onKeyDown={handleSearch}
                            onFocus={()=>setIsFocused(true)} onBlur={()=>setIsFocused(false)} />
                        {
                            isFocused &&
                            <div className="recent-search-list">
                                <div style={{display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '9pt', paddingBottom: '10px'}}>
                                    <span>최근 검색어</span>
                                    <span style={{cursor: 'pointer'}}
                                        onMouseDown={(e)=>{
                                            e.preventDefault();
                                            deleteRecentSearch()}}
                                            >전체 삭제
                                    </span>
                                </div>
                                {recentSearchList.map((item, index) => (
                                    <div key={index}
                                        className="recent-search-list-item">
                                        ⏲ <span style={{cursor: 'pointer'}}
                                            onMouseDown={()=>{
                                            dispatch(setSearch({ ...search, searchWord: item }));
                                            navigate('/product/search');
                                        }}>{item}</span>
                                        <span style={{color: '#999', float: 'right', cursor: 'pointer'}}
                                            onMouseDown={(e)=>{
                                            e.preventDefault();
                                            deleteRecentSearch(item);}}
                                            >×
                                        </span>
                                    </div>
                                ))}
                                {
                                    recentSearchList.length === 0 &&
                                    <div style={{fontSize: '9pt', paddingTop: '5px', textAlign: 'center'}}>최근 검색어 내역이 없습니다.</div>
                                }
                            </div>
                        }
                    </div>
                    <div
                    className="hamburger-wrapper"
                    style={{ width: '80ox', lineHeight: '80px' }}
                    onMouseEnter={() => setHamburgerOpen(true)}
                    onMouseLeave={() => setHamburgerOpen(false)}
                >
                    <div className="hamburger">☰</div>

                    {hamburgerOpen && (
                        user && user.user.authority === 'ROLE_ADMIN' ? (
                            <ul className="hamburger-menu">
                                <Link to='/admin/reportlist'><li>관리자 페이지</li></Link>
                                <Link to='/event'><li>이벤트 관리</li></Link>
                            </ul>
                        ) : (
                            <ul className="hamburger-menu">
                                <li style={{ cursor: 'pointer' }} onClick={() => movePage('/product/search')}>상품 검색</li>
                                <Link to='/recommend'><li>상품 추천</li></Link>
                                <Link to='/event'><li>이벤트</li></Link>
                                <Link to='/auction'><li>실시간 경매</li></Link>
                            </ul>
                        )
                    )}
                </div>
                </li>

            </ul>

            <motion.div
                ref={menuRef}
                className={`dropdown-menu ${menuModal ? "show" : ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: menuModal ? 1 : 0 }}
                style={{ top: `${menuPosition.top + 10}px`, left: `${menuPosition.left}px` }}
            >
                <div className="menu-grid">
                    <div className="menu-item" onClick={() => movePage('/mypage/profile')}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
                            <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" />
                        </svg>
                        <span>내 정보</span>
                    </div>

                    <div className="menu-item" onClick={() => movePage('/mypage/basket')}>
                        <div className="icon-container">
                            <svg transform="translate(-3,0)" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6h15l-2 9H8L6 6z" stroke="white" strokeWidth="2" />
                                <circle cx="9" cy="20" r="1.5" fill="white" />
                                <circle cx="17" cy="20" r="1.5" fill="white" />
                            </svg>
                            {basketCount > 0 && <div className="badge"><span>{basketCount}</span></div>}
                        </div>
                        <span>장바구니</span>
                    </div>

                    <div className="menu-item" onClick={() => { dispatch(setModal({ isOpen: true, selected: 'message-box' })) }}>
                        <div className="icon-container">
                            <svg transform="translate(0,4)" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 4h16v14H4z" stroke="white" strokeWidth="2" />
                                <path d="M4 4l8 7 8-7" stroke="white" strokeWidth="2" />
                            </svg>
                            {messageCount > 0 && <div className="badge"><span>{messageCount}</span></div>}
                        </div>
                        <span>쪽지</span>
                    </div>
                    <div className="menu-item" onClick={() => movePage('/mypage/coupons')}>
                        <div className="icon-container">
                            <svg transform="translate(0,-1)" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2 2 0 1 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2 2 0 1 0 0-6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 6v12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {couponCount > 0 && <div className="badge"><span>{couponCount}</span></div>}
                        </div>
                        <span>쿠폰함</span>
                    </div>
                    <div className="menu-item" onClick={() => movePage('/customerservice/faq')}>
                        <svg transform="translate(0,-4)" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12V11a8 8 0 0 1 16 0v1" stroke="white" strokeWidth="2" />
                            <path d="M2 15a2 2 0 1 0 4 0v-2H2v2ZM18 13v2a2 2 0 1 0 4 0v-2h-4Z" stroke="white" strokeWidth="2" />

                        </svg>
                        <span>고객센터</span>
                    </div>
                    <div className="menu-item" onClick={handleLogout}>
                        <svg transform="translate(2,-4)" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 3h10v18H3" stroke="white" strokeWidth="2" />
                            <path d="M17 16l4-4m0 0l-4-4m4 4H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>로그아웃</span>
                    </div>
                </div>
            </motion.div>

            <div className={`login-wrapper ${loginView ? 'show' : ''}`}>
                <Login onClose={() => dispatch(setLoginView(false))} />
            </div>
        </div>
    );
}

export default Header;