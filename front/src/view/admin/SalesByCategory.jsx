import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "../../css/view/salesbycategory.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie, Bar } from "react-chartjs-2";
import axios from "axios";

// Chart.js 요소 등록
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

function SalesByCategory() {
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  const [data, setData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [targetData, setTargetData] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`${serverIP.ip}/stats/category`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then(res => setData(res.data));

      axios.get(`${serverIP.ip}/stats/event`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then(res => setEventData(res.data));

      axios.get(`${serverIP.ip}/stats/target`, {
        headers: { Authorization: `Bearer ${user.token}` },
      }).then(res => setTargetData(res.data));
    }
  }, []);

  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: "right",
      },
      datalabels: {
        display: false, 
      },
    },
    maintainAspectRatio: false,
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: false,
      },
    },
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true },
    },
  };

  const quantityData = {
    labels: data.map((item) => item.category),
    datasets: [{
      label: "판매 수량",
      data: data.map((item) => item.totalQuantity),
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#66BB6A", "#BA68C8", "#FFA726", "#8D6E63", "#42A5F5", "#D4E157", "#26C6DA"],
    }],
  };

  const revenueData = {
    labels: data.map((item) => item.category),
    datasets: [{
      label: "판매 매출",
      data: data.map((item) => item.totalRevenue),
      backgroundColor: "#42A5F5",
    }],
  };

  return (
    <div className="sales-section">
      <h2 className="section-title">판매 수량</h2>
      <div className="card-layout">
        <div className="chart-area">
          <Pie data={quantityData} options={pieOptions} height={300} />
        </div>
        <div className="table-area">
          <table className="sales-table">
            <thead>
              <tr><th>순위</th><th>카테고리</th><th>판매 수량</th></tr>
            </thead>
            <tbody>
              {[...data].sort((a, b) => b.totalQuantity - a.totalQuantity).map((item, index) => (
                <tr key={item.category}>
                  <td>{index + 1}</td>
                  <td>{item.category}</td>
                  <td>{item.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="section-title">판매 매출</h2>
      <div className="card-layout">
        <div className="chart-area">
          <Bar data={revenueData} options={barOptions} height={300} />
        </div>
        <div className="table-area">
          <table className="sales-table">
            <thead>
              <tr><th>순위</th><th>카테고리</th><th>판매 매출</th></tr>
            </thead>
            <tbody>
              {[...data].sort((a, b) => b.totalRevenue - a.totalRevenue).map((item, index) => (
                <tr key={item.category}>
                  <td>{index + 1}</td>
                  <td>{item.category}</td>
                  <td>{item.totalRevenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="section-title">이벤트별 판매 수량</h2>
      <div className="card-layout">
        <div className="chart-area">
          <Pie data={{
            labels: eventData.map(e => e.category),
            datasets: [{
              label: "판매 수량",
              data: eventData.map(e => e.totalQuantity),
              backgroundColor: ["#FF8A65", "#BA68C8", "#4FC3F7", "#AED581", "#FFD54F"],
            }]
          }} options={pieOptions} height={300} />
        </div>
        <div className="table-area">
          <table className="sales-table">
            <thead>
              <tr><th>순위</th><th>이벤트 카테고리</th><th>판매 수량</th></tr>
            </thead>
            <tbody>
              {[...eventData].sort((a, b) => b.totalQuantity - a.totalQuantity).map((item, index) => (
                <tr key={item.category}>
                  <td>{index + 1}</td>
                  <td>{item.category}</td>
                  <td>{item.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="section-title">대상별 판매 수량</h2>
      <div className="card-layout">
        <div className="chart-area">
          <Pie data={{
            labels: targetData.map(t => t.category),
            datasets: [{
              label: "판매 수량",
              data: targetData.map(t => t.totalQuantity),
              backgroundColor: ["#7986CB", "#4DB6AC", "#FFB74D", "#E57373", "#90A4AE"],
            }]
          }} options={pieOptions} height={300} />
        </div>
        <div className="table-area">
          <table className="sales-table">
            <thead>
              <tr><th>순위</th><th>대상 카테고리</th><th>판매 수량</th></tr>
            </thead>
            <tbody>
              {[...targetData].sort((a, b) => b.totalQuantity - a.totalQuantity).map((item, index) => (
                <tr key={item.category}>
                  <td>{index + 1}</td>
                  <td>{item.category}</td>
                  <td>{item.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SalesByCategory;
