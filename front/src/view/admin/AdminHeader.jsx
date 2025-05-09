function AdminHeader({path, setPath}){
    return(
        <div className='admin-header'>
            <span>{path.f_name} &gt; <b>{path.l_name}</b></span>
        </div>
    )
}

export default AdminHeader;