import { useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ChangePasswordForgotPasswordValidation } from 'schema/auth';
import './style.css';
import { useAppDispatch, useAppSelector } from 'hooks';
import { sendEmailForgotPassword, changePasswordForgotPassword, clearErrorMessage } from 'store/auth';
import { forgotPasswordSteps } from 'constants/steps';

export function ChangePassword({ currentStep }, props) {
  const [
    error,
    isChangePasswordForgotPasswordSuccess,
    emailForgotPassword
  ] = useAppSelector((state) => [
    state.auth.errorChangePasswordForgotPassword,
    state.auth.isChangePasswordForgotPasswordSuccess,
    state.auth.forgotPasswordData.email
  ]);
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (isChangePasswordForgotPasswordSuccess) {
      currentStep(forgotPasswordSteps.success)
    }
  }, [currentStep, isChangePasswordForgotPasswordSuccess])

  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(ChangePasswordForgotPasswordValidation)
  });

  const watchCodeChange = watch("code")

  useEffect(() => {
    dispatch(clearErrorMessage())
  }, [dispatch, watchCodeChange]);

  
  /**
   * Handle change passwork
   * @async
   * @param {Object} data
   */
  const onSubmitChangePassword = async (data) => {
    dispatch(changePasswordForgotPassword(data))
  };

  
  /**
   * Handle send email when forgot passwork
   * @async
   */
  const onResendEmail = async () => {
    dispatch(sendEmailForgotPassword(emailForgotPassword))
  };

  return (
    <form className="forgotpw-form col-6 offset-3" onSubmit={handleSubmit(onSubmitChangePassword)}>
      <h4 className="forgotpw-form-header"><strong>Reset Password</strong></h4>
      <div className="form-group">
        <label>Verify Code
          <span style={{ color: '#BD202D' }}> *</span>
        </label>
        <input
          type="text"
          {...register('code')}
          className={`form-control rounded-0 ${errors.code || error ? 'is-invalid' : ''}`}
          name="code"
        />
        <div className="invalid-feedback">{errors.code?.message}</div>
        <div className="invalid-feedback" style={{ color: 'red' }}>{error}</div>
        <p className="helper-text">Check the confirmation code in your email</p>
        <p className="helper-text">Haven't received the confirmation code? <span style={{ color: '#BD202D', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onResendEmail()}><strong>Resend</strong></span></p>
      </div>
      <div className="form-group">
        <label>Password
          <span style={{ color: '#BD202D' }}> *</span>
        </label>
        <input
          type="password"
          {...register('password')}
          className={`form-control rounded-0 ${errors.password ? 'is-invalid' : ''}`}
          name="password"
        />
        <div className="invalid-feedback">{errors.password?.message}</div>
        <p className="helper-text">Password must be at least 8 characters and contain at least three out of the following: upper case letter, lower case letter, number, and special character.</p>
      </div>
      <div className="form-group">
        <label>Confirm Password
          <span style={{ color: '#BD202D' }}> *</span>
        </label>
        <input
          type="password"
          {...register('confirmPassword')}
          className={`form-control rounded-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
          name="confirmPassword"
        />
        <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
      </div>
      <div className="form-group text-center" style={{ paddingTop: '10%' }}>
        <button type="submit" className="btn form-btn-danger rounded-0 not-hover">
          Submit
        </button>
        <div className="text-center" style={{ paddingBottom: '20%', paddingTop: '20px' }}>
        </div>
      </div>

    </form>
  );
};