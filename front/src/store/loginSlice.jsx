import { createSlice } from "@reduxjs/toolkit";

const initialState = false;

const loginSlice = createSlice({
  name: "loginView",
  initialState,
  reducers: {
    setLoginView: (state, action) => {
        return action.payload;
    },
  },
});

export const { setLoginView } = loginSlice.actions;
export default loginSlice.reducer;