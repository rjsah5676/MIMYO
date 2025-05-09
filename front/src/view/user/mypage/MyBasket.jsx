import axios from "axios";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setModal } from "../../../../src/store/modalSlice";

function MyBasket() {
    const user = useSelector((state) => state.auth.user);
    const modalSel = useSelector((state) => state.modal);
    const [basketItems, setBasketItems] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();
    const loc = useLocation();
    const [imageIndex, setImageIndex] = useState(0);
    const dispatch = useDispatch();

    const fetchBasketItems = useCallback(async () => {
        if (user) {
            try {
                const response = await axios.get(`${serverIP.ip}/basket/list`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setBasketItems(response.data);

            } catch (err) {
                console.log(err);
            }
        }
    }, [user, serverIP]);

    useEffect(() => {
        if (user) {
            axios
                .get(`${serverIP.ip}/auth/me`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((res) => {
                })
                .catch((err) => console.log(err));

            fetchBasketItems();
        }
    }, [user, serverIP, fetchBasketItems]);

    useEffect(() => {
        if (!modalSel.isOpen && modalSel.selected === 'basket-box') {
            fetchBasketItems();
        }
    }, [modalSel, fetchBasketItems]);

    const moveProductInfo = (item) => {
        if (user) {
            axios.get(`${serverIP.ip}/basket/getProduct?productId=${item}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            })
                .then(res => {
                    navigate('/product/info', {
                        state: {
                            product: res.data
                        }
                    });
                })
                .catch(err => console.log(err));
        }
    }

    const groupedItems = useMemo(() => {
        const grouped = {};
        basketItems.forEach((item) => {
            const productKey = item.productNo;
            if (!grouped[productKey]) {
                grouped[productKey] = {
                    productNo: item.productNo,
                    productName: item.productName,
                    productImage: item.productImage,
                    productPrice: item.productPrice,
                    productDiscountRate: item.productDiscountRate,
                    productShippingFee: item.productShippingFee,
                    sellerName: item.sellerName,
                    sellerNo: item.sellerNo,
                    items: [],
                };
            }
            grouped[productKey].items.push(item);
        });
        return grouped;
    }, [basketItems]);
    {
    }
    const handleAllCheck = (e) => {
        const newAllChecked = e.target.checked;
        setAllChecked(newAllChecked);

        const newCheckedItems = {};
        if (newAllChecked) {
            basketItems.forEach((item) => {
                newCheckedItems[item.basketNo] = true;
            });
        }
        setCheckedItems(newCheckedItems);
    };

    const handleItemCheck = (basketNo) => {
        const newCheckedItems = { ...checkedItems };
        if (newCheckedItems[basketNo]) {
            delete newCheckedItems[basketNo];
        } else {
            newCheckedItems[basketNo] = true;
        }
        setCheckedItems(newCheckedItems);
    };

    useEffect(() => {
        setAllChecked(basketItems.length > 0 && basketItems.every((item) => checkedItems[item.basketNo]));
    }, [checkedItems, basketItems]);

    const formatNumberWithCommas = (number) => {
        if (number === undefined || number === null) {
            return "0";
        }
        return number.toLocaleString();
    };

    const calculateTotals = () => {
        let selectedPrice = 0;
        let totalDiscountedPrice = 0;
        let totalShippingFee = 0;
        let sellers = new Set();
        const countedProductNos = new Set();

        basketItems.forEach((item) => {
            if (checkedItems[item.basketNo]) {
                const discountedPrice = item.productDiscountRate > 0
                    ? item.productPrice * item.productDiscountRate / 100
                    : 0;

                const itemPrice = item.productPrice;

                selectedPrice += (itemPrice + item.additionalPrice) * item.quantity;
                totalDiscountedPrice += discountedPrice * item.quantity;

                if (!countedProductNos.has(item.productNo)) {
                    totalShippingFee += item.productShippingFee;
                    countedProductNos.add(item.productNo);
                }

                sellers.add(item.sellerName);
            }
        });

        return {
            selectedPrice,
            totalDiscountedPrice,
            totalShippingFee,
            totalAmount: selectedPrice + totalShippingFee - totalDiscountedPrice,
            sellers
        };
    };

    const totals = calculateTotals();

    const getOrderButtonText = () => {
        const sellersArray = Array.from(totals.sellers);
        if (sellersArray.length === 0) {
            return "주문하기";
        } else if (sellersArray.length === 1) {
            return `${sellersArray[0]}님의 상품\n주문하기`;
        } else {
            return `${sellersArray[0]}님의 상품 외\n${sellersArray.length - 1}건 주문하기`;
        }
    };

    const handleDeleteSelected = () => {
        if (window.confirm("선택한 상품을 삭제하시겠습니까?")) {
            const selectedBasketNos = Object.keys(checkedItems);
            if (selectedBasketNos.length === 0) {
                alert("선택한 상품이 없습니다.");
                return;
            }

            axios
                .delete(`${serverIP.ip}/basket/delete`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                    data: { basketNos: selectedBasketNos },
                })
                .then(() => {
                    setBasketItems(basketItems.filter((item) => !selectedBasketNos.includes(String(item.basketNo))));
                    setCheckedItems({});
                    setAllChecked(false);
                    alert("선택한 장바구니 상품이 삭제되었습니다.");
                })
                .catch((err) => console.log(err));
        }
    };

    const handleOrder = () => {
        const selectedItemsForOrder = basketItems.filter(item => checkedItems[item.basketNo]);

        if (selectedItemsForOrder.length === 0) {
            alert("선택된 상품이 없습니다.");
            return;
        }

        navigate('/product/buying', { state: { basketItems: selectedItemsForOrder } });
    };

    return (
        <div style={{ paddingLeft: "10px" }}>
            <div className="basket-sel-all">
            <label style={{ cursor: 'pointer' }}>
            <input
                type="checkbox"
                id="check-all"
                checked={allChecked}
                onChange={handleAllCheck}
                style={{ cursor: 'pointer', marginRight: '5px' }}
            />
            🛒 전체 선택
            </label>
                <button id="selected-delete-btn" type="button" onClick={handleDeleteSelected}>선택 삭제</button>
                <hr />
            </div>
            {Object.keys(groupedItems).length > 0 ? (
                Object.values(groupedItems).map((group, index) => (
                    <div key={index} className="basket-body">
                        <label style={{ cursor: 'pointer', display: 'block', marginBottom: '5px' }}>
                        <input
                            type="checkbox"
                            id={`check-seller-${group.sellerNo}`}
                            checked={group.items.every(item => checkedItems[item.basketNo])}
                            onChange={(e) => {
                                const newChecked = { ...checkedItems };
                                group.items.forEach(item => {
                                    if (e.target.checked) {
                                        newChecked[item.basketNo] = true;
                                    } else {
                                        delete newChecked[item.basketNo];
                                    }
                                });
                                setCheckedItems(newChecked);
                            }}
                            style={{ cursor: 'pointer', marginRight: '5px' }}
                        />
                        <b>{group.sellerName}</b>님의 상품
                        </label>


                        <ul className="basket-list">
                            <li>
                                <img id="basket-product-img" onClick={() => moveProductInfo(group.productNo)}
                                    src={`${serverIP.ip}/uploads/product/${group.productNo}/${group.productImage}`}
                                />
                            </li>
                            <li>
                                <div>
                                    <span style={{ fontSize: '14pt', cursor: 'pointer' }} onClick={() => moveProductInfo(group.productNo)}>{group.productName}</span><br />
                                    {
                                        group.productDiscountRate > 0 ?
                                            <>
                                                <b>{formatNumberWithCommas(group.productPrice - group.productPrice * group.productDiscountRate / 100)}원</b>
                                                <span style={{ textDecoration: 'line-through', color: '#aaa', paddingLeft: '5px' }}>{formatNumberWithCommas(group.productPrice)}</span>
                                            </> :
                                            <b>{formatNumberWithCommas(group.productPrice)}원</b>}
                                </div>
                                <div>
                                    {group.items.map((item, idx) => (
                                        <div key={idx}>
                                            <label style={{ cursor: 'pointer', display: 'block' }}>
                                            <input
                                                type="checkbox"
                                                id={`check-${item.basketNo}`}
                                                checked={checkedItems[item.basketNo] || false}
                                                onChange={() => handleItemCheck(item.basketNo)}
                                                style={{ cursor: 'pointer', marginRight: '5px' }}
                                            />
                                            옵션: {item.optionName} / {item.categoryName} - 추가금액 +{formatNumberWithCommas(item.additionalPrice)}원
                                            </label><span>수량: {item.quantity}</span>
                                            <button id="order-modify-btn"
                                                onClick={() => dispatch(setModal({ isOpen: true, selected: 'basket-box', selectedItem: item }))}
                                            >수정</button>
                                        </div>
                                    ))}
                                </div>
                            </li>
                            <li style={{ textAlign: 'center', alignSelf: 'center' }}>배송비<br />{formatNumberWithCommas(group.productShippingFee)}원</li>
                        </ul>
                        <div id="shipping-fee-bottom" style={{ textAlign: 'center', alignSelf: 'center' }}>배송비 {formatNumberWithCommas(group.productShippingFee)}원</div>
                    </div>
                ))
            ) : (
                <div>장바구니에 담긴 상품이 없습니다.</div>
            )}


            <div className="basket-body" style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '80%' }}>
                    <ul className="price-list">
                        <li>선택상품금액</li>
                        <li>총배송비</li>
                        <li>할인예상금액</li>
                        <li>주문금액</li>
                    </ul>
                    <ul className="price-list" style={{width: '85%', margin: '0 auto'}}>
                        <li>{formatNumberWithCommas(totals.selectedPrice)}원</li>
                        <li>➕</li>
                        <li>{formatNumberWithCommas(totals.totalShippingFee)}원</li>
                        <li>➖</li>
                        <li>{formatNumberWithCommas(totals.totalDiscountedPrice)}원</li>
                        <li>🟰</li>
                        <li>{formatNumberWithCommas(totals.totalAmount)}원</li>
                    </ul>
                </div>
                <button id="order-btn" type="button" onClick={handleOrder}>{getOrderButtonText()}</button>
            </div>
        </div>
    );
}
export default MyBasket;