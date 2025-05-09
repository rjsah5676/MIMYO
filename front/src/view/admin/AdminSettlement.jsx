import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

function AdminSettlement() {
    const serverIP = useSelector((state) => state.serverIP);
    const user = useSelector((state) => state.auth.user);
    const [sellers, setSellers] = useState([]);
    //const [totalCount, setTotalCount] = useState(0);
    const [selectedCount, setSelectedCount] = useState(0);
    const [totalPage, setTotalPage] = useState({ readable: 1 });
    const [pageNumber, setPageNumber] = useState({ readable: [] });
    const [nowPage, setNowPage] = useState({ readable: 1 });
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");
    const [searchWord, setSearchWord] = useState("");
    const [expandedUser, setExpandedUser] = useState(null);
    const [productLists, setProductLists] = useState({});
    const [expandedSettled, setExpandedSettled] = useState(null);
    const [settledProductLists, setSettledProductLists] = useState({});
    const [settledSellers, setSettledSellers] = useState([]);
    //const [settledTotalCount, setSettledTotalCount] = useState(0);
    const [settledSelectedCount, setSettledSelectedCount] = useState(0);
    const [settledTotalPage, setSettledTotalPage] = useState({ readable: 1 });
    const [settledPageNumber, setSettledPageNumber] = useState({ readable: [] });
    const [settledNowPage, setSettledNowPage] = useState({ readable: 1 });
    const [settledMonth, setSettledMonth] = useState("");
    const [settledYear, setSettledYear] = useState("");
    const [settledSearchWord, setSettledSearchWord] = useState("");

    const fetchUsers = async ({ year = "", month = "", keyword = "", page = 1 }) => {
        try {
            const res = await axios.get(`${serverIP.ip}/admin/getSellersSettlement`, {
                params: { year, month, keyword, page },
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setProductLists({});
            setExpandedUser(null);
            setSellers(res.data.sellers);
            setSelectedCount(res.data.selectedCount);

            const total = res.data.totalPage || 1;
            setTotalPage(prev => ({ ...prev, readable: total }));
            const pages = Array.from({ length: total }, (_, i) => i + 1);
            setPageNumber(prev => ({ ...prev, readable: pages }));
        } catch (err) {
            console.log(err);
        }
    };

    const handleExpand = async (user_id) => {
        setExpandedUser(prev => prev === user_id ? null : user_id);
        setProductLists(prev => ({
            ...prev,
            [user_id]: { loading: true, error: null, products: [] }
        }));
        try {
            const res = await axios.get(`${serverIP.ip}/admin/getSellerSoldProducts`, {
                params: {
                    user_id,
                    shippingState: "FINISH",
                    year: year === "전체" ? "" : year,
                    month: month === "전체" ? "" : month
                },
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setProductLists(prev => ({
                ...prev,
                [user_id]: { loading: false, error: null, products: res.data.orderList }
            }));
        } catch (error) {
            setProductLists(prev => ({
                ...prev,
                [user_id]: { loading: false, error: "데이터 불러오기 실패" }
            }));
        }
    };

    const handleSettlement = async (user_id, total_sales) => {
        let confirmationMessage;
        if (!productLists[user_id]) {
            alert("판매금액을 확인후 처리해주세요.");
            return;
        } else if (productLists[user_id]) {
            confirmationMessage = `판매자 '${user_id}' 의 정산을 진행하시겠습니까?`;
        }
        if (user && window.confirm(confirmationMessage))
            axios.post(`${serverIP.ip}/admin/handleSettle`, { orders: productLists[user_id].products }, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
                .then(res => {
                    alert("정산처리가 완료되었습니다.");
                    fetchUsers({
                        year: year,
                        month: month,
                        keyword: searchWord,
                        page: nowPage.readable
                    })
                    fetchSettledList({
                        year: settledYear,
                        month: settledMonth,
                        keyword: settledSearchWord,
                        page: settledNowPage.readable,
                    })
                })
                .catch(err => {
                    console.log(err);
                })
    };

    useEffect(() => {
        fetchUsers({
            year: "",
            month: "",
            keyword: "",
            page: nowPage.readable,
        });
    }, []);

    useEffect(() => {
        fetchSettledList({
            year: "",
            month: "",
            keyword: "",
            page: settledNowPage.readable,
        });
    }, []);

    useEffect(() => {
        fetchUsers({
            year: year,
            month: month,
            keyword: searchWord,
            page: nowPage.readable
        });
    }, [nowPage.readable]);

    useEffect(() => {
        fetchSettledList({
            year: settledYear,
            month: settledMonth,
            keyword: settledSearchWord,
            page: settledNowPage.readable,
        });
    }, [settledNowPage.readable]);

    const handleSearch = () => {
        setNowPage(prev => ({ ...prev, readable: 1 }));
        fetchUsers({
            year: year,
            month: month,
            keyword: searchWord,
            page: 1
        });
    };

    const handleSettledSearch = () => {
        setSettledNowPage(prev => ({ ...prev, readable: 1 }));
        fetchSettledList({
            year: settledYear,
            month: settledMonth,
            keyword: settledSearchWord,
            page: 1
        });
    };

    const fetchSettledList = async ({ year = "", month = "", keyword = "", page = 1 }) => {
        try {
            const res = await axios.get(`${serverIP.ip}/admin/getSettledSellersList`, {
                params: { year, month, keyword, page },
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setSettledProductLists({});
            setExpandedSettled(null);
            setSettledSellers(res.data.sellers);
            //setSettledTotalCount(res.data.totalCount);
            setSettledSelectedCount(res.data.selectedCount);

            const total = res.data.totalPage || 1;
            setSettledTotalPage(prev => ({ ...prev, readable: total }));
            const pages = Array.from({ length: total }, (_, i) => i + 1);
            setSettledPageNumber(prev => ({ ...prev, readable: pages }));
        } catch (err) {
            console.error("정산 완료 정보 불러오기 실패", err);
        }
    };

    const handleExpandSettled = async (user_id) => {
        setExpandedSettled(prev => prev === user_id ? null : user_id);
        setSettledProductLists(prev => ({
            ...prev,
            [user_id]: { loading: true, error: null, products: [] }
        }));
        try {
            const res = await axios.get(`${serverIP.ip}/admin/getSellerSettledProducts`, {
                params: {
                    user_id,
                    shippingState: "SETTLED",
                    settledYear: settledYear === "전체" ? "" : settledYear,
                    settledMonth: settledMonth === "전체" ? "" : settledMonth
                },
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSettledProductLists(prev => ({
                ...prev,
                [user_id]: { loading: false, error: null, products: res.data.orderList }
            }));
        } catch (error) {
            setSettledProductLists(prev => ({
                ...prev,
                [user_id]: { loading: false, error: "데이터 불러오기 실패" }
            }));
        }
    };

    const inputStyle = {
        width: "140px",
        padding: "7px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px",
        marginRight: "10px",
    };
    const inputStyle2 = {
        width: "200px",
        padding: "8px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px",
    };

    const formatNumberWithCommas = (number) => {
        if (number === undefined || number === null) {
            return "0";
        }
        return number.toLocaleString();
    };

    return (
        <div style={{ paddingLeft: "10px" }}>
            <div className="report-box">
                <span style={{ fontSize: "17px", fontWeight: "600", color: "#555" }}>
                    💰미정산 목록
                </span>
                <div className="report-search">
                    <div>
                        분류된 대상자 수 : <strong>{selectedCount}명</strong><br /><hr />
                    </div>
                    <div>
                        <select style={inputStyle} onChange={(e) => setYear(e.target.value)} value={year}>
                            <option value="전체">전체 년도</option>
                            <option value="2025">2025년</option>
                            <option value="2026">2026년</option>
                            <option value="2027">2027년</option>
                            <option value="2028">2028년</option>
                        </select>
                        <select style={inputStyle} onChange={(e) => setMonth(e.target.value)} value={month}>
                            <option value="전체">전체 월</option>
                            <option value="1">1월</option>
                            <option value="2">2월</option>
                            <option value="3">3월</option>
                            <option value="4">4월</option>
                            <option value="5">5월</option>
                            <option value="6">6월</option>
                            <option value="7">7월</option>
                            <option value="8">8월</option>
                            <option value="9">9월</option>
                            <option value="10">10월</option>
                            <option value="11">11월</option>
                            <option value="12">12월</option>
                        </select>
                        <input
                            style={inputStyle2}
                            value={searchWord}
                            onChange={(e) => setSearchWord(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                            placeholder="아이디/판매자 이름"
                        />
                    </div>
                </div>

                <ul className="admin-seller-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                    <li>번호</li>
                    <li>아이디</li>
                    <li>이름</li>
                    <li>총 판매 금액</li>
                    <li>해당 월 정산 금액</li>
                    <li>정산 상태</li>
                </ul>

                {sellers.map((seller, idx) => (
                    <>
                        <ul key={seller.user_id} className="admin-seller-list">
                            <li>{idx + 1}</li>
                            <li>{seller.user_id}</li>
                            <li className='message-who' id={`mgx-${seller.user_id}`} style={{ cursor: 'pointer' }}>{seller.user_name}</li>
                            <li style={{ cursor: 'pointer', color: '#007bff' }} onClick={() => handleExpand(seller.user_id)}>
                                {formatNumberWithCommas(seller.total_sales)}원
                                {expandedUser === seller.user_id ? ' ▲' : ' ▼'}
                            </li>
                            <li>{formatNumberWithCommas(Math.ceil(seller.total_sales * 0.8))}원</li>
                            <li><button style={{ height: '30px', width: '70px' }}
                                disable={seller.settled}
                                onClick={() => handleSettlement(seller.user_id, seller.total_sales)}
                            >정산 처리</button></li>
                        </ul>
                        {expandedUser === seller.user_id && (
                            <div style={{ background: '#f9f9f9', padding: '10px 30px', }}>
                                {productLists[seller.user_id]?.loading && <div>로딩 중...</div>}
                                {productLists[seller.user_id]?.error && <div style={{ color: 'red' }}>{productLists[seller.user_id].error}</div>}
                                {productLists[seller.user_id]?.products && productLists[seller.user_id].products.length > 0 && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #ccc' }}>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>판매일자</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>제품명</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>가격</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>할인율</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>수량/옵션</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>택배비</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>판매 금액</th>
                                            </tr>
                                        </thead>
                                        <tbody  >
                                            {productLists[seller.user_id]?.products?.map((product, i) => {
                                                const date = new Date(product.modifiedDate);
                                                const year = String(date.getFullYear()).slice(-2);
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const hours = String(date.getHours()).padStart(2, '0');
                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
                                                const shippingPrice = product.shippingFee;
                                                const orderItemCount = product.orderItems?.length || 0;
                                                const bgc = i % 2 === 0 ? '#f0f0f0' : '#ffffff';

                                                return product.orderItems?.map((item, j) => (
                                                    <tr key={`${i}-${j}`} style={{ backgroundColor: bgc }}>
                                                        {j === 0 && (
                                                            <>
                                                                <td style={{ textAlign: 'center', padding: '4px' }} rowSpan={orderItemCount}>
                                                                    {formattedDate}
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '4px' }} rowSpan={orderItemCount}>
                                                                    {product.product.productName}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td style={{ textAlign: 'right', padding: '4px' }}>
                                                            {formatNumberWithCommas(item.price + item.additionalFee)}원
                                                        </td>
                                                        {j === 0 && (
                                                            <td style={{ textAlign: 'right', padding: '4px' }} rowSpan={orderItemCount}>
                                                                {product.product.discountRate}%
                                                            </td>
                                                        )}

                                                        <td style={{ textAlign: 'center', padding: '4px' }}>
                                                            {item.quantity}개 / ({item.optionName} - {item.optionCategoryName})
                                                        </td>
                                                        {j === 0 && (
                                                            <td
                                                                style={{ textAlign: 'center', padding: '4px' }}
                                                                rowSpan={orderItemCount}
                                                            >
                                                                {`${formatNumberWithCommas(shippingPrice)}원`}
                                                            </td>
                                                        )}
                                                        <td style={{ textAlign: 'right', padding: '4px' }}>
                                                            {formatNumberWithCommas(
                                                                ((item.price - (item.price * product.product.discountRate / 100)) +
                                                                    item.additionalFee) *
                                                                item.quantity +
                                                                (j === 0 ? shippingPrice : 0)
                                                            )}원
                                                        </td>
                                                    </tr>
                                                ));
                                            })}
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td style={{ textAlign: 'right', padding: '4px' }}>총 판매 금액 : </td>
                                                <td style={{ textAlign: 'right', padding: '4px' }}>{formatNumberWithCommas(seller.total_sales)}원</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                                {productLists[seller.user_id]?.products && productLists[seller.user_id].products.length === 0 && !productLists[seller.user_id]?.loading && (
                                    <div>판매 내역이 없습니다.</div>
                                )}
                            </div>
                        )}
                    </>
                ))}

                <ul className="admin-paging">
                    {nowPage.readable > 1 && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, readable: nowPage.readable - 1 }))}>
                            <li className="page-num">◀</li>
                        </a>
                    )}
                    {pageNumber.readable.map(pg => (
                        <a className="page-num" onClick={() => setNowPage(prev => ({ ...prev, readable: pg }))} key={pg}>
                            <li className={nowPage.readable === pg ? "page-num active" : "page-num"}>{pg}</li>
                        </a>
                    ))}
                    {nowPage.readable < totalPage.readable && (
                        <a className="page-prenext" onClick={() => setNowPage(prev => ({ ...prev, readable: nowPage.readable + 1 }))}>
                            <li className="page-num">▶</li>
                        </a>
                    )}
                </ul>
            </div>

            <div className="report-box">
                <span style={{ fontSize: "17px", fontWeight: "600", color: "#555" }}>
                    💸정산 완료 목록
                </span>
                <div className="report-search">
                    <div>
                        분류된 대상자 수 : <strong>{settledSelectedCount}명</strong><br /><hr />
                    </div>
                    <div>
                        <select style={inputStyle} onChange={(e) => setSettledYear(e.target.value)} value={settledYear}>
                            <option value="전체">전체 년도</option>
                            <option value="2025">2025년</option>
                            <option value="2026">2026년</option>
                            <option value="2027">2027년</option>
                            <option value="2028">2028년</option>
                        </select>
                        <select style={inputStyle} onChange={(e) => setSettledMonth(e.target.value)} value={settledMonth}>
                            <option value="전체">전체 월</option>
                            <option value="1">1월</option>
                            <option value="2">2월</option>
                            <option value="3">3월</option>
                            <option value="4">4월</option>
                            <option value="5">5월</option>
                            <option value="6">6월</option>
                            <option value="7">7월</option>
                            <option value="8">8월</option>
                            <option value="9">9월</option>
                            <option value="10">10월</option>
                            <option value="11">11월</option>
                            <option value="12">12월</option>
                        </select>
                        <input
                            style={inputStyle2}
                            value={settledSearchWord}
                            onChange={(e) => setSettledSearchWord(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSettledSearch();
                            }}
                            placeholder="아이디/판매자 이름"
                        />
                    </div>
                </div>

                <ul className="admin-seller-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
                    <li>번호</li>
                    <li>아이디</li>
                    <li>이름</li>
                    <li>총 판매 금액</li>
                    <li>해당 월 정산 금액</li>
                    <li>정산 상태</li>
                </ul>

                {settledSellers.map((seller, idx) => (
                    <>
                        <ul key={seller.user_id} className="admin-seller-list">
                            <li>{idx + 1}</li>
                            <li>{seller.user_id}</li>
                            <li className='message-who' id={`mgx-${seller.user_id}`} style={{ cursor: 'pointer' }}>{seller.user_name}</li>
                            <li style={{ cursor: 'pointer', color: '#007bff' }} onClick={() => handleExpandSettled(seller.user_id)}>
                                {formatNumberWithCommas(seller.total_sales)}원
                                {expandedSettled === seller.user_id ? ' ▲' : ' ▼'}
                            </li>
                            <li>{formatNumberWithCommas(Math.ceil(seller.total_sales * 0.8))}원</li>
                            <li>정산 완료</li>
                        </ul>
                        {expandedSettled === seller.user_id && (
                            <div style={{ background: '#f9f9f9', padding: '10px 30px', }}>
                                {settledProductLists[seller.user_id]?.loading && <div>로딩 중...</div>}
                                {settledProductLists[seller.user_id]?.error && <div style={{ color: 'red' }}>{settledProductLists[seller.user_id].error}</div>}
                                {settledProductLists[seller.user_id]?.products && settledProductLists[seller.user_id].products.length > 0 && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #ccc' }}>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>정산일자</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>제품명</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>가격</th>
                                                <th style={{ textAlign: 'right', padding: '4px' }}>할인율</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>수량/옵션</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>택배비</th>
                                                <th style={{ textAlign: 'center', padding: '4px' }}>판매 금액</th>
                                            </tr>
                                        </thead>
                                        <tbody  >
                                            {settledProductLists[seller.user_id]?.products?.map((product, i) => {
                                                const date = new Date(product.modifiedDate);
                                                const year = String(date.getFullYear()).slice(-2);
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const hours = String(date.getHours()).padStart(2, '0');
                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
                                                const shippingPrice = product.shippingFee;
                                                const orderItemCount = product.orderItems?.length || 0;
                                                const bgc = i % 2 === 0 ? '#f0f0f0' : '#ffffff';

                                                return product.orderItems?.map((item, j) => (
                                                    <tr key={`${i}-${j}`} style={{ backgroundColor: bgc }}>
                                                        {j === 0 && (
                                                            <>
                                                                <td style={{ textAlign: 'center', padding: '4px' }} rowSpan={orderItemCount}>
                                                                    {formattedDate}
                                                                </td>
                                                                <td style={{ textAlign: 'center', padding: '4px' }} rowSpan={orderItemCount}>
                                                                    {product.product.productName}
                                                                </td>
                                                            </>
                                                        )}
                                                        <td style={{ textAlign: 'right', padding: '4px' }}>
                                                            {formatNumberWithCommas(item.price + item.additionalFee)}원
                                                        </td>
                                                        {j === 0 && (
                                                            <td style={{ textAlign: 'right', padding: '4px' }} rowSpan={orderItemCount}>
                                                                {product.product.discountRate}%
                                                            </td>
                                                        )}
                                                        <td style={{ textAlign: 'center', padding: '4px' }}>
                                                            {item.quantity}개 / ({item.optionName} - {item.optionCategoryName})
                                                        </td>
                                                        {j === 0 && (
                                                            <td
                                                                style={{ textAlign: 'center', padding: '4px' }}
                                                                rowSpan={orderItemCount}
                                                            >
                                                                {`${formatNumberWithCommas(shippingPrice)}원`}
                                                            </td>
                                                        )}
                                                        <td style={{ textAlign: 'right', padding: '4px' }}>
                                                            {formatNumberWithCommas(
                                                                ((item.price - (item.price * product.product.discountRate / 100)) +
                                                                    item.additionalFee) *
                                                                item.quantity +
                                                                (j === 0 ? shippingPrice : 0)
                                                            )}원
                                                        </td>
                                                    </tr>
                                                ));

                                            })}
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td style={{ textAlign: 'center', padding: '4px' }}>총 판매 금액 : </td>
                                                <td style={{ textAlign: 'center', padding: '4px' }}>{formatNumberWithCommas(seller.total_sales)}원</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                                {productLists[seller.user_id]?.products && productLists[seller.user_id].products.length === 0 && !productLists[seller.user_id]?.loading && (
                                    <div>판매 내역이 없습니다.</div>
                                )}
                            </div>
                        )}
                    </>
                ))}

                <ul className="admin-paging">
                    {settledNowPage.readable > 1 && (
                        <a className="page-prenext" onClick={() => setSettledNowPage(prev => ({ ...prev, readable: settledNowPage.readable - 1 }))}>
                            <li className="page-num">◀</li>
                        </a>
                    )}
                    {settledPageNumber.readable.map(pg => (
                        <a className="page-num" onClick={() => setSettledNowPage(prev => ({ ...prev, readable: pg }))} key={pg}>
                            <li className={settledNowPage.readable === pg ? "page-num active" : "page-num"}>{pg}</li>
                        </a>
                    ))}
                    {settledNowPage.readable < settledTotalPage.readable && (
                        <a className="page-prenext" onClick={() => setSettledNowPage(prev => ({ ...prev, readable: settledNowPage.readable + 1 }))}>
                            <li className="page-num">▶</li>
                        </a>
                    )}
                </ul>
            </div>
        </div>

    )
}
export default AdminSettlement;