import axios from "axios";
import { getToken } from "helpers/webStorage";
import { API_SERVER } from "../constants/config";

axios.defaults.baseURL = API_SERVER;

axios.interceptors.request.use(
    function (axios_config: any) {
        const token = getToken();
        if (axios_config.isAuth && token) {
            axios_config.headers.Authorization = "Bearer " + token;
        }
        return axios_config;
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error);
    }
);

export default axios;
