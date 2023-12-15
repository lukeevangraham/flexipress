import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    email: null,
    id: null,
  },
  reducers: {
    signIn: (state) => {
      state.id = action.payload.id;
    },
    signOut: (state) => {
      state.email = null;
    },
    signUp: (state) => {
      state.email = action.payload;
    },
    getUser: (state) => {
      (state.email = action.payload.email), (state.id = action.payload.id);
    },
  },
});

export const { signIn, signOut, signUp, getUser } = authSlice.actions;

export default authSlice.reducer;
