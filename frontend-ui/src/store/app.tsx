import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
    currentRoute: null
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setCurrentRoute: (state, action) => {
            state.currentRoute = action.payload;
        },
    },
    extraReducers: {},
});

export const { setLoading, setCurrentRoute } = appSlice.actions;

const { reducer: app } = appSlice;
export default app;