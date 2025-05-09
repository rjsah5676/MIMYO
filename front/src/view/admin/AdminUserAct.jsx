import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";
import axios from "axios";
import "../../css/view/adminmember.css";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function AdminUserAct() {
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [productData, setProductData] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [inquiryData, setInquiryData] = useState([]);

  useEffect(() => {
    if (user && serverIP?.ip) {
      const headers = { Authorization: `Bearer ${user.token}` };

      axios.get(`${serverIP.ip}/stats/products`, { headers })
        .then(res => setProductData(res.data))
        .catch(err => console.error("상품 등록 오류:", err));

      axios.get(`${serverIP.ip}/stats/reviews`, { headers })
        .then(res => setReviewData(res.data))
        .catch(err => console.error("리뷰 등록 오류:", err));

      axios.get(`${serverIP.ip}/stats/inquiries/daily`, { headers })
        .then(res => setInquiryData(res.data))
        .catch(err => console.error("문의 등록 오류:", err));
    }
  }, [user, serverIP]);

  const filterByYearMonth = (data) =>
    data.filter(item => {
      const [year, month] = item.date.split("-").map(Number);
      return year === Number(selectedYear) && month === Number(selectedMonth);
    });

  const filteredProduct = filterByYearMonth(productData);
  const filteredReview = filterByYearMonth(reviewData);
  const filteredInquiry = filterByYearMonth(inquiryData);

  const allDates = Array.from(new Set([
    ...filteredProduct.map(d => d.date),
    ...filteredReview.map(d => d.date),
    ...filteredInquiry.map(d => d.date)
  ])).sort();

  const chartData = {
    labels: allDates,
    datasets: [
      {
        label: "상품 등록 수",
        data: allDates.map(date => productData.find(d => d.date === date)?.count || 0),
        borderColor: "#10b981",
        backgroundColor: "#10b98180",
        tension: 0.4,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "리뷰 등록 수",
        data: allDates.map(date => reviewData.find(d => d.date === date)?.count || 0),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f680",
        tension: 0.4,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "문의 작성 수",
        data: allDates.map(date => inquiryData.find(d => d.date === date)?.count || 0),
        borderColor: "#f97316",
        backgroundColor: "#f9731680",
        tension: 0.4,
        pointRadius: 4,
        fill: false,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        precision: 0,
      },
    },
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="adminmember-page">
      <div className="adminmember-container">
        <div className="adminmember-filter">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}월
              </option>
            ))}
          </select>
        </div>

        <div className="adminmember-card">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="adminmember-card">
          <h2 className="adminmember-section-title">일자별 수치</h2>
          <div className="table-wrapper">
            <table className="adminmember-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>상품 등록 수</th>
                  <th>리뷰 등록 수</th>
                  <th>문의 수</th>
                </tr>
              </thead>
              <tbody>
                {allDates.map(date => {
                  const productCount = filteredProduct.find(d => d.date === date)?.count || 0;
                  const reviewCount = filteredReview.find(d => d.date === date)?.count || 0;
                  const inquiryCount = filteredInquiry.find(d => d.date === date)?.count || 0;
                  return (
                    <tr key={date}>
                      <td>{date}</td>
                      <td>{productCount}</td>
                      <td>{reviewCount}</td>
                      <td>{inquiryCount}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>합계</strong></td>
                  <td>{filteredProduct.reduce((acc, cur) => acc + cur.count, 0)}</td>
                  <td>{filteredReview.reduce((acc, cur) => acc + cur.count, 0)}</td>
                  <td>{filteredInquiry.reduce((acc, cur) => acc + cur.count, 0)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserAct;
