import { createSlice } from "@reduxjs/toolkit";

const initialState = false;

const menuSlice = createSlice({
  name: "menuModal",
  initialState,
  reducers: {
    setMenuModal: (state, action) => {
        return action.payload;
    },
  },
});

export const { setMenuModal } = menuSlice.actions;
export default menuSlice.reducer;