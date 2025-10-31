// import { configureStore } from "@reduxjs/toolkit";
// import facultySlice from '../Slices/facultyTokenSlice';

// const store = configureStore({
//   reducer: {
//     facultyStore: facultySlice.reducer, // ✅ no need for .reducer
//   },
// });

// export default store;





// import { configureStore } from "@reduxjs/toolkit";
// import facultySlice from '../Slices/facultyTokenSlice';

// const store = configureStore({
//   reducer: {
//     facultyStore: facultySlice.reducer, // ✅ key name for this slice's state
//   },
// });

// export default store;
// Path: ../Store/store.ts
// src/Redux/Store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import facultyReducer from "../Slices/facultyTokenSlice";

const store = configureStore({
  reducer: {
    facultyStore: facultyReducer,
  },
});

// 🔥 Export types for use with `useSelector` and `useDispatch`
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
