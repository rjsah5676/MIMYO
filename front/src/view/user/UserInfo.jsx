import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import CustomerReview from './CustomerReview';
import { FaStar } from "react-icons/fa";

function GradeBar({ point,gg }) {
    const maxPoint = 5000;
    const percentage = Math.min((point / maxPoint) * 100, 100);
    const [grade, setGrade] = useState(['✊', '☝️', '✌️', '🖐️']);
    return (
        <div style={{ width: '100%', maxWidth: '300px' }}>
            <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                <span style={{fontWeight:'400',fontSize:'16px'}}>등급:<span style={{fontSize:'24px'}}>{grade[gg]}</span> ({point}pt)</span>
            </div>
            <div style={{
                width: '100%',
                height: '10px',
                background: '#eee',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '0',
                margin: '0'
                }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: 'linear-gradient(to right, #8CC7A5, #4a7b63)',
                    transition: 'width 0.5s ease',
                    margin:'0px'
                }} />
                </div>

        </div>
    );
}

function UserInfo() {
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    const loc = useLocation();
    const navigate = useNavigate();

    const [userNo, setUserNo] = useState(0);
    const [loginNo, setLoginNo] = useState(0);
    const [userinfo, setUserinfo] = useState({});
    const [profileMenu, setProfileMenu] = useState('guestbook');
    const [guestbookList, setGuestbookList] = useState([]);
    const [products, setProducts] = useState([]);
    const [replyList, setReplyList] = useState({});
    const [wishCount, setWishCount] = useState(0);
    const [followState, setFollowState] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [rating, setRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        if (user) {
            setUserNo(loc.state === null ? user.user.id : loc.state);
            setLoginNo(user.user.id);
        } else {
            setUserNo(loc.state);
        }
    }, []);

    useEffect(() => {
        if (userNo !== 0) {
            getGuestbookList();
            getProductList();
            getUserInfo();
            getInfo();
            if (user) {
                getFollowState();
            }
        }
    }, [userNo])

    useEffect(() => {
        guestbookList.forEach(item => {
            if (!replyList[item.id]) {
                getReplyList(item.id);
            }
        });
    }, [guestbookList]);

    const getInfo = () => {
        axios.get(`${serverIP.ip}/mypage/myInfoCount?id=${userNo}`, {
            headers: {
                Authorization: user ? `Bearer ${user.token}` : {}
            }
        })
            .then(res => {
                setFollowerCount(res.data.followerCount);
                setFollowingCount(res.data.followingCount);
                setWishCount(res.data.wishCount);
                setRating(res.data.rating);
                setReviewCount(res.data.reviewCount);
            })
            .catch(err => console.log(err));
    }

    const getUserInfo = () => {
        axios.get(`${serverIP.ip}/interact/getUserInfo?id=${userNo}`, {
            headers: {
                Authorization: user ? `Bearer ${user.token}` : {}
            }
        })
            .then(res => {
                setUserinfo(res.data);
            })
            .catch(err => console.log(err));
    }

    const getGuestbookList = () => {
        axios.get(`${serverIP.ip}/mypage/guestbookList?id=${userNo}`, {
            headers: {
                Authorization: user ? `Bearer ${user.token}` : {}
            }
        })
            .then(res => {
                setGuestbookList(res.data);
            })
            .catch(err => console.log(err));
    }

    const guestbookWrite = (id) => {
        const textareaId = id !== undefined ? `guestbook-write-${id}` : 'guestbook-write';
        const content = document.getElementById(textareaId)?.value || '';

        const data = {
            writer: user.user,
            receiver: userinfo,
            content: content,
            originalId: id
        }

        if (!data.content.trim()) {
            alert("내용을 입력해주세요.");
        } else {
            axios.post(`${serverIP.ip}/mypage/guestbookWrite`, JSON.stringify(data), {
                headers: {
                    Authorization: user ? `Bearer ${user.token}` : {},
                    "Content-Type": "application/json"
                }
            })
                .then(res => {
                    if (id) {
                        replyToggle(id);
                        getReplyList(id);
                    } else {
                        getGuestbookList();
                    }
                })
                .catch(err => console.log(err));
        }
        document.getElementById(textareaId).value = '';
    }

    const guestbookDelete = (id, parentId = null) => {
        if (window.confirm("삭제하시겠습니까?")) {
            axios.get(`${serverIP.ip}/mypage/guestbookDelete/${id}`, {
                headers: {
                    Authorization: user ? `Bearer ${user.token}` : {},
                }
            })
                .then(res => {
                    if (parentId) {
                        getReplyList(parentId);
                    } else {
                        getGuestbookList();
                    }
                })
                .catch(err => console.log(err));
        }
    }

    const getProductList = () => {
        axios
            .get(
                `${serverIP.ip}/mypage/productList/${userNo}`,{
                    Authorization: user ? `Bearer ${user.token}` : {},
                }
            )
            .then((res) => {
                const productList = res.data;

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
                        return [...prev, ...updatedList]; 
                      });
                });
            })
            .catch((err) => {
                console.log(err)
            });
    };

    const getReplyList = (id) => {
        axios.get(`${serverIP.ip}/mypage/replyList/${id}`, {
            headers: {
                Authorization: user ? `Bearer ${user.token}` : {},
            }
        })
            .then(res => {
                setReplyList(prev => ({
                    ...prev,
                    [id]: res.data
                }));
            })
            .catch(err => console.log(err));
    }

    const replyToggle = (id) => {
        let guestbookState = document.getElementById(`guestbook-${id}`);
        guestbookState.style.display === "flex" ?
            guestbookState.style.display = "none" :
            guestbookState.style.display = "flex";
    };

    const moveInfo = (prod) => {
        navigate('/product/info', { state: { product: prod } });
    }

    const getFollowState = () => {
        if (userNo !== loginNo) {
            axios.get(`${serverIP.ip}/interact/getFollowState?from=${loginNo}&to=${userNo}`, {
                headers: {
                    Authorization: user ? `Bearer ${user.token}` : {},
                }
            })
                .then(res => {
                    setFollowState(res.data);
                })
                .catch(err => console.log(err));
        }
    }
    const followUser = () => {
        if (followState && !window.confirm("언팔로우 하시겠습니까?")) return;
        axios.get(`${serverIP.ip}/interact/followUser?from=${loginNo}&to=${userNo}&state=${followState}`, {
            headers: {
                Authorization: user ? `Bearer ${user.token}` : {},
            }
        })
            .then(() => {
                getFollowState();
            })
            .catch(err => console.log(err));
    }

    const openChatting = () => {
        axios.get(`${serverIP.ip}/chat/createChatRoom?userId=${userNo}`, {
            headers: {
                Authorization: user ? `Bearer ${user.token}` : {},
            }
        })
        .then(res => {
            console.log("roomId", res.data);
            navigate(`/product/chat/${res.data}`);
        })
        .catch(err=>console.log(err));
    }

    return (
        <div className="profile-container" style={loc.state !== null ? { paddingTop: '140px' } : {}}>
            <div className="profile-top">
                {userinfo.imgUrl && <img src={userinfo.imgUrl.indexOf('http') !== -1 ? `${userinfo.imgUrl}` : `${serverIP.ip}${userinfo.imgUrl}`} alt='' width={140} height={140} style={{borderRadius: '50%', objectFit: 'cover', alignSelf: 'center'}}/>}
                <div className="profile-info">
                    <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', height: '100px'}}>
                            <div style={{alignSelf: 'center'}}>
                                <div style={{paddingLeft:'4px'}}>
                                <span>{userinfo.username}</span><span style={{fontWeight: '400', marginLeft: '10px', fontSize: '10pt'}}><span style={{fontSize: '12pt'}}>⭐</span>{Math.round(rating * 100) / 100} ({reviewCount})</span>
                                </div>
                                <GradeBar point={userinfo.gradePoint} gg={userinfo.grade}/>
                                </div>
                            {
                                user && 
                                (userNo === loginNo ?
                                <div>
                                    <button id="profile-edit-btn" onClick={()=> navigate('/mypage/edit')} style={{background: '#8CC7A5'}}>프로필 수정</button>
                                </div>
                                :
                                <div style={{textAlign: 'center'}}>
                                    <button id="userinfo-chatting" onClick={openChatting} style={{marginRight: '10px', background: '#8CC7A5'}}>채팅하기</button>
                                    <button id={followState ? "unfollow-btn" : "follow-btn"} onClick={followUser}>
                                        {followState ? '팔로잉' : '팔로우'}
                                    </button>
                                </div>)
                            }
                        </div>
                    </div>
                    <div id="profile-info-text" style={{fontSize: '11pt'}}>{userinfo.infoText}</div>
                    <div className="profile-follow">
                        <div onClick={userNo === loginNo ? () => navigate('/mypage/follow?tab=follower') : undefined}
                            style={userNo === loginNo ? { cursor: 'pointer' } : {}}
                        >팔로워<br /><span>{followerCount}</span></div>
                        <div onClick={userNo === loginNo ? () => navigate('/mypage/follow?tab=following') : undefined}
                            style={userNo === loginNo ? { cursor: 'pointer' } : {}}
                        >팔로잉<br /><span>{followingCount}</span></div>
                        <div>작품찜<br /><span>{wishCount}</span></div>
                    </div>
                </div>
            </div>
            <div className="profile-menu">
                <div onClick={() => setProfileMenu("guestbook")} className={profileMenu === "guestbook" ? "selected-menu" : {}}>방명록</div>
                <div onClick={() => setProfileMenu("product")} className={profileMenu === "product" ? "selected-menu" : {}}>판매작품</div>
                <div onClick={() => setProfileMenu("review")} className={profileMenu === "review" ? "selected-menu" : {}}>구매후기</div>
            </div>
            <div className="profile-bottom">
                {
                    profileMenu === "guestbook" &&
                    <>
                        {
                            guestbookList.length === 0 &&
                            <div style={{ padding: '20px', textAlign: 'center' }}>작성된 방명록이 없습니다.</div>
                        }
                        {
                            user && loc.state !== null && user.user.id !== loc.state &&
                            <div className="guestbook-write-box">
                                <textarea id="guestbook-write" className="guestbook-write" placeholder="방명록을 남겨 주세요."
                                    rows={5} style={{ height: '50px', lineHeight: '1.2' }} />
                                <input type="button" id="guestbook-write-btn" onClick={() => guestbookWrite()} value="등록" />
                            </div>
                        }
                        {
                            guestbookList.map(item => {
                                return (
                                    <div key={item.id} className="guestbook-item">
                                        <img id={`mgx-${item.writer.id}`} className='message-who' src={item.writer.uploadedProfileUrl ? `${serverIP.ip}${item.writer.uploadedProfileUrl}` : `${item.writer.kakaoProfileUrl.indexOf('http')===-1 ? `${serverIP.ip}${item.writer.kakaoProfileUrl}`:item.writer.kakaoProfileUrl }`} alt='' width={40} height={40} style={{ borderRadius: '100%', backgroundColor: 'white', border: '1px solid gray' }} />
                                        <div id={`mgx-${item.writer.id}`}
                                            className='message-who'
                                            style={{
                                                position: 'relative',
                                                top: '-25px',
                                                left: '10px',
                                                display: 'inline-block',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}>
                                            {item.writer.username}
                                            <span style={{ fontSize: '14px' }}> &gt;</span>
                                        </div>
                                        <div style={{ position: 'absolute', display: 'inline', top: '55px', left: '80px', fontSize: '11pt' }}>{item.writedate.slice(0, 16)}</div>
                                        <div id="guestbook-content" style={loginNo === item.writer.id ? { background: '#9dc0a9' } : {}}><span>{item.content}</span>
                                            {
                                                loginNo === item.writer.id &&
                                                <div className="guestbook-delete-btn" onClick={() => guestbookDelete(item.id)}>×</div>
                                            }
                                            {
                                                userNo === loginNo && replyList[item.id]?.length === 0 &&
                                                <>
                                                    <button id="guestbook-reply-btn" onClick={() => replyToggle(item.id)}>답글</button>
                                                    <div className="guestbook-write-box" id={`guestbook-${item.id}`} style={{ display: 'none', border: 'none', padding: '0' }}>
                                                        <span>┗</span>
                                                        <textarea id={`guestbook-write-${item.id}`} className="guestbook-write" placeholder="답글을 입력해 주세요." />
                                                        <input type="button" id="guestbook-write-btn" onClick={() => guestbookWrite(item.id)} value="등록" />
                                                    </div>
                                                </>
                                            }
                                        </div>
                                        {
                                            replyList[item.id]?.map(reply => {
                                                return (
                                                    <div key={reply.id} className="guestbook-reply" style={loginNo === reply.writer.id ? { background: '#ddd' } : {}}>
                                                        <span>┗ </span>
                                                        <span style={loginNo === reply.writer.id ? { fontWeight: 'bold' } : {}}>{reply.writer.username}</span>:
                                                        <span style={{ lineHeight: '1.4' }}>{reply.content}</span>
                                                        <span style={{
                                                            position: 'absolute',
                                                            bottom: '3px',
                                                            right: '10px',
                                                            fontSize: '10.2pt',
                                                            color: '#666'
                                                        }}>{reply.writedate.slice(0, 16)}</span>
                                                        {
                                                            loginNo === reply.writer.id &&
                                                            <div className="reply-delete-btn" onClick={() => guestbookDelete(reply.id, item.id)}>×</div>
                                                        }
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                        }

                    </>
                }
                {
                    profileMenu === "product" &&
                    <>
                        {
                            (products.length === 0 || loginNo !== userNo && products.filter(product => product.state === 'SELL').length === 0) ?
                            <div style={{ padding: '20px', textAlign: 'center' }}>등록된 작품이 없습니다.</div>
                            :
                            <div className={loginNo !== userNo ? "product-grid" : "user-product-grid"}>
                            {products.map((product, index) => (
                                (loginNo === userNo || product.state === 'SELL') &&
                                <div
                                    key={`${product.id}-${index}`}
                                    className="product-card"
                                    style={{minWidth:0}}
                                >
                                    <img style={{ cursor: 'pointer'}} onClick={() => moveInfo(product)}
                                        src={`${serverIP.ip}/uploads/product/${product.id}/${product.images[0]?.filename}`}
                                        alt={product.productName}
                                        className={loginNo === userNo ? "mypage-product-img" : "user-product-img"}
                                    />
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
                        }
                    </>
                }
                {
                    profileMenu === "review" && <CustomerReview/>
                }
            </div>
        </div>
    )
}

export default UserInfo;