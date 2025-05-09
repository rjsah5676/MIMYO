function MyPageHeader({path, setPath}){
    return(
        <div className='mypage-header'>
            <span>{path.f_name} &gt; <b>{path.l_name}</b></span>
                        
        </div>
    )
}

export default MyPageHeader;