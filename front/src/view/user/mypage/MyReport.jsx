import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function MyReport() {
  const loc = useLocation();
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  const modal = useSelector((state) => state.modal);
  const dispatch = useDispatch();

  const [totalPage, setTotalPage] = useState(1);
  const [pageNumber, setPageNumber] = useState([]);

  const [report, setReport] = useState([]);

  const [nowPage, setNowPage] = useState(1);

  const [totalRecord, setTotalRecord] = useState(1);

  useEffect(() => {
    getBoardList();
    const det = document.querySelectorAll(".report-detail");
    if (det) det.forEach((det) => (det.style.display = "none"));
  }, [nowPage]);

  useEffect(() => {
    getBoardList();
  }, [loc]);

  const getBoardList = () => {
    if (user)
      axios
        .get(`${serverIP.ip}/mypage/reportList?nowPage=${nowPage}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          const newPageNumbers = [];
          for (
            let p = res.data.pvo.startPageNum;
            p < res.data.pvo.startPageNum + res.data.pvo.onePageCount;
            p++
          ) {
            if (p <= res.data.pvo.totalPage) {
              newPageNumbers.push(p);
            }
          }
          setPageNumber(newPageNumbers);
          setTotalPage(res.data.pvo.totalPage);
          setReport(res.data.reportList);
          setNowPage(res.data.pvo.nowPage);
          setTotalRecord(res.data.pvo.totalRecord);
        })
        .catch((err) => console.log(err));
  };

  const readReport = (id) => {
    const det = document.getElementById("report-detail-" + id);
    if (det)
      det.style.display = det.style.display === "inline-block" ? "none" : "inline-block";
  };

  const getStateClass = (state) => {
    switch (state) {
      case "READABLE":
        return "report-state-readable"; // 처리 전
      case "PROCESSING":
        return "report-state-processing"; // 처리 중
      case "COMPLETE":
        return "report-state-completed"; // 처리 완료
      default:
        return "";
    }
  };

  return (
    <div className="report-box">
      <ul className="mypage-report-list" style={{ fontWeight: "bold", borderBottom: "1px solid #ddd" }}>
        <li>번호</li>
        <li>내용</li>
        <li>피신고자</li>
        <li>신고일</li>
        <li>처리일</li>
        <li>상태</li>
      </ul>
      {report.length === 0 ? (
        <div className="no-list">검색 결과가 없습니다.</div>
      ) : (
        report.map((item) => {
          return (
            <>
              <ul className="mypage-report-list" key={item.id}>
                <li>{item.id}</li>
                <li onClick={() => readReport(item.id)} style={{ cursor: "pointer" }}>
                  {item.comment}
                </li>
                <li className="message-who" id={`mgx-${item.reportUser.id}`} style={{ cursor: "pointer" }}>
                  {item.reportUser.username}
                </li>
                <li>{item.createDate}</li>
                <li>{item.endDate}</li>
                <li>
                  <span className={`report-state ${getStateClass(item.state)}`}>
                    {item.state === "READABLE"
                      ? "처리 전"
                      : item.state === "PROCESSING"
                      ? "처리 중"
                      : "처리 완료"}
                  </span>
                </li>
              </ul>
              <div className="report-detail" id={"report-detail-" + item.id} style={{ display: "none" }}>
                <div className="report-date">
                  신고일: {item.createDate} &nbsp;&nbsp;&nbsp; 처리일:{item.endDate}
                </div>
                <div className="report-date">사유: {item.reportType}</div>
                <div className="report-date">처리 구분: {item.reportResult}</div>
                <div className="report-comment">처리 내용: </div>
                <div className="cm-rc">{item.reportText}</div>
              </div>
            </>
          );
        })
      )}
      <ul className="admin-paging">
        {nowPage > 1 && (
          <a className="page-prenext" onClick={() => setNowPage(nowPage - 1)}>
            <li className="page-num">◀</li>
          </a>
        )}
        {pageNumber.map((pg) => {
          const activeStyle = nowPage === pg ? "page-num active" : "page-num";
          return (
            <a className="page-num" onClick={() => setNowPage(pg)} key={pg}>
              <li className={activeStyle}>{pg}</li>
            </a>
          );
        })}
        {nowPage < totalPage && (
          <a className="page-prenext" onClick={() => setNowPage(nowPage + 1)}>
            <li className="page-num">▶</li>
          </a>
        )}
      </ul>
    </div>
  );
}

export default MyReport;
