import { useDispatch, useSelector } from 'react-redux';
import './../../css/view/recommend.css';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import RecommendSpinner from '../../effect/RecommendSpinner';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { setLoginView } from '../../store/loginSlice';

function RecommendIndex() {
    const user = useSelector((state) => state.auth.user);
    const serverIP = useSelector((state) => state.serverIP);
    const dispatch = useDispatch();
    useEffect(()=>{
        if(!user) {
            dispatch(setLoginView(true));
            navigate("/");
        }
    },[])

    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState('');

    const [recommendList, setRecommendList] = useState([]);
    const [check, setCheck] = useState(false);

    const alreadyProducts = useRef([]);
    const navigate = useNavigate();

    useEffect(() => {
        getRecommendList();
    }, [priceRange]);

    const handlePriceRangeChange = (range) => {
        setPriceRange(range);
        alreadyProducts.current = [];
    };

    const getRecommendList = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const recommendProducts = [];
            setCheck(false);

            const basePayload = { productIds: alreadyProducts.current, priceRange };

            const wishRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=WISH`,
                basePayload,
                { headers: { Authorization: `Bearer ${user.token}` } });
            const wishId = wishRes.data.id;
            if (!alreadyProducts.current.includes(wishId)) {
                alreadyProducts.current.push(wishId);
            }
            recommendProducts.push(wishRes.data);
            if (wishRes.data === "" || wishRes.data === null) setCheck(true);

            const basketRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=BASKET`,
                { productIds: [...alreadyProducts.current, wishId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const basketId = basketRes.data.id;
            if (!alreadyProducts.current.includes(basketId)) {
                alreadyProducts.current.push(basketId);
            }
            recommendProducts.push(basketRes.data);

            const hitRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=HIT`,
                { productIds: [...alreadyProducts.current, wishId, basketId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const hitId = hitRes.data.id;
            if (!alreadyProducts.current.includes(hitId)) {
                alreadyProducts.current.push(hitId);
            }
            recommendProducts.push(hitRes.data);

            const searchRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=SEARCH`,
                { productIds: [...alreadyProducts.current, wishId, basketId, hitId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const searchId = searchRes.data.id;
            if (!alreadyProducts.current.includes(searchId)) {
                alreadyProducts.current.push(searchId);
            }
            recommendProducts.push(searchRes.data);

            const reviewRes = await axios.post(`${serverIP.ip}/recommend/getRecommend?type=REVIEW`,
                { productIds: [...alreadyProducts.current, wishId, basketId, hitId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const reviewId = reviewRes.data.id;
            if (!alreadyProducts.current.includes(reviewId)) {
                alreadyProducts.current.push(reviewId);
            }
            recommendProducts.push(reviewRes.data);

            const defaultRes = await axios.post(`${serverIP.ip}/recommend/getDefaultRecommend`,
                { productIds: [...alreadyProducts.current, wishId, basketId, hitId, searchId], priceRange },
                { headers: { Authorization: `Bearer ${user.token}` } });
            const defaultId = defaultRes.data.id;
            if (!alreadyProducts.current.includes(defaultId)) {
                alreadyProducts.current.push(defaultId);
            }
            recommendProducts.push(defaultRes.data);

            setRecommendList(recommendProducts);
            getRating(recommendProducts);
            
            setLoading(false);
        } catch (err) {
            console.log(err);
            setLoading(false);
        }
    };

    const moveInfo = (prod) => {
        navigate('/product/info', { state: { product: prod } });
    }

    const getRating = (list) => {
        Promise.all(
          list.map(product =>
            product &&
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
            }))
        ).then(updatedList => {
          setRecommendList(updatedList);
        });
      };

    return (
        <div className='recommend-container'>
            <h2 id="recommend-title">
                💖{user && user.user.username}님을 위한 추천상품입니다.💝
            </h2>
            <ul className="recommend-sort">
                <li className={priceRange === '' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('')}>전체</li>
                <li className={priceRange === 'under10000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('under10000')}>1만원 미만</li>
                <li className={priceRange === '10000to20000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('10000to20000')}>1만원대</li>
                <li className={priceRange === '20000to30000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('20000to30000')}>2만원대</li>
                <li className={priceRange === '30000to50000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('30000to50000')}>3만원대</li>
                <li className={priceRange === '50000to60000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('50000to60000')}>5만원대</li>
                <li className={priceRange === 'over60000' ? 'active' : ''} onClick={loading ? null :() => handlePriceRangeChange('over60000')}>6만원 이상</li>
            </ul>
            <button id="refresh-btn" onClick={getRecommendList} disabled={loading || check}>
                ⟳
            </button>

            {!check && <div style={{marginTop: '20px', fontSize: '12px', color: 'rgb(140, 199, 165)'}}>* MIMYO만의 알고리즘으로 회원님께 딱 맞는 상품을 추천해드려요.</div>}
            <div className="recommend-list">
                {loading ? (
                    <RecommendSpinner />
                ) : (
                    check ? (
                        <div
                            style={{
                                textAlign: 'center',
                                position: 'absolute',
                                top: '50px',
                                left: '50%',
                                transform: 'translate(-50%,-50%)',
                                fontSize: '20px'
                            }}
                        >
                            <div>등록된 상품을 모두 보여드렸어요 😢</div>
                            <div style={{marginTop: '10px', fontSize: '11pt', cursor: 'pointer'}} onClick={()=>window.location.reload()}>다시 보기⟳</div>
                        </div>
                    ) : (
                        <> 
                            <div className="recommend-grid">
                            {
                                recommendList.map((item, index)=>{
                                    return (
                                        item !== "" &&
                                        <div key={index} className={`recommend-product box-${index}`} onClick={() => moveInfo(item)}>
                                            <img className='recommend-product-img' src={`${serverIP.ip}/uploads/product/${item.id}/${item.images[0].filename}`}/>
                                            <div className={`recommend-product-info info-${index}`} style={{}}>
                                                <span style={{ fontSize: "14px", color: "#333", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</span> {/* 상품명 */} <br />

                                                {item.discountRate === '' || item.discountRate === 0 ? (
                                                    <span style={{ fontWeight: "700" }}>{item.price.toLocaleString()}원</span> // 할인율이 0%일 때는 기존 가격만 표시
                                                    ) : (
                                                    <>
                                                        <span style={{ color: 'red', fontWeight: "700", marginRight: "3px" }}>{item.discountRate}%</span>
                                                        <span style={{ textDecoration: "line-through", textDecorationColor: "red", textDecorationThickness: "2px", fontWeight: "700", marginRight: '3px' }}>
                                                            {item.price.toLocaleString()}원
                                                        </span>
                                                        <span style={{ color: 'red', fontWeight: "700" }}>
                                                            {Math.round(item.price * (1 - item.discountRate / 100)).toLocaleString()}원
                                                        </span> 
                                                    </>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '3px' }}>
                                                    <FaStar style={{ color: '#FFD700', fontSize: '15px' }} />
                                                    <div style={{ marginLeft: '8px', fontSize: '12px', color: '#555' }}>
                                                        <b>{item.average ? item.average.toFixed(1) : '0.0'}</b>
                                                        <span style={{ marginLeft: '4px', color: '#999' }}>
                                                            ({item.reviewCount})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
}

export default RecommendIndex;