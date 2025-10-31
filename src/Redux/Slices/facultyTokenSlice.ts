// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   token: '',
//   user: null
// };

// const facultySlice = createSlice({
//   name: "facultySlice",
//   initialState,
//   reducers: {
//     setToken: (state, action) => {
//       state.token = action.payload.token
//     },
//   },
// });

// export const { setToken } = facultySlice.actions;
// export default facultySlice.reducer;
// Path: ../Slices/facultyTokenSlice.ts
// src/Redux/Slices/facultyTokenSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FacultyState {
  token: string;
  user: any | null; // You can type this properly later
}

const initialState: FacultyState = {
  token: "",
  user: null,
};

const facultySlice = createSlice({
  name: "facultySlice",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    clearToken: (state) => {
      state.token = "";
      state.user = null;
    },
  },
});

export const { setToken, clearToken } = facultySlice.actions;
export default facultySlice.reducer;
