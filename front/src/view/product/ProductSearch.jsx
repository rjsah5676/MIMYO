import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { setSearch } from "../../store/searchSlice";
import { setModal } from "../../store/modalSlice";
import { FaStar } from "react-icons/fa";
import useDebounce from "../../effect/useDebounce";

function ProductSearch() {
    const search = useSelector((state) => state.search);
    const [products, setProducts] = useState([]);
    const [nowPage, setNowPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const modal = useSelector((state) => state.modal);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const debouncedSearchWord = useDebounce(search.searchWord, 500);

    const [sort, setSort] = useState('최신순');

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

    const { ref, inView } = useInView({
        threshold: 0.5, // 50% 보이면
    });

    useEffect(() => {
        setProducts([]);
        setNowPage(1);
        getProductList(1);
    }, [debouncedSearchWord, search.eventCategory, search.targetCategory, search.productCategory, sort]);

    useEffect(() => {
        if (nowPage > 1) {
            getProductList(nowPage);
        }
    }, [nowPage]);

    useEffect(() => {
        if (inView && nowPage < totalPage) {
            setNowPage((prevPage) => prevPage + 1);
        }
    }, [inView, totalPage]);

    const moveInfo = (prod) => {
        navigate('/product/info', { state: { product: prod } });
    }

    const changeSearchWord = (e) => {
        dispatch(setSearch({ ...search, searchWord: e.target.value }));
    }

    const getProductList = (page) => {
        axios
            .get(
                `${serverIP.ip}/product/search?searchWord=${search.searchWord}&eventCategory=${search.eventCategory}&targetCategory=${search.targetCategory}&productCategory=${search.productCategory}&nowPage=${page}&sort=${sort}`,{
                    headers:{Authorization:`Bearer ${ user && user.token}`}
                }
            )
            .then((res) => {
                const { pvo, productList } = res.data;
                setTotalPage(pvo.totalPage);

                Promise.all(
                    productList.map(product =>
                      axios.get(`${serverIP.ip}/review/averageStar?productId=${product.id}`)
                        .then(res => ({
                          ...product,
                          average: res.data.average,
                          reviewCount: res.data.reviewCount,
                          reviewContent: res.data.reviewContent
                        }))
                        .catch(err => {
                          console.error(err);
                          return { ...product, average: 0, reviewCount: 0 };
                        })
                    )
                  ).then(updatedList => {
                    setProducts(prev => {
                        if (page === 1) return updatedList;
                        return [...prev, ...updatedList]; 
                      });
                });
            })
            .catch((err) => {
                console.log(err)
            });
    };

    return (
        <div className="product-grid-container">
            <h2 style={{ fontSize: '28px' }}>{search.searchWord && `'${search.searchWord}'`} 상품 검색 결과</h2>
            <div style={{ maxWidth: '1200px', margin: 'auto' }}>
                <div className="search-options-container">
                    <select
                        value={search.eventCategory}
                        onChange={(e) => dispatch(setSearch({ ...search, eventCategory: e.target.value }))}
                        className="search-selectbox-style"
                    >
                        <option value="">이벤트 선택</option>
                        {eventOptions.map((event, index) => (
                            <option key={index} value={event}>{event}</option>
                        ))}
                    </select>

                    <select
                        value={search.targetCategory}
                        onChange={(e) => dispatch(setSearch({ ...search, targetCategory: e.target.value }))}
                        className="search-selectbox-style"
                    >
                        <option value="">대상 선택</option>
                        {targetOptions.map((target, index) => (
                            <option key={index} value={target}>{target}</option>
                        ))}
                    </select>
                        
                    <button
                        onClick={() => dispatch(setModal({
                            ...modal,
                            isOpen: true,
                            selected: "categorymodal",
                            info: productOptions,
                        }))}
                        className="search-selectbox-style"
                        style={{
                            fontSize: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'inline-block'
                        }}
                    >
                        {search.productCategory.length === 0
                            ? '카테고리 선택'
                            : search.productCategory.map((item, index) => (
                                <span key={index}> #{item}</span>
                            ))
                        }
                    </button>

                    <div className="search-container">
                        <svg className="search-icon-two" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="7" stroke="#555" strokeWidth="2" />
                            <line x1="15" y1="15" x2="22" y2="22" stroke="#555" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            className="search-info-style"
                            type="text"
                            value={search.searchWord}
                            placeholder="검색어 입력"
                            onChange={changeSearchWord}
                        />
                    </div>
                </div>
                <div className="in-hashtag-box" style={{marginBottom:'20px'}}>
                    {search.eventCategory && <span id='search-hashtag'>#{search.eventCategory}</span>}
                    {search.targetCategory && <span id='search-hashtag'>#{search.targetCategory}</span>}
                    {search.productCategory && search.productCategory.map((item, index) => (
                        <span key={index} id='search-hashtag'>#{item}</span>
                    ))}
                </div>
                <ul className='search-sort'>
                    {["최신순", "찜 많은순", "후기 많은 순", "주문 많은 순", "할인율 높은 순", "높은 가격 순", "낮은 가격 순"].map((item, index) => (
                        <li key={index}>
                            <span
                                onClick={() => setSort(item)}
                                style={{ fontWeight: sort === item ? 'bold' : 'normal' }}
                            >
                                {item}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="product-grid" style={{textAlign:'left'}}>
                {products.map((product, index) => (
                    <div
                        key={`${product.id}-${index}`}
                        className="product-card"
                        ref={index === products.length - 1 ? ref : null}
                        style={{minWidth:0, position: 'relative'}}
                    >
                        <img style={{ cursor: 'pointer' }} onClick={() => moveInfo(product)}
                            src={`${serverIP.ip}/uploads/product/${product.id}/${product.images[0]?.filename}`}
                            alt={product.productName}
                            className={`user-product-img ${product.state === 'SOLDOUT' ? 'soldout' : ''}`}
                        />
                        {product.state === "SOLDOUT" && (
                            <div className="soldout-badge">품절</div>
                        )}
                        <div style={{ cursor: 'pointer' }} onClick={() => moveInfo(product)} className="product-info">
                            <span style={{ fontSize: "14px", color: "#333" }}>{product.productName}</span> {/* 상품명 */} <br />

                            {product.discountRate === '' || product.discountRate === 0 ? (
                                <span style={{ fontWeight: "700" }}>{product.price.toLocaleString()}원</span> // 할인율이 0%일 때는 기존 가격만 표시
                                ) : (
                                <>
                                    <span style={{ color: 'red', fontWeight: "700", marginRight: "3px" }}>{product.discountRate}%</span>
                                    <span style={{ textDecoration: "line-through", textDecorationColor: "red", textDecorationThickness: "2px", fontWeight: "700", marginRight: '3px' }}>
                                        {product.price.toLocaleString()}원
                                    </span>
                                    <span style={{ color: 'red', fontWeight: "700" }}>
                                        {Math.round(product.price * (1 - product.discountRate / 100)).toLocaleString()}원
                                    </span> 
                                </>
                            )}

                            <br />
                            <div style={{
                                marginTop: "5px", padding: "4px 8px", display: "inline-block",
                                borderRadius: "5px", fontSize: "12px", fontWeight: "600",
                                backgroundColor: product.shippingFee === 0 ? "#ff4d4d" : "#f2f2f2",
                                color: product.shippingFee === 0 ? "white" : "black",
                                minHeight: "10px",
                                lineHeight: "10px",
                            }}>
                                {product.shippingFee === 0 ? "🚚 무료배송" : `배송비 ${product.shippingFee.toLocaleString()}원`} {/* 배송비 */}
                            </div>

                            {/* 별과 평균 별점, 리뷰 개수 */}
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '3px' }}>
                                <FaStar style={{ color: '#FFD700', fontSize: '15px' }} />
                                <div style={{ marginLeft: '8px', fontSize: '12px', color: '#555' }}>
                                    <b>{product.average ? product.average.toFixed(1) : '0.0'}</b>
                                    <span style={{ marginLeft: '4px', color: '#999' }}>
                                        ({product.reviewCount})
                                    </span>
                                </div>
                            </div>
                            <div
                            style={{
                                width: '100%',
                                maxWidth: '100%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '13px',
                                color: '#666',
                                marginTop: '5px',
                                lineHeight: '1.4',
                            }}
                            >
                            <span style={{ fontWeight: '600', marginRight: '5px', color: '#333' }}>후기</span>
                            {product.reviewContent !== '' && product.reviewContent}
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductSearch;
