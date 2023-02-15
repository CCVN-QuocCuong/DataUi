import { useAppSelector } from "hooks";
import LoadingOverlay from "react-loading-overlay-ts";
import logo from "assets/images/logo.png";
import "./style.css";

/**
 * Layout for Authentication
 * @param {object} props
 */
function AuthenticationLayout(props) {
    const [isLoading] = useAppSelector((state) => [state.app.isLoading]);
    const { children } = props;
    return (
        <LoadingOverlay active={isLoading} spinner text="Loading...">
            <div className="authentication-container">
                <main className="d-flex w-100 login-form">
                    <div className="container d-flex flex-column">
                        <div className="row vh-100">
                            <div className="col-sm-10 col-md-8 col-lg-6 mx-auto d-table h-100">
                                <div className="d-table-cell align-middle">
                                    <div className="text-center mt-4">
                                        <img src={logo} alt="logo" />
                                    </div>
                                    <div
                                        className="card"
                                        style={{ marginTop: "30px" }}
                                    >{children}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </LoadingOverlay>
    );
}

export default AuthenticationLayout;
