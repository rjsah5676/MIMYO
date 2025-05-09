import axios from "axios";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setModal } from "../../store/modalSlice";
import { FaStar  } from 'react-icons/fa';


const ProductReview = forwardRef(({ getAverageStar, averageStar, reviewWrite, setReviewWrite }, ref) => {
    const modal = useSelector((state)=>state.modal);
    const [isPurchased, setIsPurchased] = useState(false); // 선택한 상품에 대해 구매했는지에 대한 여부 저장 
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const loc = useLocation();
    const [rate, setRate] = useState(0);
    let [reviewContent, setReviewContent] = useState('');
    const dispatch = useDispatch(); 
    const [isReview, setIsReview] = useState(false); // 리뷰를 이미 작성한 사람인지 여부 저장

    // 선택한 상품에 대해 구매자인지 확인 
    useEffect(() => {
        if(user)
            axios.get(`${serverIP.ip}/review/checkPurchase?userId=${user.user.id}&productId=${loc.state.product.id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            .then(function(response) {  
                if (response.data.purchased === true) {
                    setIsPurchased(true);
                }
            })
            .catch(function(error) {
                console.log(error);
            });
    }, []);

    // 별점 
    const handleClick = (starIndex, isLeft) => {
    const value = isLeft ? starIndex - 0.5 : starIndex;  // 왼쪽 클릭이면 0.5점 차감
        setRate(rate === value ? 0 : value);  // 이미 선택된 별을 다시 클릭하면 0으로 초기화
    };

    const handleData = (event) => {
        if (event.target.value.length > 230) {
            alert("230글자까지 가능합니다.");
            return; // 230자 이상이면 값을 업데이트하지 않음
        }
        setReviewContent(event.target.value); // 값 업데이트
    };

    /*start : 이미지 등록*/
    const [reviewFiles, setReviewFiles] = useState([]);
    const fileInputRef = useRef(null);

    const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 총 10MB

    const changeFile = (e) => {
        const newFiles = Array.from(e.target.files);
        
        // 이미지 파일만 필터링
        const validNewFiles = newFiles.filter(file => file.type.startsWith('image/'));

        // 기존 파일 + 새 파일 합치기
        const allFiles = [...reviewFiles, ...validNewFiles];

        // 총 크기 계산
        const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);

        if (totalSize > MAX_TOTAL_SIZE) {
            alert("전체 파일 크기의 합이 10MB를 초과합니다. 더 작은 파일을 선택해주세요.");
            return;
        }

        if (validNewFiles.length > 0) {
            handleFiles(validNewFiles); // 새로운 파일만 추가 처리
        } else {
            alert("더 용량이 작은 파일을 선택하거나 올바른 이미지 파일을 선택하세요.");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleFiles = (selectedFiles) => {
        const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith("image/"));
        if (imageFiles.length !== selectedFiles.length) {
            alert("이미지 파일만 업로드 가능합니다.");
        }
        if (reviewFiles.length + imageFiles.length > 5) {
            alert("이미지는 최대 5개까지만 등록할 수 있습니다.");
            return;
        }
        setReviewFiles(prevFiles => [...prevFiles, ...imageFiles]);
    };

    const removeFile = (fileToRemove) => {
        setReviewFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
    };
    /*end : 이미지 등록*/


    // 선택된 상품에 대한 리뷰 리스트 불러오기
    let [reviewList, setReviewList] = useState({});

    useEffect(() => {
        getReviewList();
    }, [serverIP, loc, user]);

    const getReviewList = () => {
        axios.get(`${serverIP.ip}/review/productReviewList?productId=${loc.state.product.id}`)
        .then(response => {
            setReviewList(response.data);
            // 리뷰를 작성한 사용자가 있는지 확인
            const hasReviewed = response.data.some(review => user && review.user.id=== user.user.id);
            setIsReview(hasReviewed); // 이미 리뷰를 작성했으면 true, 아니면 false
        })
        .catch(error => {
            console.error(error);
        });
    }

    //리뷰좋아요버튼 
    const handleLike = async (reviewId, userId, review) => {
        if(!userId) return;
        try {
            let updatedLikes = review.likes;
    
            for (let i = 0; i < review.likes.length; i++) {
                if (review.likes[i].user.id === user.user.id) {
                    // 이미 좋아요를 눌렀다면 삭제 처리
                    const likedId = review.likes[i].user.id;
                    
                    updatedLikes = updatedLikes.filter(like => like.user.id !== user.user.id);
    
                    setReviewList(prevReviewList => 
                        prevReviewList.map(r => r.id === reviewId ? { ...r, likes: updatedLikes } : r)
                    );
    
                    await axios.post(`${serverIP.ip}/review/likeDelete`, null, {
                        params: { reviewId, likedId },
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
    
                    getReviewList();
                    return;
                }
            }
    
            // 좋아요를 추가 처리
            updatedLikes = [...review.likes, { user: { id: user.user.id, username: user.user.username } }];
            
            
            // UI 먼저 업데이트 (좋아요 추가)
            setReviewList(prevReviewList => 
                prevReviewList.map(r => r.id === reviewId ? { ...r, likes: updatedLikes } : r)
            );
            await axios.post(`${serverIP.ip}/review/like`, null, {
                params: { reviewId, userId:userId.user.id },
                headers: { Authorization: `Bearer ${user.token}` }
            });
    
            getReviewList();
        } catch (error) {
            console.error("좋아요 처리 중 오류 발생:", error);
        }
    };

    // 리뷰 이미지
    const [imageIndexes, setImageIndexes] = useState([]);

    useEffect(() => {
        setImageIndexes((prev) => {
            const updated = [...prev];
            for (let i = 0; i < reviewList.length; i++) {
                if (updated[i] === undefined) {
                    updated[i] = 0;
                }
            }
            return updated;
        });
    }, [reviewList]);

    const handlePrev = (reviewIndex, imagesLength) => {
        setImageIndexes((prev) => {
        const updated = [...prev];
        updated[reviewIndex] = updated[reviewIndex] === 0 ? imagesLength - 1 : updated[reviewIndex] - 1;
        return updated;
        });
    };

    const handleNext = (reviewIndex, imagesLength) => {
        setImageIndexes((prev) => {
        const updated = [...prev];
        updated[reviewIndex] = updated[reviewIndex] === imagesLength - 1 ? 0 : updated[reviewIndex] + 1;
        return updated;
        });
    };

    const [enlargedImage, setEnlargedImage] = useState(null);

    //리뷰 수정 
    const [isMod, setIsMod] = useState(false); // 수정 모드인지 여부
    const [modReview, setModReview] = useState(null); // 수정할 리뷰 데이터

    const urlToFile = async (url, filename, mimeType) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: mimeType });
    };

    const reviewFormRef = useRef(null); // 리뷰 등록폼으로 포커스
    useEffect(() => { 
        if (isMod && reviewFormRef.current) {
          reviewFormRef.current.scrollIntoView({ behavior: 'smooth' });
          reviewFormRef.current.focus();
        }
      }, [isMod]);

    const handleModClick = (review) => {
    
        Promise.all(
            review.images.map(file =>
                urlToFile(
                    `${serverIP.ip}/uploads/review/${review.id}/${file.filename}`,
                    file.filename,
                    "image/jpeg"
                )
            )
        )
        .then(fileList => {
            setReviewFiles(fileList);
            setIsMod(true);
            setModReview(review);
            setRate(review.rate || 0);
            setReviewContent(review.reviewContent || '');
        })
        .catch(err => console.log(err));
    };
    
    // 리뷰 등록 및 수정 
    function handleSubmit(event) {
        event.preventDefault();

        if (rate === 0) {
            alert("별점을 선택해주세요!");
            return;
        }

        if (reviewContent === '') {
            alert('리뷰 내용을 입력해주세요.');
            return false;
        }

        //첨부파일이 있어 Form객체를 만들어 서버에 전송해야한다.
        let formData = new FormData();
        formData.append("productId", loc.state.product.id); // 어떤 상품인지
        formData.append("reviewContent", reviewContent); // 리뷰내용
        formData.append("rate", rate); // 평점
        // 파일이 있을 때만 formData에 추가
        if (reviewFiles.length > 0) {
            for (let idx = 0; idx < reviewFiles.length; idx++) {
                formData.append("files", reviewFiles[idx]);
            }
        }

        const url = isMod 
        ? `${serverIP.ip}/review/modify/${modReview.id}`  // 수정용 API
        : `${serverIP.ip}/review/write`;                  // 등록용 API

        axios({ method: 'post', url: url, data: formData,
            headers: {
                Authorization: `Bearer ${user.token}`,
            }
        })
        .then(function (response) {

            if (response.data === "reviewAddOk" || response.data === "reviewModOk") {
                // 새로고침해도 리뷰 탭 유지
                localStorage.setItem('changeMenu', 'review');

                // 수정 또는 등록 후 초기화
                setReviewContent('');
                setRate(0);
                setReviewFiles([]);
                setIsMod(false);
                setModReview(null);

                alert("리뷰 작성이 완료되었습니다.");

                setReviewWrite(false);

                getReviewList();
                getAverageStar();
            }
        })
        .catch(function (error) { console.log(error); })
    }

    // 리뷰 삭제
    useEffect(()=>{
        if(modal.delCheck==='review') {
            axios.get(`${serverIP.ip}/review/delReview?userId=${user.user.id}&reviewId=${modal.selected.split('-')[2]}`,{
                headers: { Authorization: `Bearer ${user.token}` } 
            })
            .then(res=>{
                getReviewList();
                getAverageStar();
                dispatch(setModal({delCheck:''}));
            })
            .catch(err => console.log(err));
        }
    },[modal.delCheck])

    // 별점 UI 렌더링 함수
    const renderStars = (average) => {
        return (
            <div style={{ display: 'flex', gap: '1px'}}>
                {[1, 2, 3, 4, 5].map((star) => {
                    let fillPercent = 0;
    
                    const diff = average - (star - 1);
                    if (diff >= 1) {
                        fillPercent = 100;
                    } else if (diff > 0) {
                        fillPercent = diff * 100;
                    } else {
                        fillPercent = 0;
                    }
    
                    return (
                        <span key={star} style={{ position: 'relative', width: '32px', height: '32px', fontSize: '32px'}}>
                            <FaStar style={{ color: '#C0C0C0', position: 'absolute', top: 0, left: 0, fontSize:'32px' }}/>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    overflow: 'hidden',
                                    width: `${fillPercent}%`,
                                    height: '100%',
                                }}
                            >
                                <FaStar style={{verticalAlign:'top', color: '#FFD700', fontSize: '32px' }} />
                            </div>
                        </span>
                    );
                })}
            </div>
        );
    };

    // 전체 이미지 리스트 모으기
    const [showAllImages, setShowAllImages] = useState(false);
    const [modalImage, setModalImage] = useState(null); // 이미지 클릭 시 모달처럼 확대된 이미지 설정

    // reviewList가 배열인지 확인 후, 그렇지 않으면 빈 배열로 처리
    const allImages = Array.isArray(reviewList) ? 
        reviewList
            .map(review => review.images?.map(image => ({
                src: `${serverIP.ip}/uploads/review/${review.id}/${image.filename}`,
                reviewId: review.id,
                filename: image.filename,
            })))
            .flat() // 모든 이미지를 하나의 배열로 평탄화
        : []; // reviewList가 배열이 아닐 경우 빈 배열

    const previewImages = allImages.slice(0, 5);

    const closeModal = () => {
        setModalImageIndex(null); // 모달 인덱스 초기화
        setModalImage(null); // 모달 이미지 상태 초기화
    };

    // 더보기+를 누르면 원래있던 이미지 전체리스트에 스크롤이 생겨서 막는 로직 
    useEffect(() => {
        if (showAllImages) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      
        // 언마운트 시에도 복구
        return () => {
          document.body.style.overflow = '';
        };
      }, [showAllImages]);


    // 마이페이지에서 나의 리뷰를 찾게할때
    useEffect(() => {
        const id = localStorage.getItem("currentReviewId");

        if (id) {
            const changeMenu = localStorage.getItem("changeMenu");
            if (changeMenu !== "review") {
                localStorage.setItem("changeMenu", "review");
            }

            setTimeout(() => {
                const targetElement = document.getElementById(`myReviewSearch-${id}`);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
            
                    targetElement.style.boxSizing = "border-box";

                    targetElement.style.boxShadow = "0 0 10px 2px rgba(140, 199, 165, 0.7)";
                    targetElement.style.borderRadius = "12px";
                    
                    // 3초 후 강조 제거
                    setTimeout(() => {
                        targetElement.style.boxShadow = "none";
                        targetElement.style.borderRadius = "0";

                    }, 3000);
                }
            }, 100);

            localStorage.removeItem("currentReviewId");
        }
    }, []);

    const [modalImageIndex, setModalImageIndex] = useState(null);

    const updateModalImage = (index) => {
        const img = allImages[index];
        const review = reviewList.find((r) => r.id === img.reviewId); // 리뷰를 찾는 로직
        setModalImageIndex(index); // 선택된 인덱스 저장
        setModalImage({
            src: img.src,
            reviewId: img.reviewId,
            reviewContent: review ? review.reviewContent : '',  // 리뷰 내용
            reviewDate: review ? new Date(review.reviewWritedate).toLocaleDateString() : '', // 작성일
            username: review ? review.user.username : '', // 사용자명
            rate: review ? review.rate : '', // 별점
        });
    };

    const handlePrevImage = () => {
        setModalImageIndex((prevIndex) => {
            const newIndex = prevIndex === 0 ? allImages.length - 1 : prevIndex - 1;
            return newIndex;
        });
    };
    
    const handleNextImage = () => {
        setModalImageIndex((prevIndex) => {
            const newIndex = prevIndex === allImages.length - 1 ? 0 : prevIndex + 1;
            return newIndex;
        });
    };

    useEffect(() => {
        if (modalImageIndex !== null) {
            updateModalImage(modalImageIndex);
        }
    }, [modalImageIndex]);
    
    return(
        <>
            {/* 리뷰 전체 이미지 */}
                <div className="review-gallery-wrapper" ref={ref}>
                    <h3 className="review-gallery-title">📸  리뷰사진 모아보기</h3>

                    <div className="review-preview-container">
                        {/* 5개 이하의 이미지만 먼저 보여주기 */}
                        {(showAllImages ? allImages : previewImages).map((img, idx) => (
                            <img
                                key={idx}
                                className="review-preview-img"
                                src={img.src}
                                alt={`review-${img.reviewId}-${img.filename}`}
                                onClick={() => updateModalImage(idx)}  // 클릭된 인덱스를 전달
                            />
                        ))}

                        {/* +더보기 버튼 (이미지 5개 이상일 경우만 보이도록) */}
                        {allImages.length > 5 && !showAllImages && (
                            <div className="review-preview-more" onClick={() => setShowAllImages(true)}>
                                + 더보기
                            </div>
                        )}
                    </div>

                    {/* 전체 이미지 모달 */}
                    {showAllImages && (
                        <div className="review-modal-overlay" onClick={() => {
                            setShowAllImages(false); // 전체 이미지 모달 닫기
                            closeModal(); // 확대 이미지 모달 초기화
                        }}>
                            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                                <div className="review-modal-images">
                                    {allImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            className="review-modal-img"
                                            src={img.src}
                                            alt={`review-${img.reviewId}-${img.filename}`}
                                            onClick={() => updateModalImage(idx)}
                                        />
                                    ))}
                                </div>
                                <button className="overlay-close" onClick={() => {
                                    setShowAllImages(false); // 전체 이미지 모달 닫기
                                    closeModal(); // 확대 이미지 모달 초기화
                                }}>X</button>
                            </div>
                        </div>
                    )}

                    {/* 확대 이미지 모달 */}
{modalImage && (
    <div className="review-modal-overlay" onClick={closeModal}>
        {/* 좌측 화살표 버튼 */}
        <button 
            className="overlay-arrow left" 
            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} 
            disabled={allImages.length <= 1} // 이미지가 1개 이하일 경우 비활성화
        >
            &lt;
        </button>

        <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
            <img className="review-enlarged-img" src={modalImage.src} alt="enlarged" />
            <div className="review-details">
                <p><strong>작성자:</strong> {modalImage.username}</p>
                <p><strong>작성일:</strong> {modalImage.reviewDate}</p>
                <p><strong>별점:</strong> {modalImage.rate} / 5</p>
                <p><strong>리뷰 내용:</strong> {modalImage.reviewContent}</p>
            </div>
            <button className="overlay-close" onClick={closeModal}>X</button>
        </div>

        {/* 우측 화살표 버튼 */}
        <button 
            className="overlay-arrow right" 
            onClick={(e) => { e.stopPropagation(); handleNextImage(); }} 
            disabled={allImages.length <= 1} // 이미지가 1개 이하일 경우 비활성화
        >
            &gt;
        </button>
    </div>
)}
                </div>

            <hr style={{ border: '0', height: '5px', backgroundColor: 'rgb(241, 241, 241)' }} />

            {isPurchased && !isReview && (
                <div style={{ textAlign: 'right' }}>
                    <a onClick={() => setReviewWrite(!reviewWrite)} className="reviewWriteBtn">리뷰작성</a>    
                </div>
            )}

            {(reviewWrite || isMod) &&
                <div className="review-container-style" id="reviewForm" ref={reviewFormRef} tabIndex={-1}>
                    <div style={{textAlign:'right'}}>
                        <span onClick={() => { setIsMod(false); setReviewWrite(false); setReviewContent(''); setReviewFiles([]); setRate(0); }}
                            style={{ cursor: "pointer", fontWeight: "bold", fontSize: "20px", color: "#888", marginRight: "10px" }} >
                            ✕
                        </span>
                    </div>
                    <div style={{ margin: "10px 0", lineHeight: "1.8", fontWeight: "700" }}>
                        {user.user.username}님, <br />
                        구매하신 상품은 어떠셨나요?
                    </div>
                    <form onSubmit={handleSubmit} className="reviewForm">
                        {/* 별점 */}
                        <div className="star-rating-wrapper">
                            <span className="star-label">별점&nbsp;&nbsp;</span>
                            {[1, 2, 3, 4, 5].map((star) => {

                                let backstarStyle = null;

                                if (rate >= star) {
                                    backstarStyle = { background: '#FFD700', width: '100%' };
                                } else if (rate >= star - 0.5) {
                                    backstarStyle = { background: '#FFD700', width: '50%' };
                                } else {
                                    backstarStyle = { background: '#C0C0C0', width: '100%' };
                                }

                                return (
                                    <span className="star" key={star} style={{ position: 'relative', width: '30px', height: '30px', fontSize:'30px', cursor:'pointer'  }}>
                                        {/* 왼쪽 클릭 (0.5점) */}
                                        <span className="click-half left" onClick={() => handleClick(star - 0.5)} />
                                        {/* 오른쪽 클릭 (1점) */}
                                        <span className="click-half right" onClick={() => handleClick(star)} />
                                        {/* 배경 별 */}
                                        <FaStar style={{ color: '#C0C0C0', position: 'absolute', top: 0, left: 0, fontSize:'30px' }} />
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            overflow: 'hidden',
                                            width: backstarStyle.width,
                                            height: '100%',
                                            verticalAlign: 'top',
                                        }}>
                                            <FaStar style={{verticalAlign: 'top', color: backstarStyle.background }} />
                                        </div>
                                    </span>
                                );
                            })}
                        </div>

                        {/*내용*/}
                        <div><span style={{ fontSize: '12px', fontWeight: '700' }}>내용</span></div>
                        <div style={{ textAlign: 'center' }}>
                            <textarea className="review-content-style" id="reviewContent" name="reviewContent" value={reviewContent} onChange={handleData} placeholder="리뷰 내용을 작성해주세요." maxLength={230} />
                            <div style={{ textAlign: 'right', margin: '5px 30px 5px 0' }}>
                            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                                {(reviewContent || '').length} / 230
                            </p>
                            </div>
                        </div>

                        {/*파일*/}
                        <div><span style={{ fontSize: '12px', fontWeight: '700' }}>파일첨부</span></div>
                        <div style={{ textAlign: 'center' }}>
                            <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} style={{ margin: '0 30px', height: '100px', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', cursor: 'pointer' }} 
                                 onClick={() => fileInputRef.current.click()}>
                                 이미지를 드래그/선택하여 1~5개 첨부해주세요
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', margin:'0 30px' }}>
                                <input type="file" style={{ display: 'none' }} ref={fileInputRef} multiple accept="image/*" onChange={changeFile} />
                                <input type="button" style={{backgroundColor: 'rgb(85, 85, 85)', color: 'white', padding: '8px', border: 'none', cursor: 'pointer', borderRadius: '5px', fontSize: '12px' }} onClick={() => fileInputRef.current.click()} value="이미지 선택" />
                            </div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '15px', justifyContent: 'center' }}>
                                {reviewFiles.map((file, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            style={{width: '80%', height: '80%', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'}}
                                        />
                                        <span style={{ position: 'absolute', top: '-6px', right: '3px', backgroundColor: '#555', color: 'white', width: '20px', height: '20px', 
                                              display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '14px', cursor: 'pointer' }} onClick={() => removeFile(file)}>
                                            ✕
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/*리뷰 수정, 등록 버튼*/}
                        <div>
                            <input type="submit" value={isMod ? "수정" : "등록"} className="reviewBtn-style"/>
                        </div>
                    </form>
                </div>
            }

            {/* 현재 상품에 대한 리뷰 전체 리스트 */}
            <div className="review-container">
                <div className="review-grid">
                    {reviewList.length > 0 ? (
                        reviewList.map((review, index) => (
                            <div key={index} className="review-card" id={`myReviewSearch-${review.id}`} style={{padding:'0 20px'}}>
                                <div className="review-header">
                                    {review.user.profileImageUrl && 
                                        <img src={review.user.profileImageUrl.indexOf('http') !== -1 ? `${review.user.profileImageUrl}` : `${serverIP.ip}${review.user.profileImageUrl}`} 
                                            alt="profile" 
                                            className="profile-img"
                                        />
                                    }
                                    <div>
                                        <p className="message-who" id={`mgx-${review.user.id}`} style={{cursor:'pointer'}}>{review.user.username}</p>
                                        <p className="review-date">{new Date(review.reviewWritedate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div style={{padding:'0 45px'}}>
                                    {/* 리뷰 별점 */}
                                    <div className="star-rating-wrapper">
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
                                                <span className="star" key={star} style={{ position: 'relative', width: '20px', height: '20px', fontSize:'20px' }}>
                                                    <FaStar style={{ color: '#C0C0C0', position: 'absolute', top: 0, left: 0, fontSize:'20px' }} />
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        overflow: 'hidden',
                                                        width: backstarStyle.width,
                                                        height: '100%',
                                                    }}>
                                                        <FaStar style={{ verticalAlign: 'top',color: backstarStyle.background, fontSize: '20px' }} />
                                                    </div>
                                                </span>
                                            );
                                        })}
                                    </div>
                                    {/* 리뷰 내용 */}
                                    <p className="review-content">{review.reviewContent}</p>
                                    {/* 리뷰 이미지 */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="review-images-wrapper">
                                            <div className="review-slider-container">
                                                {review.images.length > 1 && (
                                                    <button className="slider-arrow left" onClick={() => handlePrev(index, review.images.length)}>
                                                        ‹
                                                    </button>
                                                )}
                                                <div className="review-slider-image-wrapper">
                                                {review.images[imageIndexes[index]] && (
                                                    <img
                                                        src={`${serverIP.ip}/uploads/review/${review.id}/${review.images[imageIndexes[index]].filename}`}
                                                        alt={`review-img-${imageIndexes[index]}`}
                                                        className="review-custom-slider-image"
                                                        title="이미지 클릭시 확대하여 확인 가능"
                                                        onClick={() => setEnlargedImage({ reviewIndex: index, imageIndex: imageIndexes[index] })}
                                                    />
                                                )}
                                                </div>
                                                {review.images.length > 1 && (
                                                    <button className="slider-arrow right" onClick={() => handleNext(index, review.images.length)}>
                                                        ›
                                                    </button>
                                                )}
                                                {/* 슬라이더 점 표시 */}
                                                {review.images.length > 1 && (
                                                    <div className="slider-dots">
                                                        {review.images.map((_, dotIndex) => (
                                                        <span
                                                            key={dotIndex}
                                                            className={`dot ${dotIndex === imageIndexes[index] ? 'active' : ''}`}
                                                        ></span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 확대 이미지 오버레이 */}
                                            {enlargedImage?.reviewIndex === index && (
                                                <div className="image-overlay" onClick={() => setEnlargedImage(null)}>
                                                    {/* 왼쪽 화살표 */}
                                                    {review.images.length > 1 && (
                                                        <button
                                                            className="overlay-arrow left"
                                                            onClick={(e) => {
                                                                handlePrev(index, review.images.length);
                                                                e.stopPropagation();
                                                                setEnlargedImage((prev) => {
                                                                    const total = review.images.length;
                                                                    const newIndex = prev.imageIndex === 0 ? total - 1 : prev.imageIndex - 1;
                                                                    return { ...prev, imageIndex: newIndex };
                                                                });
                                                            }}
                                                        >
                                                            ‹
                                                        </button>
                                                    )}
                                                    
                                                    <div style={{position:'relative'}}>
                                                        {/* 확대된 이미지 */}
                                                        <img
                                                            src={`${serverIP.ip}/uploads/review/${review.id}/${review.images[enlargedImage.imageIndex].filename}`}
                                                            alt="enlarged"
                                                            className="popup-image"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />

                                                        {/* 닫기 X 버튼 */}
                                                        <button
                                                            className="overlay-close"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // 클릭 시 이벤트 전파 방지
                                                                setEnlargedImage(null); // 이미지 닫기
                                                            }}
                                                        >
                                                        X
                                                        </button>
                                                    </div>

                                                    {/* 오른쪽 화살표 */}
                                                    {review.images.length > 1 && (
                                                        <button className="overlay-arrow right"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleNext(index, review.images.length);
                                                                setEnlargedImage((prev) => {
                                                                    const total = review.images.length;
                                                                    const newIndex = prev.imageIndex === total - 1 ? 0 : prev.imageIndex + 1;
                                                                    return { ...prev, imageIndex: newIndex };
                                                                });
                                                            }}
                                                        >
                                                            ›
                                                        </button>
                                                    )}
                                                    {/* 슬라이더 점 표시 */}
                                                    {review.images.length > 1 && (
                                                        <div className="slider-dots">
                                                            {review.images.map((_, dotIndex) => (
                                                                <span key={dotIndex} className={`dot ${dotIndex === imageIndexes[index] ? 'active' : ''}`}></span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {user && user.user.id === review.user.id && (
                                        <div className="review-action-buttons">
                                            <button className="edit-button" onClick={() => handleModClick(review)}>수정</button>
                                            <button id={`review-delll-${review.id}`} className="del-button">삭제</button>
                                        </div>
                                    )}
                                    <button className="like-button" onClick={(e) => {e.stopPropagation(); handleLike(review.id, user, review);}}>
                                        {review.likes?.some(like => like.user.id === user.user.id) ? '❤️' : '🤍'} {review.likes?.length || 0}
                                    </button>
                                </div>
                                {index < reviewList.length - 1 && <hr style={{border:'none', borderTop:'1px solid #ddd', margin:'24px 0'}}/>}
                            </div>
                        ))
                    ) : (
                        <p>⭐ 작성된 리뷰가 없습니다.</p>
                    )}
                </div>
            </div>
        </>
    );
});

export default ProductReview;