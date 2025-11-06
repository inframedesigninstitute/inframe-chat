import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface studentUser {
  id: string;
  name: string;
  email: string;
}

interface studentState {
  token: string;
  user: studentUser | null;
}

const initialState: studentState = {
  token: "",
  user: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    setUser: (state, action: PayloadAction<studentUser>) => {
      state.user = action.payload;
    },
    clearToken: (state) => {
      state.token = "";
      state.user = null;
    },
  },
});

export const { setToken, setUser, clearToken } = studentSlice.actions;
export default studentSlice.reducer;