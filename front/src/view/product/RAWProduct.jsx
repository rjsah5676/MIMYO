import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RAWProduct() {
    const [RAWList, setRAWList] = useState([]);
    const [productList, setProductList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const itemsPerPage = 4;
    const cardWidth = 284;
    const serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${serverIP.ip}/product/getList/getRAW`)
            .then((res) => {
                setRAWList(res.data);
                if (res.data.length > 0)
                    handleCategoryClick(res.data[0].productCategory);
            })
            .catch((err) => console.log(err));
    }, []);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setCurrentSlide(0);

        axios.get(`${serverIP.ip}/product/getList/byCategory?category=${category}`)
            .then((res) => {
                setProductList(res.data);
            })
            .catch((err) => console.log(err));
    };


    function formatNumberWithCommas(num) {
        return num.toLocaleString();
    }

    const moveInfo = (id) => {
        axios.get(`${serverIP.ip}/product/getInfo?productId=${id}`)
        .then(res =>{
            navigate('/product/info', { state: { product: res.data } })
        })
        .catch(err => console.log(err));
    }
    return (
        <>
            <div className="search-page-banner">
                <h1>✨리뷰와 찜이 증명한 인기 작품!💖</h1>
                <p>사람들이 좋아하는 <span style={{ fontWeight: '600', color: '#8CC7A5' }}>핸드메이드 아이템</span>을 지금 확인해보세요</p>
            </div>
            <div className="polaroid-wall">
            {RAWList.slice(0, 10).map((product, idx) => (
                <div onClick={() => moveInfo(product.id)}
                className="polaroid"
                key={product.id}
                style={{
                    transform: `rotate(${Math.random() * 10 - 5}deg)`, // -5 ~ +5도 랜덤
                }}
                >
                <div className="polaroid-image-wrapper">
                    <img src={`${serverIP.ip}/uploads/product/${product.id}/${product.image.filename}`} alt={product.productName} />
                    <div className="polaroid-price-badge">{product.discountRate > 0 ? (
                        <>
                        <span className="polaroid-original-price">{formatNumberWithCommas(product.price)}원</span>
                        <span className="polaroid-discounted-price">{formatNumberWithCommas(Math.round(product.price * (1 - product.discountRate / 100)))}원({product.discountRate}%)</span>
                        </>
                    ) : (
                        `${formatNumberWithCommas(product.price)}원`
                    )}</div>
                </div><p className='polaroid-title'>{product.productName}</p>
                <div className="polaroid-meta">
                    <strong>❤️ {product.wish_count}</strong>
                    <strong>⭐ {product.rating}({product.rating_count})</strong>
                    </div>
                </div>
            ))}
            </div>
        </>
    );
}

export default RAWProduct;
