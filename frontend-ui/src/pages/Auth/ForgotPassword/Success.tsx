import { useAppDispatch } from 'hooks'
import { useHistory } from "react-router-dom";
import { setChangePasswordSuccess } from 'store/auth';

export function Success({ currentStep }) {
  const history = useHistory();
  const dispatch = useAppDispatch()

  /**
   * Go to login when change passwork success
   * @async
   */
  const onGoToLogin = async () => {
    dispatch(setChangePasswordSuccess(false))
    console.log('history.push 5')
    history.push("/login")
  };


  return (
    <div className="forgotpw-success text-center">
      <p className="forgotpw-success-title">Congratulations!</p>
      <p className="forgotpw-success-text">Password is reset successfully.</p>
      <p className="forgotpw-success-text">Please log in with new password.</p>
      <div className="form-group text-center" style={{ padding: '5%' }}>
        <button className="btn btn-outline-danger rounded-0" onClick={() => onGoToLogin()}>
          Log in
        </button>
      </div>

    </div>
  );
};