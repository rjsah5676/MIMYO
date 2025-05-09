import DaumPostcode from "react-daum-postcode";
import { useSelector, useDispatch } from "react-redux";
import { setModal } from "../store/modalSlice";

const Post = () => {
    const modal = useSelector((state)=>{return state.modal});
    const dispatch = useDispatch();

    const complete = (data) =>{
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        dispatch(setModal({...modal, isOpen: false, info: {address: fullAddress, zonecode: data.zonecode}}));
    }

    return (
            <DaumPostcode style={{width:'800px'}}
                className="postmodal"
                autoClose
                onComplete={complete} />
    );
};

export default Post;