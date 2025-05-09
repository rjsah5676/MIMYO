# 🧵 핸드메이드 쇼핑몰 - [Project Name]

> 정성 가득한 핸드메이드 상품을 거래하는 커머스 플랫폼

![main page preview](./preview.png) <!-- 스크린샷 경로는 알아서 수정 -->

---

## 🛠️ 주요 기술 스택

### 📌 Frontend
- React 18 / Redux Toolkit
- Styled Components / Tailwind CSS
- Chart.js (통계 시각화)
- Axios / React Router
- WebSocket (실시간 채팅, 경매)

### 📌 Backend
- Spring Boot / Spring Security / JWT 인증
- JPA / Hibernate
- MySQL / QueryDSL / Native SQL
- AWS / Naver Cloud / Ubuntu / Certbot (HTTPS)
- WebSocket / STOMP (실시간 경매, 채팅)

---

## 🎯 핵심 기능

### 🛒 쇼핑 기능
- 일반 상품 & 경매 상품 분리
- 실시간 경매 참여, 자동 입찰 마감
- 찜 / 장바구니 / 쿠폰 할인 / 리뷰 작성

### 💳 주문 및 결제
- Toss Payments 연동
- 일반 결제 및 경매 낙찰 결제 처리
- 재고 동시성 처리 (판매중지 자동 전환)

### 👩‍🎨 판매자 기능
- 상품 등록/수정/삭제
- 월별 정산, 판매 통계 대시보드
- 실시간 배송 관리 (1분 후 자동 배송 완료 처리)

### 📊 관리자/유저 기능
- 마이페이지 (구매 내역, 포인트 적립, 문의 내역)
- 유저 활동 통계 (문의 수, 구매 금액 등)
- 이벤트 페이지 (쿠폰/홍보 링크 전환)

---

## 📦 폴더 구조 예시

```bash
📁 backend
 ├── src/main/java/com/example
 │   ├── auth       # JWT, OAuth2 로그인
 │   ├── product    # 상품, 경매 상품 관리
 │   ├── order      # 주문 및 정산
 │   ├── chat       # 실시간 채팅
 │   └── event      # 이벤트 게시판
📁 frontend
 ├── src
 │   ├── components # UI 컴포넌트
 │   ├── pages      # 라우팅 페이지
 │   ├── store      # Redux 상태 관리
 │   └── hooks      # 커스텀 훅
