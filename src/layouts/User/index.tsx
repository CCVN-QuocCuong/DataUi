import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import LoadingOverlay from "react-loading-overlay-ts";
import { useAppDispatch, useAppSelector } from "hooks";
import { logout } from "store/auth";
/* Todo */
import Notification from "components/Notification";
import NavigationBar from "components/NavigationBar";
import avatar from "assets/images/avatar.png";
import logo from "assets/images/logo.png";
import "./style.css";
import { setCurrentRoute } from "store/app";

/**
 * Layout for User
 * @param {object} props
 */
function UserLayout(props) {
    const dispatch = useAppDispatch();
    const { isPrint } = useAppSelector((state) => state.coc);
    const [isShowMenu, setIsShowMenu] = useState(true);
    const { children } = props;

    useEffect(() => {
        const data = localStorage.getItem('CURRENT_ROUTE');
        if (data !== null) dispatch(setCurrentRoute(JSON.parse(data)))
    }, []);

    /**
     * Function handle action toggle sidebar menu
     */
    const toggleMenu = () => {
        setIsShowMenu(!isShowMenu);
    };

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    /**
     * Function handle action logout
     */
    const onLogout = () => {
        dispatch(logout());
    };

    return (
        <LoadingOverlay active={false} spinner>
            <div className="wrapper">
                <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
                <nav
                    id="sidebar"
                    className={`sidebar js-sidebar ${isShowMenu ? "" : "collapsed"
                        }`}
                >
                    <div className="sidebar-blur" style={{ display: isPrint ? 'block' : 'none' }} />
                    <div className="sidebar-content js-simplebar">
                        <Link className="sidebar-brand" to="/">
                            <img width="200px" src={logo} alt="logo" />
                        </Link>
                        <ul className="sidebar-nav">
                            <NavigationBar />
                        </ul>
                    </div>
                </nav>

                <div className={`main ${isShowMenu ? "" : "menu-collapsed"
                    }`} style={{ backgroundColor: "white" }}>
                    <nav className="navbar navbar-expand navbar-light navbar-bg">
                        <span
                            className="sidebar-toggle js-sidebar-toggle"
                            onClick={() => toggleMenu()}
                        >
                            <i className="hamburger align-self-center"></i>
                        </span>

                        <div className="navbar-collapse collapse">
                            <ul className="navbar-nav navbar-align">
                                <li className="nav-item dropdown item-notification">
                                    <Notification />
                                </li>
                                <li className="nav-item dropdown">
                                    <span
                                        className="nav-icon dropdown-toggle"
                                        id="alertsDropdown"
                                        data-bs-toggle="dropdown"
                                    ></span>
                                </li>
                                <li className="nav-item dropdown">
                                    <NavDropdown
                                        id="nav-dropdown-dark-example"
                                        title={
                                            <b className="">
                                                <img
                                                    src={avatar}
                                                    alt=""
                                                    className="avatar"
                                                />{" "}
                                                {currentUser?.username || ""}
                                            </b>
                                        }
                                    >
                                        <NavDropdown.Item
                                            onClick={() => onLogout()}
                                        >
                                            Logout
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    <main className="content content-fluid">
                        <div className="container-fluid">{children}</div>
                    </main>

                    <footer className="footer">
                        <div className="container-fluid">
                            <div className="row text-muted">
                                <div className="col-6 text-start">
                                    <p className="mb-0">
                                        <Link className="text-muted" to="/">
                                            <strong>DATA UI</strong>
                                        </Link>{" "}
                                        &copy;
                                    </p>
                                </div>
                                <div className="col-6 text-end">
                                    <ul className="list-inline">
                                        <li className="list-inline-item">
                                            <Link className="text-muted" to="/">
                                                Support
                                            </Link>
                                        </li>
                                        <li className="list-inline-item">
                                            <Link className="text-muted" to="/">
                                                Help Center
                                            </Link>
                                        </li>
                                        <li className="list-inline-item">
                                            <Link className="text-muted" to="/">
                                                Privacy
                                            </Link>
                                        </li>
                                        <li className="list-inline-item">
                                            <Link className="text-muted" to="/">
                                                Terms
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </LoadingOverlay>
    );
}

export default UserLayout;
