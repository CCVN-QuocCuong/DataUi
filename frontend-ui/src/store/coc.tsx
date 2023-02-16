import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { COCActionType } from "./actionTypes";
import endpoints from "../service/endpoints";

import API from "service/api";

/**
 * Function handle action generate COC
 */
export const addCOC = createAsyncThunk(`coc/${COCActionType.ADD_COC}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.COC_CREATE,
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

/**
 * Function handle action get list COC
 */
export const getLists = createAsyncThunk(`coc/${COCActionType.GET_LIST}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.coc?.SEARCH, method: "POST", data });
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
 * Function handle action search COC with params
 */
export const search = createAsyncThunk(`coc/${COCActionType.SEARCH}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.LIST,
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

/**
 * Function handle action get detail COC by COC ID
 */
export const getCOCByID = createAsyncThunk(`coc/${COCActionType.GET_BY_ID}`, async (id: number, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC + '/' + id,
            method: "GET",
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
 * Function handle action update infomation of COC
 */
export const updateCOC = createAsyncThunk(`coc/${COCActionType.EDIT_COC}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC,
            method: "PUT",
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

/**
 * Function handle action get list file of COC
 */
export const getListsCOCFile = createAsyncThunk(`coc/${COCActionType.GET_LIST_FILES}`, async (id: number, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC + "/files/" + id,
            method: "GET",
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
 * Function handle action get detail of file by file name
 */
export const getCOCFile = createAsyncThunk(`coc/${COCActionType.GET_FILE}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC + "/" + data.id + "/" + data.filename,
            method: "GET",
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
 * Function handle action upload file in COC
 */
export const uploadCOCFiles = createAsyncThunk(`coc/${COCActionType.UPLOAD_FILE}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.UPLOAD_FILE,
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

/**
 * Function handle action upload file to S3 bucket
 */
export const uploadCOCFileToS3 = createAsyncThunk(`coc/${COCActionType.UPLOAD_FILE_S3}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: data?.url,
            method: "POST",
            data: data?.data,
            isAuth: false,
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
 * Function handle action remove file in COC
 */
export const removeCOCFile = createAsyncThunk(`coc/${COCActionType.REMOVE_FILE}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC + "/" + data.id + "/" + data.filename,
            method: "DELETE",
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

/**
 * Function handle action remove all file in COC
 */
export const removeAllCOCFile = createAsyncThunk(`coc/${COCActionType.REMOVE_ALL_FILE}`, async (id: number, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC + "/" + id + "/all",
            method: "DELETE",
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
 * Function handle action generate report
 */
export const generateReport = createAsyncThunk(`coc/${COCActionType.GENERATE_REPORT}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC + "/" + data.id + "/report/generate",
            method: "POST",
            data: data?.data,
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
 * Function handle action get list sample from lab result
 */
export const getListSamplesFile = createAsyncThunk(`coc/${COCActionType.GET_LIST_SAMPLES_FILE}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC + "/" + data.id + "/" + data.filename + "/options",
            method: "GET",
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
 * Function handle action get file detail
 */
export const getFileDetail = createAsyncThunk(`coc/${COCActionType.GET_FILE_DETAIL}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.FILE_DETAIL + data.id + "/" + data.filename + "/" + data?.uploadby,
            method: "GET",
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

export const mappingSample = createAsyncThunk(`coc/${COCActionType.MAPPING_SAMPLE}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.SINGLE_COC + "/" + data.id + "/updatemapping",
            method: "POST",
            data: data?.data,
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

export const acceptMappingSample = createAsyncThunk(`coc/${COCActionType.ACCEPT_MAPPING}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.ACCEPT_MAPPING,
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

export const rejectMappingSample = createAsyncThunk(`coc/${COCActionType.REJECT_MAPPING}`, async (fileid: number, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.coc?.REJECT_MAPPING + fileid,
            method: "DELETE",
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

export const getListPhotos = createAsyncThunk(`coc/${COCActionType.GET_LIST_PHOTO}`, async (id: number, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.photo?.LIST_IN_COC?.replace(":id", id?.toString()),
            method: "GET",
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

export const getReportParametter = createAsyncThunk(`coc/${COCActionType.GET_REPORT_PARAMETER}`, async (id: number, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.coc.GET_REPORT_PARAMETERS?.replace(":id", id?.toString()), method: "GET" });
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.data?.code) {
            errorMessage = error.data.code;
        }
        return rejectWithValue(errorMessage);
    }
});

export const getMappingSample = createAsyncThunk(`coc/${COCActionType.GET_MAPPING_SAMPLE}`, async (id: number, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.coc.GET_MAPPING?.replace(":id", id?.toString()), method: "GET" });
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.data?.code) {
            errorMessage = error.data.code;
        }
        return rejectWithValue(errorMessage);
    }
});

/** @type {object} init state of pagination */
export const pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
};

/** @type {object} init state of coc */
export const initialCOC = {
    cocid: null,
    comment: null,
    address: null,
    companyid: null,
    ttemailaddress: null,
    jobno: null,
    labid: null,
    labaddress: null,
    labquoteno: null,
    labreference: null,
    objective: null,
    jobphase: null,
    ttcontactphone: null,
    primarycontact: null,
    priority: null,
    siteaddress: null,
    siteid: null,
    createdby: null,
    jobtask: null,
    emailother: null,
    samples: [],
};

/** @type {object} init state of file */
export const initialFile = {
    name: null,
};

/** @type {object} init state of photo */
export const initialPhoto = {
    name: null,
};

/** @type {object} init state of parameter */
export const initialParameter = {
    formattype: null,
    header: null,
    region: null,
    soiltype: null,
    deptContamination: null,
    groundWaterLevel: null,
    canterburyArea: null,
    canterburySoiltype: null,
    canterburyIsSiteUrban: null,
    waikatoSoiltype: null,
    waikatoFreshAged: null,
    waikatoGrainOfSize: null,
    criteria: [],
};

/** @type {object} init state of cocs */
const initialState = {
    loading: false,
    loadingDelete: false,
    listFilesloading: false,
    listPhotosloading: false,
    reportLoading: false,
    cocs: [],
    files: [],
    file: initialFile,
    coc: initialCOC,
    cocFile: {},
    photos: [],
    photo: initialPhoto,
    parameters: initialParameter,
    error: "",
    uploadSuccess: false,
    addSuccess: false,
    generateReportSuccess: false,
    updateSuccess: false,
    isPrint: false,
    removeFilesSuccess: false,
    listSamplesFile: [],
    pagination: pagination,
    mappingSample: [],
};

const cocSlice = createSlice({
    name: 'coc',
    initialState,
    reducers: {
        setSuccess: (state, action) => {
            state.addSuccess = action.payload;
        },
        setUpdateSuccess: (state, action) => {
            state.updateSuccess = action.payload;
        },
        setRemoveFilesSuccess: (state, action) => {
            state.removeFilesSuccess = action.payload;
        },
        setUploadSuccess: (state, action) => {
            state.uploadSuccess = action.payload;
        },
        setIsPrint: (state, action) => {
            state.isPrint = action.payload;
        },
        clearErrorMessage: (state) => {
            state.error = "";
        },
        resetPagination: (state) => {
            state.pagination = pagination;
        },
        clearReportParametter: (state) => {
            state.parameters = initialParameter
        }
    },
    extraReducers: {
        [addCOC.pending.toString()]: (state) => {
            state.loading = true;
        },
        [addCOC.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [addCOC.fulfilled.toString()]: (state, action) => {
            state.coc = action.payload;
            state.loading = false;
            state.addSuccess = true;
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
            state.cocs = action.payload?.data?.items || [];
            state.pagination = {
                page: action.payload?.page || 1,
                pageSize: action.payload?.pagesize || 10,
                total: action.payload?.total || 0,
            };
            state.loading = false;
            state.error = "";
        },

        [search.pending.toString()]: (state) => {
            state.loading = true;
        },
        [search.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [search.fulfilled.toString()]: (state, action) => {
            state.cocs = action.payload;
            state.loading = false;
            state.error = "";
        },

        [getCOCByID.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getCOCByID.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getCOCByID.fulfilled.toString()]: (state, action) => {
            state.coc = action.payload;
            state.loading = false;
            state.error = "";
        },

        [updateCOC.pending.toString()]: (state) => {
            state.loading = true;
        },
        [updateCOC.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [updateCOC.fulfilled.toString()]: (state, action) => {
            state.coc = action.payload;
            state.loading = false;
            state.updateSuccess = true;
            state.error = "";
        },

        [getListsCOCFile.pending.toString()]: (state) => {
            state.listFilesloading = true;
        },
        [getListsCOCFile.rejected.toString()]: (state, action) => {
            state.listFilesloading = false;
            state.error = action.payload;
        },
        [getListsCOCFile.fulfilled.toString()]: (state, action) => {
            state.files = action.payload;
            state.listFilesloading = false;
            state.error = "";
        },

        [uploadCOCFiles.pending.toString()]: (state) => {
            state.loading = true;
        },
        [uploadCOCFiles.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [uploadCOCFiles.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.error = "";
        },

        [uploadCOCFileToS3.pending.toString()]: (state) => {
            state.loading = true;
        },
        [uploadCOCFileToS3.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [uploadCOCFileToS3.fulfilled.toString()]: (state, action) => {
            state.cocFile = action.payload;
            state.loading = false;
            state.uploadSuccess = true;
            state.error = "";
        },

        [removeCOCFile.pending.toString()]: (state) => {
            state.loadingDelete = true;
        },
        [removeCOCFile.rejected.toString()]: (state, action) => {
            state.loadingDelete = false;
            state.error = action.payload;
        },
        [removeCOCFile.fulfilled.toString()]: (state, action) => {
            state.loadingDelete = false;
            state.removeFilesSuccess = true;
            state.error = "";
        },

        [removeAllCOCFile.pending.toString()]: (state) => {
            state.loading = true;
        },
        [removeAllCOCFile.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [removeAllCOCFile.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.removeFilesSuccess = true;
            state.error = "";
        },

        [generateReport.pending.toString()]: (state) => {
            state.loading = true;
        },
        [generateReport.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [generateReport.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.generateReportSuccess = true;
            state.error = "";
        },

        [getListSamplesFile.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getListSamplesFile.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getListSamplesFile.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.listSamplesFile = action.payload;
            state.error = "";
        },

        [acceptMappingSample.pending.toString()]: (state) => {
            state.loading = true;
        },
        [acceptMappingSample.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [acceptMappingSample.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.listSamplesFile = action.payload;
            state.error = "";
        },

        [getFileDetail.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getFileDetail.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getFileDetail.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.error = "";
        },

        [mappingSample.pending.toString()]: (state) => {
            state.loading = true;
        },
        [mappingSample.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [mappingSample.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.error = "";
        },

        [getListPhotos.pending.toString()]: (state) => {
            state.listPhotosloading = true;
        },
        [getListPhotos.rejected.toString()]: (state, action) => {
            state.listPhotosloading = false;
            state.error = action.payload;
        },
        [getListPhotos.fulfilled.toString()]: (state, action) => {
            state.listPhotosloading = false;
            state.photos = action.payload;
            state.error = "";
        },

        [getReportParametter.pending.toString()]: (state) => {
            state.reportLoading = true;
        },
        [getReportParametter.rejected.toString()]: (state, action) => {
            state.reportLoading = false;
            state.error = action.payload;
        },
        [getReportParametter.fulfilled.toString()]: (state, action) => {
            state.reportLoading = false;
            state.parameters = action.payload;
            state.error = "";
        },

        [getMappingSample.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getMappingSample.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getMappingSample.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.mappingSample = action.payload;
            state.error = "";
        },

    },
});

export const { setSuccess, setUpdateSuccess, setRemoveFilesSuccess, setUploadSuccess, clearErrorMessage, setIsPrint, resetPagination, clearReportParametter } = cocSlice.actions;

const { reducer: coc } = cocSlice;
export default coc;
