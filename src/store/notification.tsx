import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { NotificationActionType } from "./actionTypes";
import endpoints from "../service/endpoints";

import API from "service/api";

/**
 * Function handle action get list notifications
 */
export const getLists = createAsyncThunk(`notification/${NotificationActionType.GET_LIST}`, async (_, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.notification?.LIST, method: "GET" });
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
 * Function handle action update of notification
 */
export const updateNotification = createAsyncThunk(`notification/${NotificationActionType.UPDATE_NOTIFICATION}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.notification?.DETAIL_NOTIFICATION?.replace(':id', data?.id || 0),
            method: "POST",
            data: data,
            header: "content-type: application/json",
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

/**
 * Function handle action mark read a notification
 */
export const markNotification = createAsyncThunk(`notification/${NotificationActionType.MARK_NOTIFICATION}`, async (id: string, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.notification?.MARK_NOTIFICATION?.replace(':id', id),
            method: "PUT",
            header: "content-type: application/json",
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

/** @type {object} init state of notification */
export const initialNotification = {
    ttcl_notificationid: null,
    cocid: null,
    fileid: null,
    status: null,
    message: null,
    isread: false,
    created: null,
    lastmodified: null
};

/** @type {object} init state of notifications */
const initialState = {
    loading: false,
    listLoading: false,
    notifications: [],
    notification: initialNotification,
    error: "",
};

const noticationSlice = createSlice({
    name: 'photo',
    initialState,
    reducers: {
        clearErrorMessage: (state) => {
            state.error = "";
        },
        resetPhotos: (state) => {
            state.notifications = [];
        }
    },
    extraReducers: {
        [getLists.pending.toString()]: (state) => {
            state.listLoading = true;
        },
        [getLists.rejected.toString()]: (state, action) => {
            state.listLoading = false;
            state.error = action.payload;
        },
        [getLists.fulfilled.toString()]: (state, action) => {
            state.notifications = action.payload;
            state.listLoading = false;
            state.error = "";
        },

        [updateNotification.pending.toString()]: (state) => {
            state.listLoading = true;
        },
        [updateNotification.rejected.toString()]: (state, action) => {
            state.listLoading = false;
            state.error = action.payload;
        },
        [updateNotification.fulfilled.toString()]: (state, action) => {
            state.notification = action.payload;
            state.listLoading = false;
            state.error = "";
        },

        [markNotification.pending.toString()]: (state) => {
            state.listLoading = true;
        },
        [markNotification.rejected.toString()]: (state, action) => {
            state.listLoading = false;
            state.error = action.payload;
        },
        [markNotification.fulfilled.toString()]: (state, action) => {
            state.notification = action.payload;
            state.listLoading = false;
            state.error = "";
        },

    },
});

export const { clearErrorMessage, resetPhotos } = noticationSlice.actions;

const { reducer: notication } = noticationSlice;
export default notication;