import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { ParameterActionType } from "./actionTypes";
import endpoints from "../service/endpoints";

import API from "service/api";

/**
 * Function handle action get list parameters
 */
export const getLists = createAsyncThunk(`parameter/${ParameterActionType.GET_LIST}`, async (_, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.parameter?.LIST, method: "GET" });
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
 * Function handle action get list regions
 */
export const getListsOfRegion = createAsyncThunk(`parameter/${ParameterActionType.GET_LIST_OF_REGION}`, async (params: object, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.parameter?.LIST_OF_REGION, method: "GET", params });
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.data?.code) {
            errorMessage = error.data.code;
        }
        return rejectWithValue(errorMessage);
    }
});

/** @type {object} init state of notifications */
export const initialParameter = {
    id: null,
    name: null,
};

/** @type {object} declare type parameter */
type Parameter = {
    [key: string]: any;
};

/** @type {object} declare type parameters */
export const parameterLists: Parameter[] = [];

/** @type {object} init state of parameters */
const initialState = {
    loading: false,
    parameters: parameterLists,
    parameter: initialParameter,
    error: "",
    success: false,
};

const parameterSlice = createSlice({
    name: 'parameter',
    initialState,
    reducers: {
        setSuccess: (state, action) => {
            state.success = action.payload;
        },
        clearErrorMessage: (state) => {
            state.error = "";
        },
        clearParameters: (state) => {
            state.parameters = parameterLists;
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
            state.parameters = action.payload;
            state.loading = false;
            state.error = "";
        },

        [getListsOfRegion.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getListsOfRegion.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getListsOfRegion.fulfilled.toString()]: (state, action) => {
            state.parameters = action.payload;
            state.loading = false;
            state.error = "";
        },

    },
});

export const { setSuccess, clearErrorMessage, clearParameters } = parameterSlice.actions;

const { reducer: parameter } = parameterSlice;
export default parameter;