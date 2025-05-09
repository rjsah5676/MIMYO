import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen:false,
  selected:0,
  select:0,
  pageX:0,
  pageY:0,
  zIndex:2000,
};

const interactSlice = createSlice({
  name: "interact",
  initialState,
  reducers: {
    setInteract: (state, action) => {
      state.isOpen = action.payload.isOpen;
      state.selected = action.payload.selected;
      state.select = action.payload.select;
      state.pageX = action.payload.pageX;
      state.pageY = action.payload.pageY;
    },
  },
});

export const { setInteract } = interactSlice.actions;
export default interactSlice.reducer;