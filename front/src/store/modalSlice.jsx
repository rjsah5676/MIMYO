import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  selected: '',
  info: {},
  selectedItem: null,
  delCheck:''
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setModal: (state, action) => {
      state.isOpen = action.payload.isOpen;
      state.selected = action.payload.selected;
      state.info = action.payload.info;
      state.selectedItem = action.payload.selectedItem;
      state.delCheck = action.payload.delCheck;
    },
  },
});

export const { setModal } = modalSlice.actions;
export default modalSlice.reducer;