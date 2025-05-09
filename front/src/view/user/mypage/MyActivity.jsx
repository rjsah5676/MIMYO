import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Line, Doughnut } from "react-chartjs-2";
import '../../../css/view/myactivity.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

function MyActivity() {
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  const [stats, setStats] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState('전체');

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = ['전체', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    if (user) {
      const params = {
        year: year,
        month: month === '전체' ? '' : month,
      };
      axios.get(`${serverIP.ip}/mystats/activity/${user.user.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        params: params
      })
      .then(res => {
        setStats(res.data);
      })
      .catch(err => {
        console.log("활동 통계 에러:", err);
      });
    }
  }, [year, month]);

  if (!stats) return <div>로딩 중...</div>;

  return (
    <div className="activity-container">
      <div className="activity-filter">
        <select value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}년</option>)}
        </select>
        <select value={month} onChange={e => setMonth(e.target.value)}>
          {months.map(m => <option key={m} value={m}>{m === '전체' ? '전체' : `${m}월`}</option>)}
        </select>
      </div>

      <div className="activity-stats">
      <div className="activity-row">
        <div className="activity-stat-box">
          <h4>작성한 리뷰 수</h4>
          <p>{stats.reviewCount}건</p>
        </div>
        <div className="activity-stat-box">
          <h4>작성한 문의 수</h4>
          <p>{stats.inquiryCount}건</p>
        </div>
        <div className="activity-stat-box">
          <h4>찜 목록 상품 수</h4>
          <p>{stats.wishlistCount}개</p>
        </div>
      </div>

      <div className="activity-row">
        <div className="activity-stat-box">
          <h4>팔로워 수</h4>
          <p>{stats.followerCount}명</p>
        </div>
        <div className="activity-stat-box">
          <h4>팔로잉 수</h4>
          <p>{stats.followingCount}명</p>
        </div>
        <div className="activity-stat-box">
          <h4>접속 횟수</h4>
          <p>{stats.monthlyAccessCount}회</p>
        </div>
      </div>
      </div>
      <div className="activity-section chart-center">
  <h3>카테고리별 검색 & 검색어 </h3>
  <div className="triple-container">
    <div className="doughnut-chart">
      <Doughnut
        data={{
          labels: Object.keys(stats.categorySearchRate).slice(0, 5),
          datasets: [{
            data: Object.values(stats.categorySearchRate).slice(0, 5),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40"
            ],
          }]}
        }
        options={{ responsive: true }}
      />
    </div>

    <div className="list-section">
      <h4>Top 5 카테고리</h4>
      <ul className="category-list">
        {Object.entries(stats.categorySearchRate)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([category, count], idx) => (
            <li key={category}>
              {idx + 1}. {category} ({count}회)
            </li>
          ))}
      </ul>
    </div>

    <div className="list-section">
      <h4>Top 5 검색어</h4>
      <ul className="keyword-list">
        {stats.topSearchWords
          .slice(0, 5)
          .map((word, idx) => (
            <li key={word.searchWord}>
              {idx + 1}. {word.searchWord} ({word.count}회)
            </li>
          ))}
      </ul>
    </div>
  </div>
</div>
<div className="activity-section">
        <h3>누적포인트 적립 차트</h3>
        <Line
          data={{
            labels: stats.userPointHistory.map(p => p.lastSpinDate),
            datasets: [{
              label: "포인트",
              data: stats.userPointHistory.reduce((acc, curr) => {
                const last = acc.length > 0 ? acc[acc.length - 1] : 0;
                acc.push(last + curr.point);
                return acc;
              }, []),
              borderColor: "#36A2EB",
              fill: false,
              tension: 0.3,
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true },
              datalabels: { display: false }, 
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>
</div>
  );
}

export default MyActivity;
