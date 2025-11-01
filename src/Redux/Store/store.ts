import { configureStore } from "@reduxjs/toolkit";
import facultyReducer from "../Slices/facultyTokenSlice";

const store = configureStore({
  reducer: {
    facultyStore: facultyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;