import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FacultyUser {
  id: string;
  name: string;
  email: string;
}

interface FacultyState {
  token: string;
  user: FacultyUser | null;
}

const initialState: FacultyState = {
  token: "",
  user: null,
};

const facultySlice = createSlice({
  name: "faculty",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    setUser: (state, action: PayloadAction<FacultyUser>) => {
      state.user = action.payload;
    },
    clearToken: (state) => {
      state.token = "";
      state.user = null;
    },
  },
});

export const { setToken, setUser, clearToken } = facultySlice.actions;
export default facultySlice.reducer;