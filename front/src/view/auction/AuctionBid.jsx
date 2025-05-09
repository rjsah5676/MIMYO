import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

function AuctionBid() {
    const loc = useLocation();
    const navigate = useNavigate();
    const roomInfo = loc.state.roomInfo;
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);

    const stompClientRef = useRef(null);

    const [bidOptions, setBidOptions] = useState([]);
    const [selectedBid, setSelectedBid] = useState(null);

    useEffect(() => {
        // STOMP 연결
        const socket = new SockJS(`${serverIP.ip}/ws`);
        const stompClient = Stomp.over(socket);
        stompClient.connect({ Authorization: `Bearer ${user.token}` }, () => {
            stompClientRef.current = stompClient;
        });

        return () => {
            stompClient.disconnect();
        };
    }, []);

    useEffect(() => {
        const start = roomInfo.currentPrice + roomInfo.minBidIncrement;
        const end = roomInfo.buyNowPrice - roomInfo.minBidIncrement;
        const increment = roomInfo.minBidIncrement;

        const options = [];
        for (let price = start; price <= end; price += increment) {
            options.push(price);
        }

        setBidOptions(options);
        setSelectedBid(options[0] ?? null);
    }, [roomInfo]);

    const formatNumber = (num) => num.toLocaleString();

    const handleBidSubmit = () => {
        if (!selectedBid) return;
    
        if (!window.TossPayments) {
            alert("TossPayments SDK가 로드되지 않았습니다.");
            return;
        }
    
        const tossPayments = window.TossPayments("test_ck_ORzdMaqN3w2RZ1XBgmxM85AkYXQG");
        const orderId = new Date().getTime();
    
        const successUrl = `${serverIP.front}/auction/bid/success?orderId=${orderId}&bid=${selectedBid}&roomId=${roomInfo.roomId}`;
        const failUrl = `${serverIP.front}/auction/bid/fail`;
    
        tossPayments
            .requestPayment("카드", {
                amount: roomInfo.deposit,
                orderId: orderId.toString(),
                orderName: `경매 보증금 - ${roomInfo.title || "상품"}`,
                customerName: user.user.username,
                successUrl,
                failUrl
            })
            .catch((error) => {
                console.error("❌ 결제 실패 또는 취소됨:", error);
            });
    };

    return (
        <div style={{ paddingTop: '200px' }}>
            <div style={{ border: '1px solid gray', padding: '0 20px', margin:'auto',maxWidth:'400px' }}>
                <h3>경매 이용 약관</h3>
                <p style={{whiteSpace:'pre-wrap'}}>{`* 최고 응찰금액이 동일한 경우 먼저 접수된 응찰이 우선합니다.
ㅁ 본인은 홈페이지를 통하여 진행방식 및 유의사항을 읽고 이해하였습니다.
ㅁ 응찰은 상품의 실물 또는 컨디션을 확인하였음을 전제로 합니다.
ㅁ 응찰은 취소할 수 없습니다.
ㅁ 접수된 응찰은 회사의 승인으로 효력이 발생합니다.\n     회사는 내규에 따라 응찰을 거부할 수 있습니다.
ㅁ 낙찰자는 지정된 기일에 낙찰금액을 납부하여야 합니다. 
ㅁ 낙찰 취소 시 낙찰가의 30%에 해당하는 금액을 낙찰철회비(위약금)으로 납부하여야 합니다.`}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
                보증금: {formatNumber(roomInfo.deposit)} 원
                <br/><br/>
                <select
                    value={selectedBid || ''}
                    onChange={(e) => setSelectedBid(parseInt(e.target.value))}
                    style={{ width: '200px', height: '40px', fontSize: '16px', marginBottom: '20px' }}
                >
                    {bidOptions.map((price, idx) => (
                        <option key={idx} value={price}>
                            {formatNumber(price)} 원
                        </option>
                    ))}
                </select>
                <br />
                <button onClick={handleBidSubmit} style={{
                    width: '200px',
                    height: '45px',
                    backgroundColor: '#8CC7A5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    입찰하기
                </button>
            </div>
        </div>
    );
}

export default AuctionBid;
