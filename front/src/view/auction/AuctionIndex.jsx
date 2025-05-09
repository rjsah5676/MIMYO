import { setSearch } from "../../store/searchSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setModal } from "../../store/modalSlice";
import Logo from '../../img/mimyo_logo.png';
import { useInView } from "react-intersection-observer";
import axios from "axios";

function AuctionIndex() {

    const search = useSelector((state => state.search));
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const modal = useSelector((state) => state.modal);

    const [hotAuctionList, setHotAuctionList] = useState([]);
    const [closingAuctionList, setClosingAuctionList] = useState([]);
    const [firstSlide, setFirstSlide] = useState(0);
    const [secondSlide, setSecondSlide] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const cardHeight = 302;

    const [visibleSections, setVisibleSections] = useState({
        hotAuction: false,
        closingAuction: false,
        FINAL: false
    });

    useEffect(()=>{
        axios.get(`${serverIP.ip}/auction/getAuctionMap`)
        .then(res=>{
            setHotAuctionList(res.data.hotRooms);
            setClosingAuctionList(res.data.closingRooms);
        })
        .catch(err=>console.log(err));
    },[]);

    useEffect(()=>{
        const handleScroll = () => {
            const y = window.scrollY;
            const newState = {
                hotAuction: y > 600 && y <= 1200,
                closingAuction: y > 1200 && y <=1800,
                FINAL: y>1800
            };
            setVisibleSections(newState);
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    },[])

    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;
    
            if (width >= 1300) {
                setItemsPerPage(5);
            } else if (width >= 1080) {
                setItemsPerPage(4);
            } else if (width >= 768) {
                setItemsPerPage(3);
            } else {
                setItemsPerPage(1);
            }
            setFirstSlide(0);
            setSecondSlide(0);
        };
    
        updateItemsPerPage(); // 초기 실행
        window.addEventListener('resize', updateItemsPerPage);
    
        return () => window.removeEventListener('resize', updateItemsPerPage); // 클린업
    }, []);

    const moveScroll = (num) => {
        window.scrollTo({ top: num });
    }

    const changeSearchWord = (e) => {
        dispatch(setSearch({ ...search, searchWord: e.target.value }));
    }

    const doSearch = () => {
        navigate('/auction/search');
    }

    const doSell = () => {
        navigate('/auction/sell');
    }

    const handleSearch = (event) => {
        if (event.key === "Enter") {
            doSearch();
        }
    }

    const handleTop = (index) => {
        if (index === 1) {
            if (firstSlide > 0) {
                setFirstSlide(0);
            }
        } else if (index === 2) {
            if (secondSlide > 0) {
                setSecondSlide(0);
            }
        }
    }
    
    const handlePrev = (index) => {
        if (index === 1) {
            if (firstSlide > 0) {
                setFirstSlide(firstSlide - 1);
            }
        } else if (index === 2) {
            if (secondSlide > 0) {
                setSecondSlide(secondSlide - 1);
            }
        }
    };

    const handleNext = (index, length) => {
        if (index === 1) {
            if (firstSlide < length / itemsPerPage - 2) {
                setFirstSlide(firstSlide + 1);
            }
        } else if (index === 2) {
            if (secondSlide < length / itemsPerPage - 2) {
                setSecondSlide(secondSlide + 1);
            }
        }
    };

    const handleBottom = (index, length) => {
        if (index === 1) {
            if (firstSlide < length / itemsPerPage - 2) {
                setFirstSlide(Math.ceil(hotAuctionList.length / itemsPerPage) - 2);
            }
        } else if (index === 2) {
            if (secondSlide < length / itemsPerPage - 2) {
                setSecondSlide(Math.ceil(closingAuctionList.length / itemsPerPage) - 2);
            }
        }
    }

    const getTransformY = (index) => {
        if (index === 1) {
            return -firstSlide * cardHeight;
        } else if (index === 2) {
            return -secondSlide * cardHeight;
        }
    };

    const moveInfo = (auct) => {
        navigate(`/auction/room/${auct.roomId}`);
    }
    const isEndingSoon = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = (end - now) / (1000 * 60 * 60);
        return diff <= 2;
    };

    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}｜${hours}:${minutes}`;
    };

    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const eventOptions = ["생일", "결혼", "졸업", "시험", "출산","기념일","기타"];
    const targetOptions = ["여성", "남성", "연인", "직장동료", "부모님", "선생님","친구","기타"];
    const productOptions = {
        "디저트": ["베이커리", "떡", "초콜릿","사탕","전통간식", "음료"],
        "수제먹거리": ["건강식품", "간편식", "가공식품", "반찬", "소스/장류"],
        "농축수산물": ["과일/채소", "잡곡/견과", "정육/계란", "수산물"],
        "의류": ["홈웨어/언더웨어", "티셔츠/니트","셔츠","바지/스커트", "아우터"],
        "패션잡화": ["신발", "모자", "가방", "지갑","파우치","악세사리"],
        "홈인테리어": ["가구", "꽃", "캔들", "홈데코"],
        "주방/생활": ["주방용품", "욕실"],
        "케이스": ["폰케이스", "노트북케이스"],
        "문구": ["인형", "장난감", "다이어리", "노트", "필기도구","키링"],
        "일러스트/사진": ["드로잉", "사진"],
        "화장품": ["네일", "메이크업", "향수"],
        "기타": ["기타"]
    };

    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);

    return (
        <>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '480px', background: 'linear-gradient(to bottom,rgb(225, 250, 224) 0%, #FFFFFF 100%)', zIndex: -1 }} />
            <div className="scroll-indicator-shadow" />
            <div className="scroll-indicator-icon"><div className="aaaarrow"></div></div>
            <div style={{ paddingTop: '50px', height:'2400px' }}>
                <div className={`product-main-container ${
                    !visibleSections.hotAuction && !visibleSections.closingAuction && !visibleSections.FINAL ? 'fade-in' : 'fade-out'
                }`} style={{marginTop:'50px'}}>
                    <div className="search-page-banner">
                        <h1 id="auction-title">🎉 핸드메이드 아이템, <br id="auction-title-br"/>지금 가장 좋은 가격에!</h1>
                        <p>마음에 드는 순간 바로 입찰하고, 소중한 작품의 주인이 되어보세요</p>
                    </div>
                    <div className='product-main-box'>
                        
                        <div className='product-right-box'>
                            <div className="auction-select-box">
                                <select
                                    value={search.eventCategory}
                                    onChange={(e) => dispatch(setSearch({ ...search, eventCategory: e.target.value }))}
                                    className="selectbox-style"
                                >
                                    <option value="">이벤트 선택</option>
                                    {eventOptions.map((event, index) => (
                                        <option key={index} value={event}>{event}</option>
                                    ))}
                                </select>

                                <select
                                    value={search.targetCategory}
                                    onChange={(e) => dispatch(setSearch({ ...search, targetCategory: e.target.value }))}
                                    className="selectbox-style"
                                >
                                    <option value="">대상 선택</option>
                                    {targetOptions.map((target, index) => (
                                        <option key={index} value={target}>{target}</option>
                                    ))}
                                </select>
                                <button onClick={() => dispatch(setModal({
                                    ...modal,
                                    isOpen: true,
                                    selected: "categorymodal",
                                    info: productOptions,
                                }))} id="auction-category-select" className="selectbox-style" style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                    {search.productCategory.length == 0 ? '카테고리 선택' : search.productCategory.map((item, index) => (
                                        <div style={{ display: 'inline-block' }} key={index}> #{item}</div>
                                    ))}
                                </button>
                            </div>
                            <div className="search-wrapper">
                                <div className="search-container">
                                    <input onKeyDown={handleSearch} type="text" value={search.searchWord} placeholder="검색어 입력" onChange={changeSearchWord} className="searchWord-style" />
                                    <button onClick={doSearch} className="searchBtn-style">검색</button>
                                </div>
                                <div className="hashtag-box" style={{marginBottom:'20px'}}>
                                    {search.eventCategory && <span id='search-hashtag'>#{search.eventCategory}</span>}
                                    {search.targetCategory && <span id='search-hashtag'>#{search.targetCategory}</span>}
                                    {search.productCategory && search.productCategory.map((item, index) => (
                                        <span key={index} id='search-hashtag'>#{item}</span>
                                    ))}
                                </div>
                                { user &&
                                    <div className="talent-share-box">
                                        <div className="talent-text">
                                            🏷️ 당신의 작품, 새로운 주인을 찾아요<br />
                                            <span className="highlight">지금, 경매에 출품해보세요!</span>
                                        </div>
                                        <button onClick={doSell} className="sellBtn-style">+ 경매 등록</button>
                                    </div>
                                }

                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <button
                                        id="auction-top-btn"
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4a7b63'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8CC7A5'}
                                        onClick={()=>moveScroll(800)}
                                    >
                                    🔥인기 경매🔥
                                    </button>

                                    <button
                                        id="auction-top-btn"
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4a7b63'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8CC7A5'}
                                        onClick={()=>moveScroll(1400)}
                                    >
                                    ⏰마감 임박 경매⏰
                                    </button>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>

            {[
                {
                    title: '🔥인기 Top50🔥',
                    list: hotAuctionList,
                    visible: visibleSections.hotAuction,
                    slideIndex: 1,
                },
                {
                    title: '🚨마감 임박 Top50🚨',
                    list: closingAuctionList,
                    visible: visibleSections.closingAuction,
                    slideIndex: 2,
                },
            ].map(({ title, list, visible, slideIndex }, sectionIndex) => (
                <div key={sectionIndex} className={`top-auction ${visible ? 'fade-in' : 'fade-out'}`}>
                    <h2 style={{ textAlign: 'center' }}>{title}</h2>
                    <div className="hot-slider-container"
                        style={{
                            width: `${itemsPerPage * 200 + 100}px`,
                            backgroundColor: '#eee',
                            margin: '0 auto',
                            padding: '20px',
                            border: '2px dashed #999',
                            borderRadius: '10px',
                        }}
                    >
                        <div className="hot-product-cards-wrapper" style={{width: `${itemsPerPage * 200 + 100}px`, height: list.length === 0 ? '30px' : '600px', paddingRight: '50px', position: 'relative'}}>
                            {
                                list.length === 0 &&
                                <div>진행 중인 경매가 없습니다.</div>    
                            }
                            <div className="hot-product-cards" style={{ transform: `translateY(${getTransformY(slideIndex)}px)`, display: 'grid', gridTemplateColumns: `repeat(${itemsPerPage}, 1fr)` }}>
                                {list.map((auction, index) => (
                                    <div className="hot-product-card" key={index} style={{ position: 'relative', width: '190px', height: '280px', margin: '10px auto' }}>
                                        <div id="auction-rank">{index + 1}</div>
                                        {isEndingSoon(auction.endTime) && (
                                            <div className="ending-soon" style={{top: '5px', left: '120px', padding: '1px 8px 4px'}}>마감 임박</div>
                                        )}
                                        <div
                                            className="hot-card-content"
                                            style={{ cursor: 'pointer', textAlign: 'center' }}
                                            onClick={() => moveInfo(auction)}
                                        >
                                            <img
                                                style={{
                                                    width: '165px',
                                                    height: '140px',
                                                    objectFit: 'cover',
                                                    borderRadius: '10px',
                                                }}
                                                src={`${serverIP.ip}/uploads/auction/product/${auction.auctionProduct.id}/${auction.auctionProduct.images[0].filename}`}
                                            />
                                            <br />
                                            <span style={{ fontSize: '16px', color: '#333', overflow:'hidden', whiteSpace:'nowrap', textAlign:'ellipsis', display:'inline-block',width:'180px' }}>
                                                {auction.auctionProduct.productName}
                                            </span>
                                            <br />
                                            <span style={{ color: 'black' }}>
                                                현재 입찰가:
                                                <span style={{ fontWeight: '700', fontSize: '17px' }}>
                                                    {' '}
                                                    {formatNumberWithCommas(auction.currentPrice)}
                                                </span>
                                                원
                                            </span>
                                            <br />
                                            <span style={{ fontSize: '13px', color: '#777' }}>즉시 구매가:</span>
                                            <span style={{ fontWeight: '700', fontSize: '15px', color: '#444' }}>
                                                {' '}
                                                {formatNumberWithCommas(auction.buyNowPrice)}
                                            </span>
                                            원
                                            <br />

                                            <span style={{ fontSize: '13px', color: '#444' }}>
                                                👤입찰자:{' '}
                                                <span style={{ fontSize: '16px', fontWeight: '700' }}>{auction.hit}</span>
                                            </span>
                                            <br/>
                                            <span style={{ color: '#444' }}>
                                                ⏰{formatDateTime(auction.endTime)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="auction-slide-btn-wrapper">
                                <button className="auction-slide-btn" onClick={() => handleTop(slideIndex)}>{'⇑'}</button>
                                <button className="auction-slide-btn" onClick={() => handlePrev(slideIndex)}>{'↑'}</button>
                                <button className="auction-slide-btn" onClick={() => handleNext(slideIndex, list.length)}>{'↓'}</button>
                                <button className="auction-slide-btn" onClick={() => handleBottom(slideIndex, list.length)}>{'⇓'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}

export default AuctionIndex;