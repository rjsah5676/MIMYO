import React, { useEffect, useState } from "react";
import '../../css/view/faq.css';
import axios from "axios";
import { useSelector } from "react-redux";

function FAQ() {
  const user = useSelector((state) => state.auth.user);
const serverIP = useSelector((state) => state.serverIP);
const [faqList, setFaqList] = useState([]);
const [openIndex, setOpenIndex] = useState(null);
const [selectedCategory, setSelectedCategory] = useState("account");
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [searchKeyword, setSearchKeyword] = useState("");
const [newFAQ, setNewFAQ] = useState({
question: "",
answer: "",
category: "account",
});
const categories = [
  { id: "account", label: "계정", icon: "👤" },
  { id: "delivery", label: "배송", icon: "🚚" },
  { id: "payment", label: "결제", icon: "🧾" },
  { id: "refund", label: "환불/교환", icon: "💸" },
  { id: "coupon", label: "쿠폰/이벤트", icon: "🎟️" },
];
useEffect(() => {
    if (selectedCategory) {
      if(user)
      axios.get(`${serverIP.ip}/faq/category/${selectedCategory.toUpperCase()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })
      .then(response => {
        if (Array.isArray(response.data)) {
          setFaqList(response.data);
        } else {
          setFaqList([]);
        }
      })
      .catch(error => {
        console.error("FAQ 불러오기 실패:", error);
      });
    }else{
      setFaqList([]);
    }
    setOpenIndex(null);
  }, [selectedCategory,serverIP.ip, user.token]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const handleAddFAQClick = () => {
    setIsAddModalOpen(true);
    setNewFAQ({ question: "", answer: "", category: "account" });
  };
    const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };
    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFAQ({ ...newFAQ, [name]: value });
  };
  const handleAddFAQSubmit = () => {
    if(user)
    axios.post(`${serverIP.ip}/faq/insertFaq`,{
      title: newFAQ.question,
      content: newFAQ.answer,
      category: newFAQ.category.toUpperCase()
      
    },{
    headers: {
    Authorization: `Bearer ${user.token}`,
    },
    })
    .then((response) => {
    console.log("FAQ 등록 성공:", response.data);

    if (selectedCategory === newFAQ.category) {
      if(user)
        axios.get(`${serverIP.ip}/faq/category/${selectedCategory.toUpperCase()}`, {
        headers: {
        Authorization:`Bearer ${user.token}`
      }
    })
    .then(response => {
        if (Array.isArray(response.data)) {
        setFaqList(response.data);
        } else {
        setFaqList([]);
      }
    })
    .catch(error => {
        console.error("FAQ 불러오기 실패:", error);
      });
     }
        setIsAddModalOpen(false);
      })
        .catch((error) => {
        console.error("FAQ 등록 실패:", error);
      });
     
    };
    const handleSearchInputChange = (e) => {
      setSearchKeyword(e.target.value);
    };
  
    const handleSearchSubmit = () => {
      fetchFaqsByKeyword(searchKeyword);
    };
  
    const fetchFaqsByKeyword = async (keyword) => {
      if (!user) return;
      setSelectedCategory(null);
      setOpenIndex(null);
      setTimeout(async () => {
        try {
          const response = await axios.get(
            `${serverIP.ip}/faq/search?keyword=${keyword}`,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          setFaqList(response.data);
        } catch (error) {
          console.error("FAQ 검색 실패:", error);
          setFaqList([]);
        }
      }, 0);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleSearchSubmit();
      }
    };
  return (
    <div className="faq-container">
      <div className="faq-header">
        <div className="faq-search-bar">
        <input
          type="text"
          placeholder="질문을 검색해주세요."
          className="faq-search-input"
          value={searchKeyword}
          onChange={handleSearchInputChange}
          onKeyDown={handleKeyDown}
        />
        <button className="faq-search-btn" onClick={handleSearchSubmit}> <svg style={{ paddingTop: '3px' }} className='search-icon' width="27" height="27" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="7" stroke="black" strokeWidth="2" />
                            <line x1="15" y1="15" x2="22" y2="22" stroke="black" strokeWidth="2" strokeLinecap="round" />
                        </svg></button>
      </div>
      {user && user.user.authority=='ROLE_ADMIN' && (
      <button className="faq-add-btn" onClick={handleAddFAQClick}>
      📝 FAQ등록
      </button>
      )}
      </div>
      <div className="faq-category-list">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`faq-category-item ${
              selectedCategory === category.id ? "active" : ""
            }`}
             onClick={() => handleCategoryClick(category.id)}
          >
            <div className="faq-category-icon">{category.icon}</div>
            <div className="faq-category-label">{category.label}</div>
          </div>
        ))}
      </div>
 <div className="faq-list">
  {faqList.length > 0 ? (
        faqList.map((faq, index) => (
          <div key={faq.id} className="faq-item">
            <div
              className="faq-question"
              onClick={() => toggleAccordion(index)}>
              <div className="faq-question-content">
                {faq.title}
              </div>
              <span className="accordion-icon">{openIndex === index ? "▲" : "▼"}</span>
            </div>
            {openIndex === index && (
              <div className="faq-answer"> {faq.content}</div>
            )}
          </div>
        ))
      ) : (
        selectedCategory && <div className="faq-empty">해당 카테고리의 FAQ가 없습니다.</div>
      )}
      </div>
    {isAddModalOpen && (
    <div className={`faq-modal-overlay ${isAddModalOpen ? 'open' : ''}`}>
      <div className="faq-modal">
        <h2>FAQ 등록</h2>
        <div className="faq-modal-input">
        <div className="faq-modal-input">
          <label htmlFor="category">카테고리</label>
          <select
            id="category"
            name="category"
            value={newFAQ.category}
            onChange={handleInputChange}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
          <label htmlFor="question">질문</label>
          <input
            type="text"
            id="question"
            name="question"
            value={newFAQ.question}
            onChange={handleInputChange}
          />
        </div>
        <div className="faq-modal-input">
          <label htmlFor="answer">답변</label>
          <textarea
            id="answer"
            name="answer"
            value={newFAQ.answer}
            onChange={handleInputChange}
          />
        </div>
        <div className="faq-modal-buttons">
          <button onClick={handleAddFAQSubmit}>등록</button>
          <button onClick={handleCloseAddModal}>취소</button>
        </div>
      </div>
    </div>
  )}
</div>
  );
}
export default FAQ;
