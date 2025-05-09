import { BrowserRouter as Router, Routes, Route, BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import axios from 'axios';

import Main from "./Main";

import '../css/floatstyle.css';

import SignupHandler from "./user/SignupHandler";
import SignupInfo from './user/SignupInfo';
import GoogleSignupHandler from './user/GoogleSignupHandler';
import ModalIndex from '../modal/ModalIndex';
import Modal2 from '../modal/Modal2';
import Message from '../interact/Message';
import MessageBox from '../interact/MessageBox';
import BasketBox from '../interact/BasketBox';
import Report from '../interact/Report';

import MyIndex from './user/mypage/MyIndex';
import Post from '../modal/Post';
import Already from './user/Already';

import { setInteract } from '../store/interactSlice';
import { setMenuModal } from '../store/menuSlice';
import { setModal } from '../store/modalSlice';
import Interact from '../interact/Interact';

import { useSelector, useDispatch } from 'react-redux';
import AdminIndex from './admin/AdminIndex';

import ProductIndex from './product/ProductIndex';
import ProductSearch from './product/ProductSearch';

import CenterHome from './customerservice/CenterHome';
import InquiryWrite from './customerservice/InquiryWrite';
import NoticeWrite from './customerservice/NoticeWrite';
import FAQ from './customerservice/FAQ';
import NoticeInfo from './customerservice/NoticeInfo';
import ProductSell from './product/ProductSell';
import ReportApprove from '../interact/ReportApprove';
import CategoryModal from '../modal/CategoryModal';
import ProductInfo from './product/ProductInfo';
import ProductBuy from './product/ProductBuy';
import PaymentSuccess from './product/PaymentSuccess';
import PaymentFail from './product/PaymentFail';
import RecommendIndex from './recommend/RecommendIndex';
import EventIndex from './event/EventIndex';
import EventWrite from './event/EventWrite';
import EventInfo from './event/EventInfo';
import EventEdit from './event/EventEdit';
import SubMenuIndex from './submenu/SubMenuIndex';
import SubMenuWrite from './submenu/SubMenuWrite';
import UserInfo from './user/UserInfo';

import AuctionIndex from './auction/AuctionIndex';
import AuctionRoom from './auction/AuctionRoom';
import DailyCheck from './event/coupon/DailyCheck';
import MyInquiryList from './user/mypage/MyInquiryList';
import InquiryView from './customerservice/InquiryView';
import InquiryModal from '../modal/InquiryModal';
import AuctionSell from './auction/AuctionSell';
import AuctionBid from './auction/AuctionBid';
import AuctionBidSuccess from './auction/AuctionBidSuccess';
import ShippingTracker from './shipping/ShippingTracker';
import Notice from './customerservice/Notice';
import Chatting from './product/Chatting';
import DeleteModal from '../modal/DeleteModal';
import MelonGame from './event/coupon/MelonGame';
import NoticeEdit from './customerservice/NoticeEdit';

import AuctionSearch from './auction/AuctionSearch';
import ShippingModal from '../modal/ShippingModal';

import Menu from './Menu';

import Item from './Item';
import { setLoginView } from '../store/loginSlice';
import AuctionPaymentSuccess from './product/AuctionPaymentSuccess';
import NaverSignupHandler from './user/NaverSignupHandler';
import RefundModal from '../modal/RefundModal';
import CancelModal from '../modal/CancelModal';
import SellerCancelModal from '../modal/SellerCancelModal';
import ProductCheck from './product/ProductCheck';
import AuctionCheck from './auction/AuctionCheck';
import ProductEdit from './product/ProductEdit';
import ChatFileModal from '../modal/ChatFileModal';

function Body() {
  const modal = useSelector((state) => state.modal);

  const al_mount = useRef(false);

  const interact = useSelector((state) => state.interact);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const serverIP = useSelector((state) => state.serverIP);
  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    if (al_mount.current) {
      dispatch(setInteract({ ...interact, isOpen: false }));
      dispatch(setMenuModal(false));
    }
  }, [modal]); //모달 열리면 상호작용 그거 닫힘

  useEffect(() => {
    dispatch(setInteract({ ...interact, isOpen: false }));
    dispatch(setMenuModal(false));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  useEffect(() => {
    if (!al_mount.current) {
      al_mount.current = true;

      const handleClick = (e) => {
        if (e.target.className === 'message-who' || e.target.className === 'msg-who') {
          if (user)
            axios.get(`${serverIP.ip}/auth/me`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
              .then(res => {
                if (e.target.id.split('-')[1] != res.data.id) {
                  dispatch(setInteract({ ...interact, selected: e.target.id.split('-')[1], select: res.data.id, pageX: e.pageX, pageY: e.pageY, isOpen: true }));
                }
              })
              .catch(err => console.log(err))
        }
        else if (e.target.id.indexOf('delll') !== -1) {
          const selected_id = e.target.id.split('-')[3];
          if (selected_id === undefined)
            dispatch(setModal({ isOpen: true, selected: e.target.id }));
          else
            dispatch(setModal({ isOpen: true, selected: e.target.id, selectedItem: selected_id }));
        }
      };

      window.addEventListener('click', handleClick);

      return () => {
        window.removeEventListener('click', handleClick);
      };
    }
  }, []);

  useEffect(()=>{
    var menu = new Menu("#myMenu");
    var item1 = new Item("list", "fas fa-bars", "");
    var item2 = new Item("up", "fas fa-id-card", "", "");
    var item3 = new Item("home", "fas fa-sign-out-alt", "", "");
    var item4 = new Item("chat", "fas fa-chat-alt", "", "");
    menu.add(item1);
    menu.add(item2);
    menu.add(item4);
    menu.add(item3);
    let homeButton=document.getElementById("home");
    var upButton=document.getElementById("up");
    let chatButton=document.getElementById("chat");
    
    homeButton.addEventListener('click', () => {
      menu.close();
      if(user)  
        navigate('/product/sell');
      else dispatch(setLoginView(true));
    });

    upButton.addEventListener('click', () => {
        menu.close();
        window.scrollTo({top:0,left:0,behavior:'smooth'});
    });

    chatButton.addEventListener('click', () => {
      menu.close();
      if(user)  
        navigate('/mypage/chatting');
      else dispatch(setLoginView(true));
    });

    let clicked = false;
  },[]);

  useEffect(() => {
    if (!user) return;
  
    const fetchUnreadCount = () => {
      axios.get(`${serverIP.ip}/chat/unreadChatCount`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => {
        const chatElement = document.getElementById("chat");
        const existingIcon = document.getElementById("count-icon");
  
        if (res.data > 0) {
          if (!existingIcon) {
            const countIcon = document.createElement("span");
            countIcon.id = "count-icon";
            countIcon.textContent = res.data;
            chatElement.appendChild(countIcon);
          } else {
            existingIcon.textContent = res.data;
          }
        } else {
          if (existingIcon) {
            chatElement.removeChild(existingIcon);
          }
        }
      })
      .catch(err => console.log(err));
    };
  
    fetchUnreadCount(); // 초기 1회 실행
    const intervalId = setInterval(fetchUnreadCount, 10000); // 10초마다 반복
  
    return () => clearInterval(intervalId); // 언마운트 시 정리
  }, [user]);

  return (<>
    {modal.isOpen && modal.selected == '1' && <ModalIndex />}
    {modal.isOpen && modal.selected == '2' && <Modal2 />}
    {modal.isOpen && modal.selected == 'message' && <Message />}
    {modal.isOpen && modal.selected == 'message-box' && <MessageBox />}
    {modal.isOpen && modal.selected == 'basket-box' && <BasketBox />}
    {modal.isOpen && modal.selected == "DaumPost" &&
      <div className='daumpost'>
        <button title="X" className="post-close-btn" onClick={() => dispatch(setModal({ ...modal, isOpen: false }))} >X</button>
        <Post />
      </div>}

    {modal.isOpen && modal.selected == 'report' && <Report />}
    {modal.isOpen && modal.selected == 'reportapprove' && <ReportApprove />}
    {modal.isOpen && modal.selected == 'categorymodal' && <CategoryModal />}
    {modal.isOpen && modal.selected == 'inquiry-box' && <InquiryModal />}
    {modal.isOpen && modal.selected == 'shipping' && <ShippingModal />}
    {modal.isOpen && modal.selected == 'refund' && <RefundModal />}
    {modal.isOpen && modal.selected == 'cancel-order' && <CancelModal />}
    {modal.isOpen && modal.selected == 'seller-cancel-order' && <SellerCancelModal />}
    {modal.isOpen && modal.selected == 'chat-file-modal' && <ChatFileModal />}
    {interact.isOpen && <Interact />}
    {modal.isOpen && modal.selected.indexOf('delll') !== -1 && <DeleteModal />}
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/signup/info" element={<SignupInfo />} />
      <Route exact path="/login/oauth2/code/kakao" element={<SignupHandler />} />
      <Route exact path="/login/oauth2/code/google" element={<GoogleSignupHandler />} />
      <Route exact path="/login/oauth2/code/naver" element={<NaverSignupHandler />} />

      <Route path='/userinfo' element={<UserInfo key={location.state} />}></Route>
      <Route path='/mypage/*' element={<MyIndex />}></Route>
      <Route path='/mypage/myinquirylist' element={<MyInquiryList />}></Route>

      <Route path='/admin/*' element={<AdminIndex />}></Route>
      <Route path='/already' element={<Already />}></Route>

      <Route path='/product/*' element={<ProductIndex />}></Route>
      <Route path='/product/search' element={<ProductSearch />}></Route>
      <Route path='/product/chat/:roomId' element={<Chatting />}></Route>

      <Route path='/customerservice/*' element={<CenterHome />}>
        <Route path="inquirywrite" element={<InquiryWrite />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="notice" element={<Notice />} />
        <Route path="notice/:id" element={<NoticeInfo />} />
        <Route path="noticewrite" element={<NoticeWrite />} />
        <Route path="noticeedit/:id" element={<NoticeEdit />} />

      </Route>
      <Route path='/inquiry/inquiryview/:id' element={<InquiryView />} />

      <Route path='/product/sell' element={<ProductSell />}></Route>
      <Route path='/product/edit' element={<ProductEdit />}></Route>
      <Route path='/product/info' element={<ProductInfo />}></Route>
      <Route path='/product/buying' element={<ProductBuy />}></Route>
      <Route path='/product/check' element={<ProductCheck />}></Route>
      <Route path="/payment/success" element={<PaymentSuccess />}></Route>
      <Route path="/payment/auction/success" element={<AuctionPaymentSuccess/>}></Route>
      <Route path="/payment/fail" element={<PaymentFail />}></Route>

      <Route path='/recommend/*' element={<RecommendIndex />}></Route>

      <Route path='/event/*' element={<EventIndex />}></Route>
      <Route path='/event/write' element={<EventWrite />}></Route>
      <Route path='/event/info' element={<EventInfo />}></Route>
      <Route path='/event/edit/:id' element={<EventEdit />}></Route>
      <Route path='/event/dailycheck' element={<DailyCheck />}></Route>
      <Route path='/event/melongame' element={<MelonGame/>}></Route>

      <Route path='/submenu/*' element={<SubMenuIndex />}></Route>
      <Route path='/submenu/write' element={<SubMenuWrite />}></Route>

      <Route path='/auction/*' element={<AuctionIndex />}></Route>
      <Route path='/auction/room/:roomId' element={<AuctionRoom />}></Route>
      <Route path='/auction/sell' element={<AuctionSell />}></Route>
      <Route path='/auction/bid' element={<AuctionBid />}></Route>
      <Route path="/auction/bid/success" element={<AuctionBidSuccess />} />
      <Route path="/auction/search" element={<AuctionSearch />} />
      <Route path="/auction/check" element={<AuctionCheck />} />
      

      <Route path="/shipping/track" element={<ShippingTracker />}></Route>
    </Routes>
  </>
  );
}

export default Body;