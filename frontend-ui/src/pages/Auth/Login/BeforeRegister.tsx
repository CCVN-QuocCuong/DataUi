import bg_login from 'assets/images/bg-login.png';
import AuthenticationLayout from 'layouts/Authentication'
import './style.css'
import { useHistory } from "react-router-dom";

export function BeforeRegister({ setDisplayLogin }, props) {
  const history = useHistory();
  return (
    <AuthenticationLayout>
      <div className="login-form row">
        <div className="container-left col-6">

          <p className="title">Create <span style={{ color: '#BD202D' }}>Portal Login</span></p>

          <div className="text-br1">
            Take advantage of our testing portal, [Testing Portal Name] designed to meet all your testing requirements. Log testing requests,
            track samples, receive testing progress notifications, and easily access results.
            <p>Let's get started!</p>
          </div>

          <div className="title-br1">
            Are you an existing geotechnics customer?
          </div>

          <div className="text-br2">
            [Add description of existing geotechnics customer here i.e. a company or individual who has a Deltek account, has active project, utilised testing services before etc]
          </div>

          <div className="row">
            <div className="text-left col-6">
              <button type="button" className="btn btn-block btn-outline-danger rounded-0" onClick={() => setDisplayLogin(true)}>Yes</button>
            </div>
            <div className="pull-right col-6">
              <button type="button" className="btn btn-block btn-outline-danger rounded-0" onClick={() => history.push("/register")}>No</button>
            </div>
          </div>
        </div>
        <div className="container-right col-6">
          <img src={bg_login} alt={"bg_login"} />
        </div>
      </div >
    </AuthenticationLayout >
  );
};