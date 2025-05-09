import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

function MySettlement() {
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
            //setTotalCount(res.data.totalCount);
            setSelectedCount(res.data.selectedCount);

            const total = res.data.totalPage || 1;
            setTotalPage(prev => ({ ...prev, readable: total }));
            const pages = Array.from({ length: total }, (_, i) => i + 1);
            setPageNumber(prev => ({ ...prev, readable: pages }));
        } catch (err) {
            console.log(err);
        }
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
            const res = await axios.get(`${serverIP.ip}/mypage/getSettledSellersList`, {
                params: { year, month, keyword, page },
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setSettledProductLists({});
            setExpandedSettled(null);
            setSettledSellers(res.data.sellers);
            setSettledSelectedCount(res.data.selectedCount);
            console.log(res.data);
            const total = res.data.totalPage || 1;
            setSettledTotalPage(prev => ({ ...prev, readable: total }));
            const pages = Array.from({ length: total }, (_, i) => i + 1);
            setSettledPageNumber(prev => ({ ...prev, readable: pages }));
        } catch (err) {
            console.error("정산 완료 정보 불러오기 실패", err);
        }
    };

    const handleExpandSettled = async (user_id, settleMonthStr) => {
        let [year, month] = [settledYear === "전체" ? "" : settledYear, settledMonth === "전체" ? "" : settledMonth];
        if(settleMonthStr !== undefined){
            const [a,b] = settleMonthStr.split('-');
            year = a;
            month = b;
        }
        const key = `${user_id}-${year}-${month}`;
        setExpandedSettled(prev => prev === key ? null : key);
        setSettledProductLists(prev => ({
            ...prev,
            [key]: { loading: true, error: null, products: [] }
        }));
        try {
            const res = await axios.get(`${serverIP.ip}/mypage/getSellerSettledProducts`, {
                params: {
                    user_id,
                    shippingState: "SETTLED",
                    settledYear: year,
                    settledMonth: month
                },
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSettledProductLists(prev => ({
                ...prev,
                [key]: { loading: false, error: null, products: res.data.orderList }
            }));
        } catch (error) {
            setSettledProductLists(prev => ({
                ...prev,
                [key]: { loading: false, error: "데이터 불러오기 실패" }
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
                <div className="settlement-search">
                    <div>
                        <strong></strong><br />
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
                        <button 
                        style = {{
                            width:'60px',
                            height:'30px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            backgroundColor: '#8CC7A5',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                        onClick={()=> handleSettledSearch()}>검색</button>
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

                {settledSellers.map((seller, idx) => {
                        const settleMonthKey = (() => {
                            const hasYear = settledYear !== "" && settledYear !== "전체";
                            const hasMonth = settledMonth !== "" && settledMonth !== "전체";
                        
                            if (!hasYear && !hasMonth) {
                                return `${seller.user_id}-${seller.settle_month}`;
                            } else if (hasYear && !hasMonth) {
                                const fallbackMonth = seller.settle_month?.split("-")[1] || "";
                                return `${seller.user_id}-${settledYear}-${fallbackMonth}`;
                            } else if (!hasYear && hasMonth) {
                                const fallbackYear = seller.settle_month?.split("-")[0] || "";
                                return `${seller.user_id}-${fallbackYear}-${settledMonth}`;
                            } else {
                                return `${seller.user_id}-${settledYear}-${settledMonth}`;
                            }
                        })();
                        const isExpanded = expandedSettled === settleMonthKey;
                   return (
                    <>
                        <ul key={seller.user_id} className="admin-seller-list">
                            <li>{idx + 1}</li>
                            <li>{seller.user_id}</li>
                            <li className='message-who' id={`mgx-${seller.user_id}`} style={{ cursor: 'pointer' }}>{seller.user_name}</li>
                            <li style={{ cursor: 'pointer', color: '#007bff' }} onClick={() => handleExpandSettled(seller.user_id, seller.settle_month)}>
                                {formatNumberWithCommas(seller.total_sales)}원
                                {isExpanded ? ' ▲' : ' ▼'}
                            </li>
                            <li>{formatNumberWithCommas(Math.ceil(seller.total_sales * 0.8))}원</li>
                            <li>정산 완료</li>
                        </ul>
                        {isExpanded && (
                            <div style={{ background: '#f9f9f9', padding: '10px 30px', }}>
                                {settledProductLists[settleMonthKey]?.loading && <div>로딩 중...</div>}
                                {settledProductLists[settleMonthKey]?.error && <div style={{ color: 'red' }}>{settledProductLists[settleMonthKey].error}</div>}
                                {settledProductLists[settleMonthKey]?.products && settledProductLists[settleMonthKey].products.length > 0 && (
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
                                            {settledProductLists[settleMonthKey]?.products?.map((product, i) => {
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
                                {productLists[settleMonthKey]?.products && productLists[settleMonthKey].products.length === 0 && !productLists[settleMonthKey]?.loading && (
                                    <div>판매 내역이 없습니다.</div>
                                )}
                            </div>
                        )}
                    </>
                );}
                )}
            </div>
        </div>

    )
}

export default MySettlement;