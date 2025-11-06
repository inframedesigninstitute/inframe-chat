import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface adminUser {
    id: string;
    name: string;
    email: string;
}

interface adminState {
    token: string;
    user: adminUser | null;
}

const initialState: adminState = {
    token: "",
    user: null,
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<{ token: string }>) => {
            state.token = action.payload.token;
        },
        setUser: (state, action: PayloadAction<adminUser>) => {
            state.user = action.payload;
        },
        clearToken: (state) => {
            state.token = "";
            state.user = null;
        },
    },
});

export const { setToken, setUser, clearToken } = adminSlice.actions;
export default adminSlice.reducer;