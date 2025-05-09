# 🧵 핸드메이드 쇼핑몰 - [ MIMYO ]

> 정성 가득한 핸드메이드 상품을 거래하는 커머스 플랫폼

![main page preview](./preview.png) <!-- 스크린샷 경로는 알아서 수정 -->

---

## 🛠️ 주요 기술 스택

### 📌 Frontend
- React 22 / Redux Toolkit
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
 └── src/main/java/com/ict/serv
     ├── config       # 설정 파일 (Swagger, CORS, WebSocket 등)
     ├── context      # 사용자 인증 컨텍스트
     ├── controller   # REST API 컨트롤러
     ├── dto          # 요청/응답 DTO
     ├── entity       # JPA 엔티티
     ├── repository   # DB 접근 레이어
     ├── schedule     # 스케줄러 (예: 배송 자동 완료)
     ├── security     # JWT 및 OAuth2 보안 처리
     ├── service      # 비즈니스 로직
     ├── util         # 공용 유틸 클래스
     └── ServApplication.java  # 메인 실행 파일
 └── uploads          # 이미지 업로드 저장소
 └── resources         # 설정 파일 (application.yml 등)

📁 frontend
 └── src
     ├── css          # 공통 CSS
     ├── effect       # 애니메이션 / 인터랙션 효과
     ├── img          # 이미지 리소스
     ├── interact     # 공통 컴포넌트/인터랙션 핸들링
     ├── modal        # 팝업/모달 관련 UI
     ├── store        # Redux 상태 관리
     └── view         # 실제 페이지 구성
         ├── admin              # 관리자 페이지
         ├── auction            # 경매 관련 페이지
         ├── customerservice    # 고객센터, 문의 등
         ├── event              # 이벤트 페이지
         ├── product            # 상품 상세, 목록 등
         ├── recommend          # 추천 시스템
         ├── shipping           # 배송 조회/관리
         ├── submenu            # 서브 메뉴, 네비게이션 등
         └── user               # 마이페이지, 회원 관련
     ├── Header.jsx / Footer.jsx / Main.jsx 등 공통 레이아웃

📁 public               # 정적 파일 (favicon, index.html 등)
