const API_ENDPOINTS = {
    auth: {
        REGISTER: "/auth/register",
        LOGIN: "/auth/login",
    },
    user: {
        LIST: "/business/users",
        USER_CREATE: "/business/users/add",
    },
    sample: {
        LIST: "/samples",
        LIST_GENERATED: "/samples/generated",
        ASSIGN_TEST_TYPE: "sample/assign",
        SEARCH: "/samples/search",
        SINGLE_SAMPLE: "/sample",

        /*New API */
        FILTER: "/samples/filter",
        SAMPLE_NAME: "/samples/names"
    },
    test_type: {
        LIST: "/testtypes",
    },
    coc: {
        LIST: "/cocs",
        SEARCH: "/cocs/search",
        COC_CREATE: "/coc",
        SINGLE_COC: "/coc",
        UPLOAD_FILE: "/coc/upload-file-url",
        FILE_DETAIL: "/coc/detail/",
        ACCEPT_MAPPING: "/coc/mapping/accept",
        REJECT_MAPPING: "/coc/mapping/reject/",
        GET_REPORT_PARAMETERS: "/coc/:id/report/paramaters",

        /*New API */
        FILTER: "/coc/filter",
        GET_MAPPING: "coc/mapping/:id",
    },
    code: {
        LIST: "/codes",
        LIST_ADDITIONAL: "/additionalcode/region",
    },
    parameter: {
        LIST: "/criterias",
        LIST_OF_REGION: "/criterias/region"
    },
    file: {
        LIST: "/noncoc/files",
        UPLOAD_FILE: "/noncoc/upload-file-url",
        REMOVE_FILE: "/noncoc/:fileid",
        GENERATE_REPORT: "/noncoc/:fileid/report/generate",
        TRANSFORM_FILE: "/noncoc/detail/:filename/:uploadby",
        DETAIL_FILE: "/noncoc/download/:fileid",
        GET_REPORT_PARAMETERS: "/noncoc/:fileid/report/paramaters",
        GET_FORM_LAB_FILE: "/noncoc/:fileid/form",
        SAVE_FORM_LAB_FILE: "/noncoc/:fileid/form",
        GET_FILE_SAMPLES: "/noncoc/:fileid/samples",
    },
    photo: {
        LIST_IN_COC: "/photo/:id/coc",
        LIST: "/photo/search",
        SEARCH: "/photo/search",
        DETAIL_PHOTO: "/photo/download",
        EXPORT_PHOTO: "photo/export_docx",

        /*New API */
        FILTER: "/photo/filter",
    },
    notification: {
        LIST: "/notification",
        DETAIL_NOTIFICATION: "/notification/:id",
        MARK_NOTIFICATION: "/notification/:id/mark"
    }
};

export default API_ENDPOINTS;
