import { useEffect, useState, useRef } from 'react';
import '../../css/view/hotproduct.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PopProduct() {
    const [popList, setPopList] = useState([]);
    const serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [randomProducts, setRandomProducts] = useState([]);
    const intervalRef = useRef(null);
    const [grade, setGrade] = useState(['✊', '☝️', '✌️', '🖐️']);

    const getMedal = (rank) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            case 4:
                return <span style={{ color: '#D4A373',fontSize:'30px' }}>4위</span>;
            case 5:
                return <span style={{ color: '#A9A9A9',fontSize:'30px' }}>5위</span>;
            default:
                return `${rank}위`;
        }
    };

    const shuffleProducts = (products) => {
        if (!products || products.length === 0) {
            return [];
        }
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(3, products.length));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? popList.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % popList.length);
    };

    useEffect(() => {
        axios.get(`${serverIP.ip}/interact/getPopUser`)
            .then((res) => {
                setPopList(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        if (popList.length > 0 && currentIndex >= 0 && currentIndex < popList.length) {
            setRandomProducts(shuffleProducts(popList[currentIndex].productList));
        }
    }, [popList, currentIndex]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            if (popList.length > 0 && currentIndex >= 0 && currentIndex < popList.length) {
                setRandomProducts(shuffleProducts(popList[currentIndex].productList));
            }
        }, 5000);

        return () => clearInterval(intervalRef.current); // 컴포넌트 언마운트 시 clearInterval
    }, [popList, currentIndex]);


    const moveInfo = (who) => {
        navigate('/userinfo', { state: who });
        window.scrollTo({ top: 0 });
    }

    const moveProduct = (prod) => {
        navigate('/product/info', { state: { product: prod } })
    }

    return (
        <>
            <div className="search-page-banner">
                <h1>이 달의 MIMYO 인기 작가💕💕</h1>
                <p style={{ fontSize: '18px', color: '#666', marginTop: '10px' }}>
                    손끝에서 피어나는 감성,
                    <span style={{ fontWeight: '600', color: '#8CC7A5' }}>
                    이번 달 가장 주목받는 MIMYO 작가</span>들을 소개합니다 🌿
                </p>
            </div>
            <div className="pop-list-wrapper">
                <div className="pop-book">
                    {popList.map((item, idx) => {
                        const isActive = idx === currentIndex;
                        const rank = idx + 1;
                        const medal = getMedal(rank);

                        return (
                            <div
                                key={idx}
                                className={`pop-page ${isActive ? 'active' : ''}`}
                                style={{
                                    zIndex: isActive ? 2 : 1,
                                }}
                            >
                                <div className='pop-left'>
                                    <div className='pop-rank' style={idx===3||idx===4 ? {left:'10px',top:'10px'}:{ fontSize: '60px',left:'0px',top:'0px' }}>{medal}</div>
                                    <img
                                        src={item.user.uploadedProfileUrl
                                            ? `${serverIP.ip}${item.user.uploadedProfileUrl}`
                                            : `${item.user.profileImageUrl}`
                                        }
                                        alt=''
                                        className='pop-profile-img'
                                    />
                                    <div className="pop-go-info" onClick={()=>moveInfo(item.user.id)}>
                                        작가 정보 더보기 <span style={{ fontSize: '18px' }}>→</span>
                                    </div>
                                    <span style={{marginTop:'20px', fontSize:'22px'}}>💕{item.user.username}{grade[item.user.grade]}</span>
                                </div>
                                <div className='pop-right' style={{ position: 'relative' }}> {/* position: relative 추가 */}
                                    
                                    <div>
                                        <div className="pop-author-desc">{ item.user.infoText===null ? '작가 소개가 없습니다.':item.user.infoText}</div>
                                    </div>
                                    <div>
                                        <ul className="pop-author-stats">
                                            <li><strong>🎁 등록 작품수:</strong> {item.productList.length}</li>
                                            <li><strong>🛒 받은 주문수:</strong> {item.orderCount}</li>
                                            <li><strong>⭐ 받은 리뷰수:</strong> {item.reviewCount}</li>
                                            <li><strong>📈 평균 평점:</strong> {item.reviewAverage.toFixed(1)}</li>
                                            <li><strong>❤️ 찜 수:</strong> {item.wishCount}</li>
                                            <li><strong>👥 팔로워:</strong> {item.followerCount}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="pop-product-list-title">등록 작품</h3>
                                        <div className="pop-product-list">
                                            {randomProducts.map((product, productIdx) => (
                                                <div key={productIdx} className='pop-product-item' style={{cursor:'pointer'}}onClick={()=>moveProduct(product)}>
                                                    {product.images && product.images.length > 0 && (
                                                        <img src={`${serverIP.ip}/uploads/product/${product.id}/${product.images[0].filename}`} alt={product.productName} />
                                                    )}
                                                    <div style={{whiteSpace:'nowrap', width:'100%',overflow:'hidden',textOverflow:'ellipsis'}}>{product.productName}</div>
                                                </div>
                                            ))}
                                            {randomProducts.length === 0 && (
                                                <div>등록된 상품이 없습니다.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="pop-nav left" onClick={prevSlide}>←</button>
                <button className="pop-nav right" onClick={nextSlide}>→</button>
            </div>
        </>
    );
}

export default PopProduct;