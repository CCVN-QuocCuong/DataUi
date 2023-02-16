/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { useHistory } from "react-router-dom";
import { yupResolver } from '@hookform/resolvers/yup';
import { FirstTimeResetPasswordValidation } from 'schema/auth'
import { useAppDispatch, useAppSelector } from 'hooks'
import AuthenticationLayout from 'layouts/Authentication'
import { firstTimeResetPassword } from 'store/auth'
import Spinner from 'react-bootstrap/Spinner';
import PATHS from "routes/const";
import './style.css'

export function FirstTimeResetPassword() {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const [error, firstTimeResetPasswordData, isFirstTimeResetPasswordSuccess, loading] = useAppSelector((state) => [
    state.auth.errorFirstTimeResetPassword,
    state.auth.firstTimeResetPasswordData,
    state.auth.isFirstTimeResetPasswordSuccess,
    state.auth.loading,
  ]);

  useEffect(() => {
    if (!firstTimeResetPasswordData.username) {
      console.log('history.push 3')
      history.push(PATHS.LOGIN);
    }
  }, [firstTimeResetPasswordData.username]);

  useEffect(() => {
    if (isFirstTimeResetPasswordSuccess) {
      console.log('history.push 4')
      history.push(PATHS.LOGIN);
    }
  }, [isFirstTimeResetPasswordSuccess]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(FirstTimeResetPasswordValidation)
  });

  /**
   * Handle first time reset password
   * @async
   * @param {Object} data
   */
  const onSubmit = async (data) => {
    const params = {
      username: firstTimeResetPasswordData.username,
      new_password: data.new_password,
      old_password: data.password,
    }
    dispatch(firstTimeResetPassword(params))
  };

  const new_password = watch('new_password');
  const confirmPassword = watch('confirmPassword');
  return (
    <AuthenticationLayout>
      <div className="card-body">
        <div className="m-sm-4">
          <div className="text-center mt-4">
            <h1 className="h2">
              Change Password
            </h1>
            <p className="lead">
              Please change your password the first time you log in
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="center_form">
            <div className="error invalid-" style={{ color: 'red' }}>{error}</div>

            <div className="form-group login-form">
              <label>Email:</label>
              <span> {firstTimeResetPasswordData.username}</span>
            </div>

            <hr />

            <div className="form-group login-form">
              <label>Enter Current Password <span style={{ color: "#BD202D" }}>*</span></label>
              <input
                type="password"
                {...register('password')}
                className={`form-control rounded-0 ${errors.password ? 'is-invalid' : ''}`}
                name="password"
              />
              <div className="invalid-feedback">{errors.password?.message}</div>
            </div>

            <div className="form-group login-form">
              <label>Enter New Password <span style={{ color: "#BD202D" }}>*</span></label>
              <input
                type="password"
                {...register('new_password')}
                className={`form-control rounded-0 ${errors.new_password ? 'is-invalid' : ''}`}
                name="new_password"
              />
              <div className="invalid-feedback">{errors.new_password?.message}</div>
            </div>

            <div className="form-group login-form">
              <label>Re-enter New Password <span style={{ color: "#BD202D" }}>*</span></label>
              <input
                type="password"
                {...register('confirmPassword')}
                className={`form-control rounded-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                name="confirmPassword"
              />
              <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
            </div>

            <button type="submit" className="btn btn-block btn-danger rounded-0 mt-3 btn-change-pass" disabled={loading || !new_password || !confirmPassword}>
              {loading ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : 'Submit'}
            </button>
          </form>
        </div>
      </div >
    </AuthenticationLayout >
  )
};