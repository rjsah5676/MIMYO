import { createSlice } from "@reduxjs/toolkit";

const loadUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Failed to load user from storage:", error);
    return null;
  }
};

const initialState = {
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;