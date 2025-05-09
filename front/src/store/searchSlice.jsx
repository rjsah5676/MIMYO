import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  searchWord:'',
  eventCategory:'',
  targetCategory:'',
  productCategory:''
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.searchWord = action.payload.searchWord;
      state.eventCategory = action.payload.eventCategory;
      state.targetCategory = action.payload.targetCategory;
      state.productCategory = action.payload.productCategory;
    },
  },
});

export const { setSearch } = searchSlice.actions;
export default searchSlice.reducer;