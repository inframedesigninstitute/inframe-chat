import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "../Slices/adminTokenSlice";
import facultyReducer from "../Slices/facultyTokenSlice";
import studentReducer from "../Slices/studentTokenSlice";



const store = configureStore({
  reducer: {
    facultyStore: facultyReducer,
    StudentStore: studentReducer,
    AdminStore: adminReducer,


  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;