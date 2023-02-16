import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { SendEmailForgotPasswordValidation } from 'schema/auth';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'hooks';
import { sendEmailForgotPassword, clearErrorMessage } from 'store/auth';
import { forgotPasswordSteps } from 'constants/steps';

export function SendEmail({ currentStep }, props) {
    const [
        error,
        isSendEmailForgotPasswordSuccess
    ] = useAppSelector((state) => [
        state.auth.errorSendEmailForgotPassword,
        state.auth.isSendEmailForgotPasswordSuccess
    ]);
    const dispatch = useAppDispatch()
    const {
        register,
        watch,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(SendEmailForgotPasswordValidation)
    });

    useEffect(() => {
        if (isSendEmailForgotPasswordSuccess) {
            currentStep(forgotPasswordSteps.changePassword)
        }
    }, [currentStep, isSendEmailForgotPasswordSuccess])

    const watchEmailChange = watch("email")
    useEffect(() => {
        dispatch(clearErrorMessage())
    }, [dispatch, watchEmailChange]);

    /**
     * Handle send email when forgot passwork
     * @async
     * @param {Object} data
     */
    const onSubmit = async (data) => {
        dispatch(sendEmailForgotPassword(data.email))
    };

    return (
        <form className="forgotpw-form col-6 offset-3" onSubmit={handleSubmit(onSubmit)}>
            <p className="forgotpw-form-header">Enter your email to retrieve your password</p>
            <div className="form-group">
                <label className="form-group-label">Your Email
                    <span style={{ color: '#BD202D' }}> *</span>
                </label>
                <input
                    type="text"
                    {...register('email')}
                    className={`form-control rounded-0 ${errors.email || error ? 'is-invalid' : ''}`}
                    name="email" onKeyDown={(evt) => (evt.key === ' ') && evt.preventDefault()}
                />
                <div className="invalid-feedback">{errors.email?.message}</div>
                <div className="invalid-" style={{ color: 'red' }}>{error}</div>
            </div>
            <div className="form-group text-center" style={{ paddingTop: '10%' }}>
                <button type="submit" className="form-btn-danger btn rounded-0">
                    Next
                </button>
                <div className="text-center" style={{ paddingBottom: '20%', paddingTop: '20px' }}>
                    <Link to="/login" >Back to  Login</Link>
                </div>
            </div>

        </form>
    );
};