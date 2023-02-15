import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import endpoints from "../service/endpoints";
import { sampleActionType } from "./actionTypes";

import API from "service/api";

/**
 * Function handle action get list samples
 */
export const getLists = createAsyncThunk(`sample/${sampleActionType.GET_LIST}`, async (data: any, { rejectWithValue }) => {
  try {
    const response = await API({
      url: endpoints?.sample?.FILTER,
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
 * Function handle action get list samples generated in COC
 */
export const getListsGenerated = createAsyncThunk(`sample/${sampleActionType.GET_LIST_GENERATED}`, async (_, { rejectWithValue }) => {
  try {
    const response = await API({
      url: endpoints?.sample?.LIST_GENERATED, method: "GET"
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
 * Function handle action search samples by params
 */
export const search = createAsyncThunk(`sample/${sampleActionType.SEARCH}`, async (data: any, { rejectWithValue }) => {
  try {
    const response = await API({
      url: endpoints?.sample?.SEARCH,
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
 * Function handle action search samples by params
 */
export const searchSamples = createAsyncThunk(`sample/${sampleActionType.SEARCH_SAMPLES}`, async (data: any, { rejectWithValue }) => {
  try {
    const response = await API({
      url: endpoints?.sample?.SEARCH,
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
 * Function handle action get detail sample by ID
 */
export const getSampleByID = createAsyncThunk(`sample/${sampleActionType.GET_BY_ID}`, async (data: any, { rejectWithValue }) => {
  try {
    const response = await API({
      url: `${endpoints?.sample?.SINGLE_SAMPLE}?id=${data.sampleId}&barcode=${data.barcode}`,
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
 * Function handle action update infomation of sample
 */
export const singleSample = createAsyncThunk(`sample/${sampleActionType.EDIT_SAMPLE}`, async (data: any, { rejectWithValue }) => {
  try {
    const response = await API({
      url: endpoints?.sample?.SINGLE_SAMPLE,
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
 * Function handle action assign test type to sample
 */
export const assignTestTypeToSample = createAsyncThunk(`sample/${sampleActionType.ASSIGN_TEST_TYPE}`, async (data: any, { rejectWithValue }) => {
  try {
    const response = await API({
      url: endpoints?.sample?.ASSIGN_TEST_TYPE,
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
 * Function handle action get list all samples name
 */
export const getListSampleNames = createAsyncThunk(`sample/${sampleActionType.GET_LIST_NAME}`, async (_, { rejectWithValue }) => {
  try {
    const response = await API({
      url: endpoints?.sample?.SAMPLE_NAME,
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

/** @type {object} init state of sample */
export const initialSample = {
  sampleid: "",
  createdby: "",
  collectiondate: "",
  jobnumber: "",
  siteid: "",
  siteaddress: "",
  duplicatename: "",
  fromdepth: null,
  todepth: null,
  sampletype: "",
  samplematerialtype: "",
  containertype: "",
  barcode: "",
  pointname: "",
  objective: "",
  objectiveother: "",
  testidlist: "",
  teststringlist: "",
};

/** @type {object} init state of pagination */
export const pagination = {
  page: 1,
  pageSize: 10,
  total: 0,
};

/** @type {object} declare type sample */
type Sample = {
  [key: string]: any;
};

/** @type {object} declare type samples */
export const sampleLists: Sample[] = [];

/** @type {object} init state of samples */
const initialState = {
  loading: false,
  loadingDetail: false,
  listLoading: false,
  dataTabs: [],
  samples: sampleLists,
  samplesGenerated: sampleLists,
  sampleslist: sampleLists,
  sample: initialSample,
  isLoadSampleSuccess: true,
  isAddSampleSuccess: false,
  isEditSampleSuccess: false,
  isAssignTestTypeSuccess: false,
  errorAddSample: "",
  errorEditSample: "",
  errorAssignTestType: "",
  error: "",
  pagination: pagination,
  sampleNames: [],
  listSamplesSeleted: sampleLists,
};

const sampleSlice = createSlice({
  name: 'sample',
  initialState,
  reducers: {
    setAssignTestTypeSuccess: (state, action) => {
      state.isAssignTestTypeSuccess = action.payload;
    },

    setEditSuccess: (state, action) => {
      state.isEditSampleSuccess = action.payload;
    },

    clearErrorMessage: (state) => {
      state.errorAddSample = "";
      state.errorEditSample = "";
      state.errorAssignTestType = "";
      state.error = "";
    },

    setListSamplesSeleted: (state, action) => {
      state.listSamplesSeleted = action?.payload || [];
    },

    resetPagination: (state) => {
      state.pagination = pagination;
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
      state.samples = action.payload?.data?.items || [];
      state.pagination = {
        page: action.payload?.page || 1,
        pageSize: action.payload?.pagesize || 10,
        total: action.payload?.total || 0,
      };
      state.listLoading = false;
      state.error = "";
    },

    [getListsGenerated.pending.toString()]: (state) => {
      state.listLoading = true;
    },
    [getListsGenerated.rejected.toString()]: (state, action) => {
      state.listLoading = false;
      state.error = action.payload;
    },
    [getListsGenerated.fulfilled.toString()]: (state, action) => {
      state.samplesGenerated = action.payload;
      state.listLoading = false;
      state.error = "";
    },

    [search.pending.toString()]: (state) => {
      state.listLoading = true;
    },
    [search.rejected.toString()]: (state, action) => {
      state.listLoading = false;
      state.error = action.payload;
    },
    [search.fulfilled.toString()]: (state, action) => {
      state.samples = action.payload;
      state.listLoading = false;
      state.error = "";
    },

    [searchSamples.pending.toString()]: (state) => {
      state.loading = true;
    },
    [searchSamples.rejected.toString()]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [searchSamples.fulfilled.toString()]: (state, action) => {
      state.sampleslist = action.payload;
      state.loading = false;
      state.error = "";
    },

    [getSampleByID.pending.toString()]: (state) => {
      state.loadingDetail = true;
    },
    [getSampleByID.rejected.toString()]: (state, action) => {
      state.loadingDetail = false;
      state.error = action.payload;
    },
    [getSampleByID.fulfilled.toString()]: (state, action) => {
      state.sample = action.payload;
      state.loadingDetail = false;
      state.error = "";
    },

    [singleSample.pending.toString()]: (state) => {
      state.loading = true;
    },
    [singleSample.rejected.toString()]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    [singleSample.fulfilled.toString()]: (state, action) => {
      state.isEditSampleSuccess = true;
      state.loading = false;
      state.error = "";
    },

    [assignTestTypeToSample.pending.toString()]: (state) => {
      state.loading = true;
      state.errorAssignTestType = "";
    },
    [assignTestTypeToSample.rejected.toString()]: (state, action) => {
      state.loading = false;
      state.errorAssignTestType = action.payload;
    },
    [assignTestTypeToSample.fulfilled.toString()]: (state, action) => {
      state.sample = action.payload;
      state.loading = false;
      state.isAssignTestTypeSuccess = true;
      state.errorAssignTestType = "";
    },

    [getListSampleNames.pending.toString()]: (state) => {
      state.listLoading = true;
    },
    [getListSampleNames.rejected.toString()]: (state, action) => {
      state.listLoading = false;
      state.error = action.payload;
    },
    [getListSampleNames.fulfilled.toString()]: (state, action) => {
      state.sampleNames = action.payload || [];
      state.listLoading = false;
      state.error = "";
    },
  },
});


export const { setAssignTestTypeSuccess, clearErrorMessage, setEditSuccess, setListSamplesSeleted, resetPagination } = sampleSlice.actions;

const { reducer: sample } = sampleSlice;
export default sample;