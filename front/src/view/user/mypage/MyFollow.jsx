import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

function MyFollow(){
    const user = useSelector((state) => state.auth.user);
    let serverIP = useSelector((state) => state.serverIP);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const selectedTab = searchParams.get('tab') || 'follower';
    const [followerList, setFollowerList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [grade, setGrade] = useState(['✊','☝️','✌️','🖐️']);

    const [followState, setFollowState] = useState([]);

    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        getInfo();
    }, []);

    const getInfo = ()=>{
        axios.get(`${serverIP.ip}/mypage/myFollow?id=${user.user.id}`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
        })
        .then(res=>{
            setFollowerList(res.data.followerList);
            setFollowingList(res.data.followingList);

            // 팔로잉 목록에 있는 사용자는 true로 설정
            const initialFollowState = res.data.followingList.map(user => user.id);
            setFollowState(initialFollowState);  // 팔로우된 사용자의 ID를 배열로 저장
        })
        .catch(err=>console.log(err));
    }

    const followUser = (id) => {
        if (followState.includes(id) && !window.confirm("언팔로우 하시겠습니까?")) return;

        axios.get(`${serverIP.ip}/interact/followUser?from=${user.user.id}&to=${id}&state=${followState.includes(id)}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
            .then(() => {
                getInfo();
            })
            .catch(err => console.log(err));
    }

    // 검색 - 필터링된 리스트 만들기
    const filteredList = (selectedTab === "follower" ? followerList : followingList)
    .filter(user => user.username.toLowerCase().includes(searchKeyword.toLowerCase()));

    return (
        <div className='follow-container'>
            <ul className='follow-menu'>
                <li className={selectedTab === 'follower' ? 'selected-menu' : {}} onClick={() => navigate('?tab=follower')}>팔로워({followerList.length})</li>
                <li className={selectedTab === 'following' ? 'selected-menu' : {}} onClick={() => navigate('?tab=following')}>팔로잉({followingList.length})</li>
            </ul>

            <hr className="menu-divider" />

            <div className="search-input-box">
                <input type="text" className="myfollow-search" placeholder="검색" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}/>
            </div>
            
            <hr className="menu-divider" />

            <div className='follow-list' >
            {
                filteredList.map(user => (
                    <div key={user.id} className="follow-user-item">
                        <div className="follow-user-img-wrapper">
                            <img className="follow-user-img" src = {user.profileImageUrl.indexOf('http') !==-1 ? `${user.profileImageUrl}`:`${serverIP.ip}${user.profileImageUrl}`} alt=''/>
                        </div>

                        <div className="follow-user-info">
                            <div id={`mgx-${user.id}`} className='message-who' style={{cursor: 'pointer'}}>{user.username}<span>{grade[user.grade]}</span></div>
                            <div style={{width:'80%', display: "-webkit-box", WebkitLineClamp: 3,  WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis"}}>{user.infoText}</div>
                        </div>

                        <button id={followState.includes(user.id) ? "unfollow-btn" : "follow-btn"} onClick={()=>followUser(user.id)}>
                            {followState.includes(user.id) ? 'Following' : 'Follow'}
                        </button>
                    </div>
                ))
            }
            </div>
        </div>
    )
}

export default MyFollow;