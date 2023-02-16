import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { FileActionType } from "./actionTypes";
import endpoints from "../service/endpoints";

import API from "service/api";

/**
 * Function handle action get list files
 */
export const getLists = createAsyncThunk(`file/${FileActionType.GET_LIST}`, async (_, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.file?.LIST, method: "GET" });
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
 * Function handle action get detail file by file ID
 */
export const getFile = createAsyncThunk(`coc/${FileActionType.GET_FILE}`, async (fileid: number, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.file?.DETAIL_FILE?.replace(':fileid', fileid?.toString()),
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
 * Function handle action get detail file by file name
 */
export const getFileDetail = createAsyncThunk(`coc/${FileActionType.GET_FILE_DETAIL}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.file?.TRANSFORM_FILE?.replace(':filename', data?.filename)?.replace(':uploadby', data?.uploadby),
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
 * Function handle action get list sample by file ID
 */
export const getFileSamples = createAsyncThunk(`coc/${FileActionType.GET_FILE_SAMPLES}`, async (fileid: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.file?.GET_FILE_SAMPLES?.replace(':fileid', fileid),
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
 * Function handle action get information form by file ID
 */
export const getFormLabFile = createAsyncThunk(`coc/${FileActionType.GET_FORM_LAB_FILE}`, async (fileid: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.file?.GET_FORM_LAB_FILE?.replace(':fileid', fileid),
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
 * Function handle action save form info
 */
export const saveFormLabFile = createAsyncThunk(`file/${FileActionType.SAVE_FORM_LAB_FILE}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.file?.SAVE_FORM_LAB_FILE?.replace(':fileid', data?.fileid),
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
 * Function handle action upload file without COC
 */
export const uploadFiles = createAsyncThunk(`file/${FileActionType.UPLOAD_FILE}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.file?.UPLOAD_FILE,
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
export const uploadFileToS3 = createAsyncThunk(`file/${FileActionType.UPLOAD_FILE_S3}`, async (data: any, { rejectWithValue }) => {
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
 * Function handle action remove file without COC
 */
export const removeFile = createAsyncThunk(`file/${FileActionType.REMOVE_FILE}`, async (fileid: number, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.file?.REMOVE_FILE?.replace(':fileid', fileid?.toString()),
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
 * Function handle action gennerate report without COC
 */
export const generateReportNoCOC = createAsyncThunk(`file/${FileActionType.GENERATE_REPORT}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.file?.GENERATE_REPORT?.replace(':fileid', data?.fileid?.toString()),
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
 * Function handle action get report parameter
 */
export const getReportParametter = createAsyncThunk(`coc/${FileActionType.GET_REPORT_PARAMETER}`, async (fileid: number, { rejectWithValue }) => {
    try {
        const response = await API({ url: endpoints?.file.GET_REPORT_PARAMETERS?.replace(":fileid", fileid?.toString()), method: "GET" });
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.data?.code) {
            errorMessage = error.data.code;
        }
        return rejectWithValue(errorMessage);
    }
});

/** @type {object} declare type file */
export const initialFile = {
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

/** @type {object} init state of form info */
export const initialFormInfo = {
    comment: null,
    address: null,
    labaddress: null,
    objective: null,
    siteaddress: null,
    siteid: null,
    labid: null,
    ttemailaddress: null,
    ttcontactphone: null,
    createdby: null,
    primarycontact: null,
    labquoteno: null,
    companyid: null,
    jobno: null,
    lastmodifiedby: null,
    formid: null,
}

/** @type {object} init state of files */
const initialState = {
    loading: false,
    listFilesloading: false,
    formLoading: false,
    reportLoading: false,
    cocs: [],
    files: [],
    samples: [],
    formInfo: initialFormInfo,
    parameters: initialParameter,
    file: initialFile,
    error: "",
    uploadSuccess: false,
    updateSuccess: false,
    removeFilesSuccess: false,
    generateReportSuccess: false,
};

const fileSlice = createSlice({
    name: 'file',
    initialState,
    reducers: {
        setRemoveFilesSuccess: (state, action) => {
            state.removeFilesSuccess = action.payload;
        },
        setUploadSuccess: (state, action) => {
            state.uploadSuccess = action.payload;
        },
        setUpdateSuccess: (state, action) => {
            state.updateSuccess = action.payload;
        },
        clearErrorMessage: (state) => {
            state.error = "";
        },
        clearParametersWithoutCoC: (state, action) => {
            state.parameters = action.payload;
        },
    },
    extraReducers: {
        [getLists.pending.toString()]: (state) => {
            state.listFilesloading = true;
        },
        [getLists.rejected.toString()]: (state, action) => {
            state.listFilesloading = false;
            state.error = action.payload;
        },
        [getLists.fulfilled.toString()]: (state, action) => {
            state.files = action.payload;
            state.listFilesloading = false;
            state.error = "";
        },

        [uploadFiles.pending.toString()]: (state) => {
            state.loading = true;
        },
        [uploadFiles.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [uploadFiles.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.error = "";
        },

        [uploadFileToS3.pending.toString()]: (state) => {
            state.loading = true;
        },
        [uploadFileToS3.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [uploadFileToS3.fulfilled.toString()]: (state, action) => {
            state.file = action.payload;
            state.loading = false;
            state.uploadSuccess = true;
            state.error = "";
        },

        [removeFile.pending.toString()]: (state) => {
            state.loading = true;
        },
        [removeFile.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [removeFile.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.removeFilesSuccess = true;
            state.error = "";
        },

        [generateReportNoCOC.pending.toString()]: (state) => {
            state.loading = true;
        },
        [generateReportNoCOC.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [generateReportNoCOC.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.generateReportSuccess = true;
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

        [getFileSamples.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getFileSamples.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [getFileSamples.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.samples = action.payload;
            state.error = "";
        },

        [getFormLabFile.pending.toString()]: (state) => {
            state.formLoading = true;
        },
        [getFormLabFile.rejected.toString()]: (state, action) => {
            state.formLoading = false;
            state.error = action.payload;
        },
        [getFormLabFile.fulfilled.toString()]: (state, action) => {
            state.formLoading = false;
            state.formInfo = action.payload;
            state.error = "";
        },

        [saveFormLabFile.pending.toString()]: (state) => {
            state.loading = true;
        },
        [saveFormLabFile.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        [saveFormLabFile.fulfilled.toString()]: (state, action) => {
            state.loading = false;
            state.formInfo = action.payload;
            state.updateSuccess = true;
            state.error = "";
        },

    },
});

export const { setRemoveFilesSuccess, setUploadSuccess, setUpdateSuccess, clearErrorMessage, clearParametersWithoutCoC } = fileSlice.actions;

const { reducer: file } = fileSlice;
export default file;