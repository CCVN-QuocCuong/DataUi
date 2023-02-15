import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { PhotoActionType } from "./actionTypes";
import endpoints from "../service/endpoints";

import API from "service/api";

/**
 * Function handle action get list photos
 */
export const getLists = createAsyncThunk(`photo/${PhotoActionType.GET_LIST}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.photo?.FILTER, method: "POST", data: data });
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
 * Function handle action search photos by params
 */
export const searchPhoto = createAsyncThunk(`photo/${PhotoActionType.SEARCH_PHOTO}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.photo?.SEARCH, method: "POST", data: data, });
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
 * Function handle action get photo detail
 */
export const getPhotoDetail = createAsyncThunk(`photo/${PhotoActionType.GET_PHOTO_DETAIL}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.photo?.DETAIL_PHOTO,
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
 * Function handle action export report photos
 */
export const exportPhoto = createAsyncThunk(`photo/${PhotoActionType.EXPORT_PHOTO}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.photo?.EXPORT_PHOTO,
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

/** @type {object} declare type photo */
type Photo = {
    [key: string]: any;
};

/** @type {object} init state of photo */
export const initialPhoto = {
    id: null,
    filename: null,
};

/** @type {object} init state of pagination */
export const pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
};

/** @type {object} declare type photos */
export const PhotoLists: Photo[] = [];

/** @type {object} init state of photos */
const initialState = {
    loading: false,
    listLoading: false,
    detailLoading: false,
    photos: PhotoLists,
    photo: initialPhoto,
    photoDetails: [],
    error: "",
    pagination: pagination,
    listPhotosSeleted: PhotoLists,
};

const photoSlice = createSlice({
    name: 'photo',
    initialState,
    reducers: {
        clearErrorMessage: (state) => {
            state.error = "";
        },
        resetPhotos: (state) => {
            state.photos = [];
        },
        setListPhotosSeleted: (state, action) => {
            state.listPhotosSeleted = action?.payload || [];
        },
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
            state.photos = action.payload?.data?.items || [];
            state.pagination = {
                page: action.payload?.page || 1,
                pageSize: action.payload?.pagesize || 10,
                total: action.payload?.total || 0,
            };
            state.listLoading = false;
            state.error = "";
        },

        [searchPhoto.pending.toString()]: (state) => {
            state.listLoading = true;
        },
        [searchPhoto.rejected.toString()]: (state, action) => {
            state.listLoading = false;
            state.error = action.payload;
        },
        [searchPhoto.fulfilled.toString()]: (state, action) => {
            state.photos = action.payload;
            state.listLoading = false;
            state.error = "";
        },

        [getPhotoDetail.pending.toString()]: (state) => {
            state.detailLoading = true;
        },
        [getPhotoDetail.rejected.toString()]: (state, action) => {
            state.detailLoading = false;
            state.error = action.payload;
        },
        [getPhotoDetail.fulfilled.toString()]: (state, action) => {
            state.photoDetails = action.payload?.urls || [];
            state.detailLoading = false;
            state.error = "";
        },

    },
});

export const { clearErrorMessage, resetPhotos, setListPhotosSeleted } = photoSlice.actions;

const { reducer: photo } = photoSlice;
export default photo;