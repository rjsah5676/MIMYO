// src/pages/AuctionBidSuccess.jsx
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

function AuctionBidSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const stompClientRef = useRef(null);
    const serverIP = useSelector(state => state.serverIP);
    const user = useSelector(state => state.auth.user);

    const bid = parseInt(searchParams.get("bid"));
    const roomId = searchParams.get("roomId");

    useEffect(() => {
        const socket = new SockJS(`${serverIP.ip}/ws`);
        const stompClient = Stomp.over(socket);

        stompClient.connect({ Authorization: `Bearer ${user.token}` }, () => {
            stompClientRef.current = stompClient;

            stompClient.send(
                `/app/auction/${roomId}`,
                {},
                JSON.stringify({
                    urd: user.user,
                    price: bid,
                    roomId: roomId
                })
            );

            alert(`${bid.toLocaleString()}원에 입찰 완료!`);
            navigate(`/auction/room/${roomId}`); // 혹은 AuctionRoom 목록 등으로 이동
        });

        return () => {
            if (stompClientRef.current) stompClientRef.current.disconnect();
        };
    }, [bid, roomId]);

    return (
        <div style={{ paddingTop: '200px', textAlign: 'center' }}>
            입찰 처리 중입니다... 잠시만 기다려주세요.
        </div>
    );
}

export default AuctionBidSuccess;