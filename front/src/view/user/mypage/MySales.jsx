import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

function MySales() {
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);

  const [salesSummary, setSalesSummary] = useState({
    totalSalesAmount: 0,
    totalQuantity: 0,
    refundOrCancelCount: 0,
  });
  const [dailyStats, setDailyStats] = useState([]);
  const [dailyStatsFullYear, setDailyStatsFullYear] = useState([]); // ✅ 연도 전체용
  const [productCount, setProductCount] = useState(0);
  const [reviewStats, setReviewStats] = useState({ reviewCount: 0, averageRate: 0 });

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  useEffect(() => {
    if (!user) return;

    // ✅ 월 필터 포함된 범위 (일별 차트 등)
    let start, end;
    if (month === "") {
      start = `${year}-01-01 00:00:00`;
      end = `${year}-12-31 23:59:59`;
    } else {
      const lastDay = new Date(year, month, 0).getDate();
      start = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
      end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;
    }

    axios.get(`${serverIP.ip}/mystats/sell/${user.user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
      params: { start, end }
    }).then(res => setSalesSummary(res.data))
      .catch(() => setSalesSummary({ totalSalesAmount: 0, totalQuantity: 0, refundOrCancelCount: 0 }));

    axios.get(`${serverIP.ip}/mystats/daily/${user.user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
      params: { start, end }
    }).then(res => setDailyStats(res.data))
      .catch(() => setDailyStats([]));

    axios.get(`${serverIP.ip}/mystats/productcount/${user.user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
      params: { start, end }
    }).then(res => setProductCount(res.data))
      .catch(() => setProductCount(0));

    axios.get(`${serverIP.ip}/mystats/review/${user.user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
      params: { start, end }
    }).then(res => setReviewStats(res.data))
      .catch(() => setReviewStats({ reviewCount: 0, averageRate: 0 }));

  }, [user, year, month]);

  // ✅ 연도 전체용 데이터 따로 가져오기 (month 무시)
  useEffect(() => {
    if (!user) return;

    const fullYearStart = `${year}-01-01 00:00:00`;
    const fullYearEnd = `${year}-12-31 23:59:59`;

    axios.get(`${serverIP.ip}/mystats/daily/${user.user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
      params: { start: fullYearStart, end: fullYearEnd }
    }).then(res => setDailyStatsFullYear(res.data))
      .catch(() => setDailyStatsFullYear([]));
  }, [user, year]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const dailyChartData = {
    labels: dailyStats.map(d => d.date),
    datasets: [
      {
        label: '일별 판매 매출',
        data: dailyStats.map(d => d.totalAmount),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.3,
      }
    ],
  };
  const dailyChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: false },
      datalabels: {
        display: false
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  // ✅ 월별 차트는 연도 전체 데이터를 기준으로 계산
  const monthlyAmounts = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const sum = dailyStatsFullYear
      .filter(d => new Date(d.date).getMonth() + 1 === monthNum)
      .reduce((acc, d) => acc + d.totalAmount, 0);
    return sum;
  });

  const monthlyChartData = {
    labels: Array.from({ length: 12 }, (_, i) => `${year}년 ${i + 1}월`),
    datasets: [
      {
        label: '월별 판매 매출',
        data: monthlyAmounts,
        backgroundColor: '#FF9F40',
      }
    ]
  };

  return (
    <div className="my-order-container">
      <div className="filter-selects">
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {yearOptions.map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">전체</option>
          {monthOptions.map(m => <option key={m} value={m}>{m}월</option>)}
        </select>
      </div>

      <div className="activity-stats">
        <div className="activity-row">
          <div className="activity-stat-box">
            <h4>등록한 상품 수</h4>
            <p>{productCount}개</p>
          </div>
          <div className="activity-stat-box">
            <h4>총 판매 매출</h4>
            <p>{(salesSummary.totalSalesAmount || 0).toLocaleString()}원</p>
          </div>
          <div className="activity-stat-box">
            <h4>총 판매 수량</h4>
            <p>{salesSummary.totalQuantity || 0}개</p>
          </div>
        </div>
        <div className="activity-row">
          <div className="activity-stat-box">
            <h4>취소/환불 건수</h4>
            <p>{salesSummary.refundOrCancelCount}건</p>
          </div>
          <div className="activity-stat-box">
            <h4>리뷰 수</h4>
            <p>{reviewStats.reviewCount}개</p>
          </div>
          <div className="activity-stat-box">
            <h4>평균 평점</h4>
            <p>{reviewStats.averageRate > 0 ? reviewStats.averageRate.toFixed(1) + "점" : "0점"}</p>
          </div>
        </div>
      </div>

      <div className="chart-section" style={{ marginTop: '30px' }}>
        <h3>📈 일별 판매 매출</h3>
        <Line data={dailyChartData} options={dailyChartOptions} />
      </div>

      <div className="chart-section" style={{ marginTop: '30px' }}>
        <h3>📊 월별 판매 매출</h3>
        <Bar data={monthlyChartData} options={{ responsive: true }} />
      </div>
    </div>
  );
}

export default MySales;
