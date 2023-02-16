import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import endpoints from "../service/endpoints";
import { authActionType } from "./actionTypes";
import { Auth } from "aws-amplify";

import { setToken, setRefreshToken, removeAll } from 'helpers/webStorage';

import API from "service/api";

/**
 * Function handle action login
 */
export const login = createAsyncThunk(`auth/${authActionType.LOGIN}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: endpoints?.auth?.LOGIN,
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
 * Function handle action send mail forgot password
 */
export const sendEmailForgotPassword = createAsyncThunk(`auth/${authActionType.SEND_EMAIL_FORGOT_PASSWORD}`, async (email: any, { rejectWithValue }) => {
    try {
        const response = await Auth.forgotPassword(email);
        return response.data;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.code) {
            errorMessage =
                error?.code === "UserNotFoundException"
                    ? `This email does not exist.`
                    : "System temporarily blocks the account.";
        }
        return rejectWithValue(errorMessage);
    }
});

/**
 * Function handle action change password when forgot password
 */
export const changePasswordForgotPassword = createAsyncThunk(`auth/${authActionType.CHANGE_PASSWORD_FORGOT_PASSWORD}`, async (data: any, { getState, rejectWithValue }) => {
    try {
        // const email = getState().auth.forgotPasswordData.email;
        const response = await Auth.forgotPasswordSubmit("", data.code, data.password);
        return response;
    } catch (error: any) {
        let errorMessage = "Internal Server Error";
        if (error?.code) {
            errorMessage =
                error?.code === "ExpiredCodeException"
                    ? "This verification has expired."
                    : "This verification code is incorrect.";
        }
        return rejectWithValue(errorMessage);
    }
});

/**
 * Function handle action reset password in first time login
 */
export const firstTimeResetPassword = createAsyncThunk(`auth/${authActionType.FIRST_TIME_RESET_PASSWORD}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({
            url: "/auth/change-password",
            method: "POST",
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
 * Function handle action get infomation of user
 */
export const getMyAccount = createAsyncThunk(`auth/${authActionType.GET_MY_ACCOUNT}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({ url: "/auth/user", method: "GET" });
        return response.data;
    } catch (error: any) {
        const errorMessage = "BadRequest";
        return rejectWithValue(errorMessage);
    }
});

/**
 * Function handle action update infomation of user
 */
export const updateMyAccount = createAsyncThunk(`auth/${authActionType.UPDATE_MY_ACCOUNT}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({ url: "/auth/user", method: "PUT", data });
        return response.data;
    } catch (error: any) {
        const errorMessage = "BadRequest";
        return rejectWithValue(errorMessage);
    }
});

/**
 * Function handle action user change password
 */
export const changePasswordMyAccount = createAsyncThunk(`auth/${authActionType.CHANGE_PASSWORD_MY_ACCOUNT}`, async (data: any, { rejectWithValue }) => {
    try {
        const response = await API({ url: "/auth/change-password", method: "POST", data });
        return response.data;
    } catch (error: any) {
        const errorMessage = error?.code === "InvalidPasswordException"
            ? "The current password is incorrect. Please try again!"
            : "Your password cannot be the same with one of your last 24 previous passwords.";
        return rejectWithValue(errorMessage);
    }
});

/** @type {object} init state of user */
const initialState = {
    token: "",
    refreshToken: "",
    rememberMe: false,
    isLoginSuccess: false,
    isRememberMe: false,
    isSendEmailForgotPasswordSuccess: false,
    isChangePasswordForgotPasswordSuccess: false,
    forgotPasswordData: {
        email: "",
        code: "",
        new_password: "",
    },
    errorLogin: "",
    errorRegister: "",
    errorSendEmailForgotPassword: "",
    errorChangePasswordForgotPassword: "",
    errorFirstTimeChangePassword: "",
    errorFirstTimeResetPassword: "",
    isFirstTimeResetPasswordSuccess: false,
    firstTimeResetPasswordData: {
        password: "",
        new_password: "",
        username: "",
        need_reset: false,
    },
    myAccount: {},
    isUpdateMyAccountSuccess: false,
    errorMyAccount: "",
    isChangePasswordMyAccountSuccess: false,
    errorChangePasswordMyAccount: "",
    loading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.clear();
            removeAll();
            state.isLoginSuccess = false;
            window.location.href = "/login";
        },
        clearErrorMessage: (state) => {
            state.errorLogin = "";
            state.errorRegister = "";
            state.errorSendEmailForgotPassword = "";
            state.errorChangePasswordForgotPassword = "";
            state.errorFirstTimeChangePassword = "";
        },
        setForgotPasswordData: (state, action) => {
            state.forgotPasswordData = action.payload;
        },
        setChangePasswordSuccess: (state, action) => {
            state.isChangePasswordMyAccountSuccess = action.payload;
            state.isChangePasswordForgotPasswordSuccess = action.payload;
        },
        clearUpdateAccountStatus: (state) => {
            state.isUpdateMyAccountSuccess = false;
        },
        setRememberMe: (state, action) => {
            state.rememberMe = action.payload;
        }
    },
    extraReducers: {
        [login.pending.toString()]: (state) => {
            state.loading = true;
        },
        [login.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.errorLogin = action.payload;
        },
        [login.fulfilled.toString()]: (state, action) => {
            if (action.payload?.need_reset) {
                state.firstTimeResetPasswordData = {
                    username: action.payload?.user?.username,
                    password: "",
                    new_password: "",
                    need_reset: true,
                };
            } else {
                localStorage.setItem("user", JSON.stringify(action.payload?.user || {}));
                localStorage.setItem("rememberMe", JSON.stringify(state.rememberMe));

                setToken(action.payload?.access_token, state.rememberMe ? { expires: 30 } : {});
                setRefreshToken(action.payload?.refresh_token, state.rememberMe ? { expires: 30 } : {});

                state.isLoginSuccess = true;
            }
            state.errorLogin = "";
            state.loading = false;
        },

        [sendEmailForgotPassword.pending.toString()]: (state) => {
            state.loading = true;
        },
        [sendEmailForgotPassword.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.errorSendEmailForgotPassword = action.payload;
        },
        [sendEmailForgotPassword.fulfilled.toString()]: (state, action) => {
            state.isSendEmailForgotPasswordSuccess = true;
            state.forgotPasswordData = action.payload;
            state.loading = false;
            state.errorSendEmailForgotPassword = "";
        },

        [changePasswordForgotPassword.pending.toString()]: (state) => {
            state.loading = true;
        },
        [changePasswordForgotPassword.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.errorChangePasswordForgotPassword = action.payload;
        },
        [changePasswordForgotPassword.fulfilled.toString()]: (state, action) => {
            state.isChangePasswordForgotPasswordSuccess = true;
            state.isSendEmailForgotPasswordSuccess = true;
            state.loading = false;
            state.errorChangePasswordForgotPassword = "";
        },

        [firstTimeResetPassword.pending.toString()]: (state) => {
            state.loading = true;
        },
        [firstTimeResetPassword.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.errorFirstTimeResetPassword = action.payload;
        },
        [firstTimeResetPassword.fulfilled.toString()]: (state, action) => {
            state.isFirstTimeResetPasswordSuccess = true;
            state.loading = false;
            state.errorFirstTimeResetPassword = "";
            state.firstTimeResetPasswordData = {
                username: action.payload?.user?.username,
                password: "",
                new_password: "",
                need_reset: false,
            };
        },

        [getMyAccount.pending.toString()]: (state) => {
            state.loading = true;
        },
        [getMyAccount.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.errorMyAccount = action.payload;
        },
        [getMyAccount.fulfilled.toString()]: (state, action) => {
            state.myAccount = action.payload;
            state.loading = false;
            state.errorMyAccount = "";
        },

        [updateMyAccount.pending.toString()]: (state) => {
            state.loading = true;
        },
        [updateMyAccount.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.errorMyAccount = action.payload;
        },
        [updateMyAccount.fulfilled.toString()]: (state, action) => {
            state.myAccount = {
                ...state.myAccount,
                name: action.payload.name,
                phone_number: action.payload.phone_number,
            }
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const newName = action.payload.name;
            const newUser = {
                ...user,
                name: newName,
            };
            localStorage.setItem("user", JSON.stringify(newUser));
            state.loading = false;
            state.errorMyAccount = "";
        },

        [changePasswordMyAccount.pending.toString()]: (state) => {
            state.loading = true;
        },
        [changePasswordMyAccount.rejected.toString()]: (state, action) => {
            state.loading = false;
            state.errorMyAccount = action.payload;
        },
        [changePasswordMyAccount.fulfilled.toString()]: (state, action) => {
            state.isChangePasswordMyAccountSuccess = true;
            state.loading = false;
            state.errorMyAccount = "";
        },

    },
});

export const { logout, clearErrorMessage, setForgotPasswordData, setChangePasswordSuccess, clearUpdateAccountStatus, setRememberMe } = authSlice.actions;

const { reducer: auth } = authSlice;
export default auth;
