import axios from "axios";
import { useEffect, useState } from "react";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

function CustomerReview(){
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();

    let [cusReviewList, setCusReviewList] = useState([]);

    useEffect(() => {

        getCusReviewList();
    }, [])


    const getCusReviewList = () => {
            axios.get(`${serverIP.ip}/review/cusReviewList?userNo=${loc.state === null ? user.user.id : loc.state}`, {
                headers: {
                    Authorization: user ? `Bearer ${user.token}` : {},
                }
            })
            .then(res => {
                setCusReviewList(res.data);
            })
            .catch(err => console.log(err));
    }

    // 리뷰 이미지 슬라이드 기능
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideIndices, setSlideIndices] = useState({});

    const getCurrentIndex = (reviewId) => {
        return slideIndices[reviewId] || 0;
    };

    const prevSlide = (reviewId, images) => {
        const index = getCurrentIndex(reviewId);
        const newIndex = index === 0 ? images.length - 1 : index - 1;
        setSlideIndices(prev => ({ ...prev, [reviewId]: newIndex }));
    };
    
    const nextSlide = (reviewId, images) => {
        const index = getCurrentIndex(reviewId);
        const newIndex = index === images.length - 1 ? 0 : index + 1;
        setSlideIndices(prev => ({ ...prev, [reviewId]: newIndex }));
    };
    
    const goToSlide = (reviewId, index) => {
        setSlideIndices(prev => ({ ...prev, [reviewId]: index }));
    };

    const navigate = useNavigate();

    const moveInfo = (prod) => {
        navigate('/product/info', { state: { product: prod } });
    };

    return(
        <>
            <div>
                {cusReviewList && cusReviewList.length > 0 ? (
                    <div>
                        <div className="cusReview-wrapper">
                            <ul className="cusReview-list">
                                {cusReviewList.map((review, index) => (
                                    <>
                                    {/* 리뷰 정보 */}
                                    <li key={index} className="cusReview-item">
                                        <div className="cusReview-header">
                                            {review.user.profileImageUrl && 
                                                <img src={review.user.profileImageUrl.indexOf('http') !== -1 ? `${review.user.profileImageUrl}` : `${serverIP.ip}${review.user.profileImageUrl}`} 
                                                    alt="profile" 
                                                    className="profile-img"
                                                />
                                            }
                                            <p className="message-who" id={`mgx-${review.user.id}`} style={{cursor:'pointer', fontSize:'14px'}}>{review.user.username}</p>
                                            <p className="cusReview-date" >{review.reviewWritedate}</p>

                                            {/* 리뷰 별점 */}
                                            <div className="cusReview-star-rating-wrapper">
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    let backstarStyle = null;

                                                    if (review.rate >= star) {
                                                        backstarStyle = { background: '#FFD700', width: '100%' };
                                                    } else if (review.rate >= star - 0.5) {
                                                        backstarStyle = { background: '#FFD700', width: '50%' };
                                                    } else {
                                                        backstarStyle = { background: '#C0C0C0', width: '100%' };
                                                    }

                                                    return (
                                                        <span className="cusReview-star" key={star} style={{ position: 'relative', width: '15px', height: '15px', fontSize:'15px' }}>
                                                            <FaStar style={{ color: '#C0C0C0', position: 'absolute', top: 0, left: 0, fontSize:'15px' }} />
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                overflow: 'hidden',
                                                                width: backstarStyle.width,
                                                                height: '100%',
                                                            }}>
                                                                <FaStar style={{ verticalAlign:'top',color: backstarStyle.background, fontSize: '15px' }} />
                                                            </div>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            
                                        </div>

                                        {/* 이미지 슬라이드 */}
                                        {review.images && review.images.length > 0 && (
                                            <div className="cusReview-images-wrapper">
                                                <img
                                                    src={`${serverIP.ip}/uploads/review/${review.id}/${review.images[getCurrentIndex(review.id)].filename}`}
                                                    alt={`Review Image ${getCurrentIndex(review.id)}`}
                                                    className="cusReview-image"
                                                />

                                                <button
                                                    className="cusReview-arrow cusReview-prev"
                                                    onClick={() => prevSlide(review.id, review.images)}
                                                >
                                                    &#8249;
                                                </button>

                                                <button
                                                    className="cusReview-arrow cusReview-next"
                                                    onClick={() => nextSlide(review.id, review.images)}
                                                >
                                                    &#8250;
                                                </button>

                                                <div className="cusReview-image-dots">
                                                    {review.images.map((_, imgIndex) => (
                                                        <button
                                                            key={imgIndex}
                                                            className={`cusReview-dot ${getCurrentIndex(review.id) === imgIndex ? "active" : ""}`}
                                                            onClick={() => goToSlide(review.id, imgIndex)}
                                                        ></button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        
                                        <div className="cusReview-content">
                                            <p>{review.reviewContent}</p>
                                        </div>

                                        {/* 상품 정보 출력 */}
                                        <div className="cusReview-product-info">
                                            {review.product && (
                                                <>
                                                    {review.product.images && review.product.images.length > 0 && (
                                                        <div className="cusReview-product-image">
                                                            <img
                                                                src={`${serverIP.ip}/uploads/product/${review.product.id}/${review.product.images[0].filename}`}
                                                                alt="Product Thumbnail"
                                                                className="cusReview-image-thumbnail"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="cusReview-product-details">
                                                        <div className="cusReview-product-name">
                                                            {review.product.productName}
                                                        </div>
                                                        <div className="cusReview-product-price">
                                                            {review.product.price.toLocaleString()}원
                                                        </div>
                                                    </div>

                                                    <div 
                                                        className="cusReview-product-arrow"
                                                        onClick={() => moveInfo(review.product)}
                                                    >
                                                        <FaArrowRight />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                    </>
                                ))}
                            </ul>
                        </div>

                        
                    </div>
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center' }}>작성된 구매 후기가 없습니다.</div>
                )}
            </div>
        </>
    )
}

export default CustomerReview;