/* eslint-disable react-hooks/exhaustive-deps */
import AuthenticationLayout from "layouts/Authentication";
import "./style.css";
import { yupResolver } from "@hookform/resolvers/yup";
import { useHistory } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "hooks";
import { useForm } from "react-hook-form";
import { LoginValidation } from "schema/auth";
import { useEffect } from "react";
import { login, setRememberMe } from "store/auth";
import Spinner from 'react-bootstrap/Spinner';
import PATHS from "routes/const";
import azure from "../../../assets/images/azure.png";
import { Auth, Hub } from "aws-amplify";
import { setRefreshToken, setToken } from "helpers/webStorage";

export function Login() {
    const dispatch = useAppDispatch();
    const history = useHistory();

    const [isLoginSuccess, firstTimeResetPasswordData, error, loading] = useAppSelector((state) => [
        state.auth.isLoginSuccess,
        state.auth.firstTimeResetPasswordData,
        state.auth.errorLogin,
        state.auth.loading,
    ]);

    /**
     * Set user, token and redirect to home page
     * @async
     * @param {Object} data
     */
    async function setAccessToken(data) {
        await Auth.currentSession().then(res => {
            localStorage.setItem("user", JSON.stringify({ username: data.username }));
            let token = res.getIdToken().getJwtToken();
            let refreshToken = res.getRefreshToken().getToken();
            setToken(token, false);
            setRefreshToken(refreshToken, false)
            history.push(PATHS.HOMEPAGE);
        })
    }

    useEffect(() => {
        const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
            switch (event) {
                case "signIn":
                    setAccessToken(data)
                    break
            }
        })
        return unsubscribe
    }, [])

    /**
     * Handle login
     * @async
     * @param {Object} data
     */
    const onSubmit = async (data) => {
        const params = {
            username: data.email,
            password: data.password,
            remember: data.remember,
        };
        if (data.email && data.password) {
            await dispatch(setRememberMe(data.remember));
            await dispatch(login(params));
        }
    };

    /**
     * Login by AzureID
     */
    const onAzureLogin = () => {
        Auth.federatedSignIn()
    }

    useEffect(() => {
        if (isLoginSuccess) {
            console.log('history.push 6')
            history.push(PATHS.HOMEPAGE);
        }
    }, [isLoginSuccess]);

    useEffect(() => {
        if (firstTimeResetPasswordData.need_reset) {
            console.log('history.push 7')
            history.push(PATHS.RESET_PASSWORD);
        }
    }, [firstTimeResetPasswordData.need_reset])

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(LoginValidation),
    });

    const username = watch('email');
    const password = watch('password');

    return (
        <AuthenticationLayout>
            <div className="card-body">
                <div className="m-sm-4">
                    <div className="text-center mt-4">
                        <h1 className="h2">
                            Welcome back,
                        </h1>
                        <p className="lead">
                            Sign in to your account to
                            continue
                        </p>
                    </div>
                    <form
                        onSubmit={handleSubmit(
                            onSubmit
                        )}
                        className="center_form"
                    >
                        <div className="error invalid-" style={{ color: 'red' }}>{error}</div>
                        <div className="mb-3">
                            <label className="form-label">
                                Email
                            </label>
                            <input
                                {...register("email")}
                                className={`form-control form-control-lg rounded-0 ${errors.email
                                    ? "is-invalid"
                                    : ""
                                    }`}
                                name="email"
                            />
                            <div className="invalid-feedback">
                                {errors.email?.message}
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">
                                Password
                            </label>
                            <input
                                {...register(
                                    "password"
                                )}
                                type="password"
                                name="password"
                                className={`form-control form-control-lg rounded-0 ${errors.password
                                    ? "is-invalid"
                                    : ""
                                    }`}
                            />
                            <div className="invalid-feedback">
                                {
                                    errors.password
                                        ?.message
                                }
                            </div>
                        </div>
                        <div className="form-group form-check contain-remember-forgot">
                            <input
                                {...register(
                                    "remember"
                                )}
                                className="form-check-input rounded-0"
                                type="checkbox"
                                name="remember"
                                id="remember"
                            />
                            <label
                                className="remember-me"
                                htmlFor="remember"
                            >
                                Remember me
                            </label>
                            <span className="forgot-password forgot-password">
                                Forgot Password?
                            </span>
                        </div>
                        <div className="text-center mt-3">
                            <button
                                onClick={onSubmit}
                                type="submit"
                                className="btn btn-block btn-danger rounded-0 btn-login"
                                disabled={loading || !username || !password}
                            >
                                {loading ? (
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                ) : 'Login'}
                            </button>
                            <div className="btn-primary-login-azure" >
                                <button onClick={onAzureLogin} type="button" className="btn btn-block rounded-0 btn-azure">
                                    <img src={azure} alt="" className="avatar-azure" /> Login with Azure
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticationLayout>
    );
}
