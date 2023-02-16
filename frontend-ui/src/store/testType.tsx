import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import endpoints from "../service/endpoints";
import { TestTypeActionType } from "./actionTypes";

import API from "service/api";

/**
 * Function handle action get list tests type
 */
export const getLists = createAsyncThunk(`testType/${TestTypeActionType.GET_LIST}`, async (sampleType: string, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.test_type?.LIST + "?testcategory=" + sampleType, method: "GET" });
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.data?.code) {
            errorMessage = error.data.code;
        }
        return rejectWithValue(errorMessage);
    }
});

/** @type {object} init state of test type */
export const initialTestType = {
    id: null,
    name: "",
};

/** @type {object} init state of test types */
const initialState = {
    testTypes: [],
    testType: initialTestType,
    loading: false,
    error: "",
};

const testTypeSlice = createSlice({
    name: 'testType',
    initialState,
    reducers: {
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
            state.testTypes = action.payload;
            state.loading = false;
            state.error = "";
        },
    },
});

export const { clearErrorMessage } = testTypeSlice.actions;

const { reducer: testType } = testTypeSlice;
export default testType;

