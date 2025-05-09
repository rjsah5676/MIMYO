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

function AdminMember() {
  const [visitData, setVisitData] = useState([]);
  const [registerData, setRegisterData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user && serverIP?.ip) {
      const headers = { Authorization: `Bearer ${user.token}` };

      axios.get(`${serverIP.ip}/stats/joins`, { headers })
        .then(res => setVisitData(res.data))
        .catch(err => console.error("방문자 오류:", err));

      axios.get(`${serverIP.ip}/stats/registers`, { headers })
        .then(res => setRegisterData(res.data))
        .catch(err => console.error("가입자 오류:", err));
    }
  }, [user, serverIP]);

  const filterByYearMonth = (data) =>
    data.filter(item => {
      const [year, month] = item.date.split("-").map(Number);
      return year === Number(selectedYear) && month === Number(selectedMonth);
    });

  const filteredVisit = filterByYearMonth(visitData);
  const filteredRegister = filterByYearMonth(registerData);

  const allDates = Array.from(new Set([
    ...filteredVisit.map(d => d.date),
    ...filteredRegister.map(d => d.date),
  ])).sort();

  const chartData = {
    labels: allDates,
    datasets: [
      {
        label: "방문자 수",
        data: allDates.map(date =>
          filteredVisit.find(d => d.date === date)?.count || 0
        ),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f680",
        tension: 0.4,
        pointRadius: 4,
        fill: false,
      },
      {
        label: "가입자 수",
        data: allDates.map(date =>
          filteredRegister.find(d => d.date === date)?.count || 0
        ),
        borderColor: "#ef4444",
        backgroundColor: "#ef444480",
        tension: 0.4,
        pointRadius: 4,
        fill: false,
      },
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
                  <th>방문자 수</th>
                  <th>가입자 수</th>
                </tr>
              </thead>
              <tbody>
                {allDates.map(date => {
                  const visit = filteredVisit.find(d => d.date === date)?.count || 0;
                  const register = filteredRegister.find(d => d.date === date)?.count || 0;
                  return (
                    <tr key={date}>
                      <td>{date}</td>
                      <td>{visit}</td>
                      <td>{register}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>합계</strong></td>
                  <td>
                    {filteredVisit.reduce((acc, cur) => acc + cur.count, 0)}
                  </td>
                  <td>
                    {filteredRegister.reduce((acc, cur) => acc + cur.count, 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMember;
