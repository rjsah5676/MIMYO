import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import '../../../css/view/myorder.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);
const productOptions = {
    "디저트": ["베이커리", "떡", "초콜릿","사탕","전통간식", "음료"],
    "수제먹거리": ["건강식품", "간편식", "가공식품", "반찬", "소스/장류"],
    "농축수산물": ["과일/채소", "잡곡/견과", "정육/계란", "수산물"],
    "의류": ["홈웨어/언더웨어", "티셔츠/니트","셔츠","바지/스커트", "아우터"],
    "패션잡화": ["신발", "모자", "가방", "지갑","파우치","악세사리"],
    "홈인테리어": ["가구", "꽃", "캔들", "홈데코"],
    "주방/생활": ["주방용품", "욕실"],
    "케이스": ["폰케이스", "노트북케이스"],
    "문구": ["인형", "장난감", "다이어리", "노트", "필기도구","키링"],
    "일러스트/사진": ["드로잉", "사진"],
    "화장품": ["네일", "메이크업", "향수"],
    "기타": ["기타"]
};

function convertToMajorCategories(rawStats) {
  const result = {};
  for (const [sub, amount] of Object.entries(rawStats)) {
    let found = false;
    for (const [major, subs] of Object.entries(productOptions)) {
      if (subs.includes(sub)) {
        result[major] = (result[major] || 0) + amount;
        found = true;
        break;
      }
    }
    if (!found) {
      result["기타"] = (result["기타"] || 0) + amount;
    }
  }
  return result;
}

function MyOrder() {
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(String(today.getMonth() + 1)); // 문자열로 초기화
  const [filteredStats, setFilteredStats] = useState([]);
  const [yearlyStats, setYearlyStats] = useState([]);
  const [auctionSummary, setAuctionSummary] = useState({ auctionOrderCount: 0, auctionTotalAmount: 0 });
  const [categoryStats, setCategoryStats] = useState({});
  const [couponStats, setCouponStats] = useState({ couponCount: 0, totalDiscount: 0 });

  useEffect(() => {
    if (user) {
      const baseParams = { year };

      // 연도만 필터링된 전체 데이터 → 월별 차트용
      axios.get(`${serverIP.ip}/mystats/purchase/${user.user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: baseParams
      }).then(res => setYearlyStats(res.data))
        .catch(err => console.log("연도별 구매통계 에러:", err));

      // 월까지 필터링된 데이터 → 라인차트, 통계
      const filteredParams = { ...baseParams };
      if (month !== "") {
        filteredParams.month = Number(month);
      }

      axios.get(`${serverIP.ip}/mystats/purchase/${user.user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: filteredParams
      }).then(res => setFilteredStats(res.data))
        .catch(err => console.log("구매통계 에러:", err));

      axios.get(`${serverIP.ip}/mystats/purchase/category/${user.user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: filteredParams
      }).then(res => {
        const converted = convertToMajorCategories(res.data);
        setCategoryStats(converted);
      }).catch(err => console.log("카테고리별 통계 에러:", err));

      axios.get(`${serverIP.ip}/mystats/purchase/coupon/${user.user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: filteredParams
      }).then(res => setCouponStats(res.data))
        .catch(err => {
          console.log("쿠폰 통계 에러:", err);
          setCouponStats({ couponCount: 0, totalDiscount: 0 });
        });
    }
  }, [user, year, month]);

  const normalOrderCount = filteredStats.reduce((sum, stat) => sum + stat.orderCount, 0);
  const normalOrderAmount = filteredStats.reduce((sum, stat) => sum + stat.totalAmount, 0);
  const totalOrderCount = normalOrderCount + (auctionSummary.auctionOrderCount || 0);
  const totalOrderAmount = normalOrderAmount + (auctionSummary.auctionTotalAmount || 0);

  const lineChartData = {
    labels: filteredStats.map((item) => `${item.year}년 ${item.month}월`),
    datasets: [
      {
        label: "구매 건수",
        data: filteredStats.map((item) => item.orderCount),
        borderColor: "#36A2EB",
        backgroundColor: "#36A2EB",
        yAxisID: "y",
      },
      {
        label: "구매 금액",
        data: filteredStats.map((item) => item.totalAmount),
        borderColor: "#FF6384",
        backgroundColor: "#FF6384",
        yAxisID: "y1",
      },
    ],
  };

  const monthlyAmounts = Array.from({ length: 12 }, (_, i) => {
    const monthStat = yearlyStats.find(item => item.month === i + 1);
    return monthStat ? monthStat.totalAmount : 0;
  });

  const barChartDataByMonth = {
    labels: Array.from({ length: 12 }, (_, i) => `${year}년 ${i + 1}월`),
    datasets: [
      {
        label: "월별 구매 금액",
        data: monthlyAmounts,
        backgroundColor: "#FF9F40",
      },
    ],
  };

  const categoryLabels = Object.keys(categoryStats);
  const categoryValues = Object.values(categoryStats);

  const barChartData = {
    labels: categoryLabels,
    datasets: [
      {
        label: "카테고리별 구매 금액",
        data: categoryValues,
        backgroundColor: "#4BC0C0",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        type: "linear",
        position: "left",
        title: { display: true, text: "구매 건수" },
      },
      y1: {
        type: "linear",
        position: "right",
        title: { display: true, text: "구매 금액" },
        grid: { drawOnChartArea: false },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const yearOptions = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="my-order-container">
      <div className="filter-selects">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {yearOptions.map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">전체</option>
          {monthOptions.map(m => (
            <option key={m} value={String(m)}>{m}월</option>
          ))}
        </select>
      </div>

      <div className="activity-stats">
        <div className="activity-row purchases">
          <div className="activity-stat-box">
            <h4>총 주문 건수</h4>
            <p>{totalOrderCount}건</p>
          </div>
          <div className="activity-stat-box">
            <h4>총 주문 금액</h4>
            <p>{totalOrderAmount.toLocaleString()}원</p>
          </div>
          <div className="activity-stat-box">
            <h4>사용한 쿠폰 수</h4>
            <p>{couponStats.couponCount}개</p>
          </div>
          <div className="activity-stat-box">
            <h4>쿠폰 할인 총액</h4>
            <p>{(couponStats.totalDiscount || 0).toLocaleString()}원</p>
          </div>
        </div>
      </div>

      <h3>월별 주문 금액</h3>
      <div className="chart-section">
        <div className="chart-box">
          <Bar data={barChartDataByMonth} options={{ responsive: true }} />
        </div>
      </div>

      <h3>카테고리별 주문 금액</h3>
      <div className="chart-section">
        <div className="chart-box">
          <Bar data={barChartData} options={{ responsive: true }} />
        </div>
        <div className="chart-box">
          <table>
            <thead>
              <tr>
                <th>카테고리</th>
                <th>구매 금액</th>
              </tr>
            </thead>
            <tbody>
              {categoryLabels.map((label, idx) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{categoryValues[idx].toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MyOrder;
