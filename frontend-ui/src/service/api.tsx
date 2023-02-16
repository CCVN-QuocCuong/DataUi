import { getRefreshToken, removeAll, setToken } from "helpers/webStorage";
import { toast } from "react-toastify";
import PATHS from "routes/const";
import axios from "./axios";

type Object = {
    [key: string]: any;
};

let isRefreshing = false;

let requests: any[] = [];

const API: any = async ({
    url,
    method,
    responseType,
    data,
    cancelToken,
    params,
    headers,
    isAuth = true,
}) => {
    let axiosRequestObject = {
        method,
        url,
        data,
        headers,
        responseType,
        params,
        isAuth,
        ...(cancelToken
            ? {
                cancelToken,
            }
            : ""),
    };

    //REQUEST

    let request = await axios
        .request(axiosRequestObject)
        .then(handleSuccessRequest)
        .catch((err) => handleErrorRequest(err, axiosRequestObject));

    return request;
};


/**
 * Function handle request api success
 * @param {object} response
 */
const handleSuccessRequest = (response) => ({
    status: response.status,
    data: response.data,
});

/**
 * Function handle request api error
 * @param {object} error
 * @param {object} axiosRequestObject
 */
const handleErrorRequest = async (error: Object, axiosRequestObject: Object) => {
    const rememberMe = localStorage.getItem("rememberMe");
    if (!error.response) {
        toast.error("Internal Server Error");
        return Promise.reject();
    } else if (error.response?.status === 401) {
        const originalRequest = error.config;
        if (!originalRequest._retry) {
            originalRequest._retry = true;
            if (!isRefreshing) {
                isRefreshing = true;
                const refreshToken = await getRefreshToken();
                if (refreshToken) {
                    let axiosRequestRefreshTokenObject: Object = {
                        ...axiosRequestObject,
                        method: "POST",
                        url: "/auth/refresh-token",
                        data: { "refresh_token": refreshToken },
                    };

                    return axios
                        .request(axiosRequestRefreshTokenObject)
                        .then(async (res: Object) => {
                            setToken(res?.data?.access_token || null, rememberMe === 'true' ? { expires: 30 } : {});
                            originalRequest.headers.Authorization = `Bearer ${res?.data?.access_token}`;

                            requests.forEach(cb => cb(res?.data?.access_token))
                            requests = []

                            return axios
                                .request(originalRequest)
                                .then(handleSuccessRequest)
                                .catch((err) => handleErrorRequest(err, originalRequest));
                        }).catch((_error) => {
                            removeAll();
                            console.log(PATHS.LOGIN)
                        }).finally(() => {
                            isRefreshing = false
                        })
                }
            } else {
                return new Promise((resolve) => {
                    requests.push((token) => {
                        originalRequest.headers.Authorization = token;
                        resolve(axios
                            .request(originalRequest)
                            .then(handleSuccessRequest)
                            .catch((err) => handleErrorRequest(err, originalRequest)));
                    });
                })
            }
        }
        // removeAll();
    } else {
        let errorMessage = "Internal Server Error";
        if (error.response?.data?.code) {
            errorMessage = error.response.data.code;
        }
        if (!axiosRequestObject?.data?.password && !axiosRequestObject?.data?.username) {
            toast.error(errorMessage);
        }
        return Promise.reject(error.response);
    }
};

export default API;
