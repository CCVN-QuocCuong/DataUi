import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { userActionType } from "./actionTypes";
import endpoints from "../service/endpoints";

import API from "service/api";

/**
 * Function handle action get list users
 */
export const getLists = createAsyncThunk(`user/${userActionType.GET_LIST}`, async (params: any, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.user?.LIST, method: "GET" });
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.data?.code) {
            errorMessage = error.data.code;
        }
        return rejectWithValue(errorMessage);
    }
});

/**
 * Function handle action create new user
 */
export const addUser = createAsyncThunk(`user/${userActionType.ADD_USER}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.user?.USER_CREATE,
            method: "POST",
            header: "content-type: application/json",
            data,
        });
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.data?.code) {
            errorMessage = error.data.code;
        }
        return rejectWithValue(errorMessage);
    }
});

/** @type {object} init state of user */
export const initialUser = {
    id: null,
    name: "",
    phone_number: "",
};

/** @type {object} init state of users */
const initialState = {
    users: [],
    user: initialUser,
    isAddUserSuccess: "",
    error: "",
    loading: false,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearErrorMessage: (state) => {
            state.error = "";
        }
    },
    extraReducers: {
        [addUser.pending.toString()]: (state) => {
            state.loading = true;
        },
        [addUser.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [addUser.fulfilled.toString()]: (state, action) => {
            state.user = action.payload;
            state.loading = false;
            state.error = "";
        },

        [getLists.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getLists.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getLists.fulfilled.toString()]: (state, action) => {
            state.users = action.payload;
            state.loading = false;
            state.error = "";
        },
    },
});

export const { clearErrorMessage } = userSlice.actions;

const { reducer: user } = userSlice;
export default user;
