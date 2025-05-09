import { setSearch } from "../../store/searchSlice";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { setModal } from "../../store/modalSlice";
import Logo from '../../img/mimyo_logo.png';
import { useInView } from "react-intersection-observer";
import axios from "axios";
import HotProduct from "./HotProduct";
import RAWProduct from "./RAWProduct";


function ProductIndex() {

    const search = useSelector((state => state.search));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [visibleSections, setVisibleSections] = useState({
        hotProduct: false,
        RAW: false,
    });

    useEffect(()=>{
        const handleScroll = () => {
            const y = window.scrollY;
            const newState = {
                hotProduct: y > 600 && y <= 1200,
                RAW: y > 1200 && y <=1800,
                FINAL: y>1800
            };
            setVisibleSections(newState);
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    },[])

    const moveScroll = (num) => {
        window.scrollTo({ top: num });
    }

    const modal = useSelector((state) => state.modal);

    const changeSearchWord = (e) => {
        dispatch(setSearch({ ...search, searchWord: e.target.value }));
    }

    const doSearch = () => {
        navigate('/product/search');
    }

    const doSell = () => {
        navigate('/product/sell');
    }

    const handleSearch = (event) => {
        if (event.key === "Enter") {
            doSearch();
        }
    }

    /* 상품 검색 카테고리 */
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
        <div style={{ height:'2400px' }}>
            <div className="scroll-indicator-shadow" />
            <div className="scroll-indicator-icon"><div className="aaaarrow"></div></div>
            <div
            className={`product-main-container ${
                !visibleSections.hotProduct && !visibleSections.RAW && !visibleSections.FINAL ? 'fade-in' : 'fade-out'
            }`}
            >
                <div className="search-page-banner">
                    <h1>👐 손끝에서 전해지는 정성, 핸드메이드의 따뜻함</h1>
                    <p>취향과 순간에 어울리는 핸드메이드 아이템을 지금 찾아보세요</p>
                </div>
                <div className='product-main-box'>
                    <div className='product-right-box'>
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
                        }))} className="selectbox-style" style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                            {search.productCategory.length == 0 ? '카테고리 선택' : search.productCategory.map((item, index) => (
                                <div style={{ display: 'inline-block' }} key={index}> #{item}</div>
                            ))}
                        </button>
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
                                    ✨ 당신의 손길이 작품이 됩니다<br />
                                    <span className="highlight">지금, 재능을 공유해보세요</span>
                                </div>
                                <button onClick={doSell} className="sellBtn-style">+ 상품 등록</button>
                            </div>
                            }
                            <button
                            style={{
                                backgroundColor: '#8CC7A5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                marginRight: '10px',
                                cursor: 'pointer',
                                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                                transition: 'background-color 0.2s ease-in-out',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4a7b63'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8CC7A5'}
                            onClick={()=>moveScroll(800)}
                            >
                            🏆 인기 카테고리
                            </button>

                            <button
                            style={{
                                backgroundColor: '#8CC7A5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                                transition: 'background-color 0.2s ease-in-out',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4a7b63'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8CC7A5'}
                            onClick={()=>moveScroll(1400)}
                            >
                            🌟 인기 작품 💖
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/*
        <div className={`hot-container ${visibleSections.hotProduct ? 'fade-in' : 'fade-out'}`}>
            <HotProduct />
        </div>
        <div className={`raw-container ${visibleSections.RAW ? 'fade-in' : 'fade-out'}`}>
            <RAWProduct />
        </div>
        */}
        </>
    )
}

export default ProductIndex;