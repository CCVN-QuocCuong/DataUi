import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { CodeActionType } from "./actionTypes";
import endpoints from "../service/endpoints";

import API from "service/api";

/**
 * Function handle action get list codes
 */
export const getLists = createAsyncThunk(`code/${CodeActionType.GET_LIST}`, async (_, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.code?.LIST, method: "GET" });
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
 * Function handle action get list additional code
 */
export const getListsAdditional = createAsyncThunk(`code/${CodeActionType.GET_LIST_ADDITIONAL}`, async (params: object, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.code?.LIST_ADDITIONAL, method: "GET", params });
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.data?.code) {
            errorMessage = error.data.code;
        }
        return rejectWithValue(errorMessage);
    }
});

/** @type {object} init state of code */
export const initialCode = {
    id: null,
    name: null,
    address: null,
};

/** @type {object} declare type code */
type Code = {
    [key: string]: any;
};

/** @type {object} declare type codes */
export const codeLists: Code[] = [];

/** @type {object} init state of codes */
const initialState = {
    loading: false,
    codes: codeLists,
    additionalCodes: codeLists,
    code: initialCode,
    error: "",
    success: false,
};

const codeSlice = createSlice({
    name: 'code',
    initialState,
    reducers: {
        setSuccess: (state, action) => {
            state.success = action.payload;
        },
        clearErrorMessage: (state) => {
            state.error = "";
        }
    },
    extraReducers: {
        [getLists.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getLists.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getLists.fulfilled.toString()]: (state, action) => {
            state.codes = action.payload;
            state.loading = false;
            state.error = "";
        },

        [getListsAdditional.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getListsAdditional.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getListsAdditional.fulfilled.toString()]: (state, action) => {
            state.additionalCodes = action.payload;
            state.loading = false;
            state.error = "";
        },

    },
});

export const { setSuccess, clearErrorMessage } = codeSlice.actions;

const { reducer: code } = codeSlice;
export default code;