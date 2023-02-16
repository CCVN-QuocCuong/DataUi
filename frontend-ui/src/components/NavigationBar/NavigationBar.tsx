import { useAppSelector } from "hooks";
import { useState } from "react";
import { Link } from "react-router-dom";
import PATHS from "routes/const";
import "./style.css";

/**
 * Component to display navigation in sidebar
 */
export const NavigationBar = () => {
    const [showSubMenu, setShowSubMenu] = useState(false);
    const currentRoute = useAppSelector((state) => state.app.currentRoute);

    const checkActive = (path) => {
        return currentRoute === path
    }

    const toggleSubMenu = () => {
        setShowSubMenu(!showSubMenu);
    };

    const isShowSubmenu = currentRoute === PATHS.COC_LIST_SOIL || currentRoute === PATHS.COC_LIST_LIQUID || currentRoute === PATHS.COC_LIST_GAS
    return (
        <>
            <li
                className={`sidebar-item ${checkActive(PATHS.HOMEPAGE) || checkActive(PATHS.CREATE_COC) ? "active" : ""
                    }`}
            >
                <Link className="sidebar-link" to={PATHS.HOMEPAGE}>Sample Scheduling</Link> 
            </li>
            <li
                className={`sidebar-item have-submenu ${isShowSubmenu ? "active" : ""
                    }`}
            >
                <div className="sidebar-link dropdown-toggle" onClick={() => toggleSubMenu()}><span>Sample Processing</span></div>
                <ul className={`submenu ${showSubMenu || isShowSubmenu ? "show-menu" : ""}`}>
                    <li
                        className={`sidebar-item ${checkActive(PATHS.COC_LIST_SOIL) ? "active" : ""
                            }`}
                    >
                        <Link className="sidebar-link" to={PATHS.COC_LIST_SOIL}>Soil</Link>
                    </li>
                    <li
                        className={`sidebar-item ${checkActive(PATHS.COC_LIST_LIQUID) ? "active" : ""
                            }`}
                    >
                        <Link className="sidebar-link" to={PATHS.COC_LIST_LIQUID}>Liquid</Link>
                    </li>
                    <li
                        className={`sidebar-item ${checkActive(PATHS.COC_LIST_GAS) ? "active" : ""
                            }`}
                    >
                        <Link className="sidebar-link" to={PATHS.COC_LIST_GAS}>Gas</Link>
                    </li>
                </ul>
            </li>
            <li
                className={`sidebar-item ${checkActive(PATHS.RESULT_TABLE_COC) ? "active" : ""
                    }`}
            >
                <Link className="sidebar-link" to={PATHS.RESULT_TABLE_COC}>Result Table (With CoC)</Link>
            </li>
            <li
                className={`sidebar-item ${checkActive(PATHS.RESULT_TABLE_NO_COC) ? "active" : ""
                    }`}
            >
                <Link className="sidebar-link" to={PATHS.RESULT_TABLE_NO_COC}>Result Table (Without CoC)</Link>
            </li>
            <li
                className={`sidebar-item ${checkActive(PATHS.MAP) ? "active" : ""
                    }`}
            >
                <Link className="sidebar-link" to={PATHS.MAP}>Generate Exceedance Map</Link>
            </li>
            <li
                className={`sidebar-item ${checkActive(PATHS.PHOTO_LIST) ? "active" : ""
                    }`}
            >
                <Link className="sidebar-link" to={PATHS.PHOTO_LIST}>Photo List</Link>
            </li>
            <li
                className={`sidebar-item ${checkActive(PATHS.FIELD_OBSERVATIONS) ? "active" : ""
                    }`}
            >
                <Link className="sidebar-link" to={PATHS.FIELD_OBSERVATIONS}>Field Observations</Link>
            </li>
        </>
    );
};
