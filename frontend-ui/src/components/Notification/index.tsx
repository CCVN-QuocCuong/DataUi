import { useEffect, useState } from "react";
import { Form, NavDropdown } from "react-bootstrap";
import { useHistory, useParams } from "react-router-dom";
import moment from "moment-timezone";
import { getLists, markNotification } from "store/notification";
import { useAppDispatch, useAppSelector } from "hooks";
import PATHS from "routes/const";
import { setCurrentRoute } from "store/app";

type Object = {
    [key: string]: any;
};

/**
 * Component to display popup notification
 */
export default function Notification() {

    const dispatch = useAppDispatch();
    const history = useHistory();
    const { id } = useParams();
    const { notifications } = useAppSelector((state) => state.notification);
    const [notificationFilter, setNotificationFilter] = useState<string>('unread');
    const [listMessage, setListMessage] = useState<Object[]>([]);
    const currentRoute = localStorage.getItem("currentRoute") || "homepage";

    /**
     * handle when click notifi
     * @async
     * @param {Object} data
     */
    const handleClickNotifi = async (data) => {
        if (!data?.isread) {
            await dispatch(markNotification(data?.ttcl_notificationid || "0"));
        }

        if (data?.cocid) {
            if (currentRoute !== PATHS.RESULT_TABLE_COC || id !== data?.cocid) {
                const path = `${PATHS.RESULT_TABLE_COC}/${data?.cocid}`
                console.log('history.push 1')
                history.push(path);
                dispatch(setCurrentRoute(path));
            } else {
                dispatch(getLists());
            }
        } else if (data?.fileid) {
            if (currentRoute !== PATHS.RESULT_TABLE_NO_COC) {
                console.log('history.push 2')
                history.push(PATHS.RESULT_TABLE_NO_COC);
                dispatch(setCurrentRoute(PATHS.RESULT_TABLE_NO_COC));
            } else {
                dispatch(getLists());
            }
        }
    }

    useEffect(() => {
        if (notificationFilter === 'unread') {
            const listNotifications = notifications?.filter((it: Object) => it?.isread === false);
            setListMessage(listNotifications);
        } else {
            setListMessage(notifications);
        }
    }, [notificationFilter, notifications]);

    useEffect(() => {
        dispatch(getLists());
    }, []);

    return (
        <NavDropdown
            id="nav-dropdown-notification"
            title={
                <span
                    className="nav-icon dropdown-toggle"
                    id="alertsDropdown"
                    data-bs-toggle="dropdown"
                >
                    <div className="position-relative">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-bell align-middle"
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <span className="indicator">{notifications?.filter((it: Object) => it?.isread === false)?.length || 0}</span>
                    </div>
                </span>
            }
        >
            <div className="dropdown-title">Notification</div>
            <div className="notification-filter">
                <Form.Check
                    inline
                    label="Unread"
                    name="notification"
                    type="radio"
                    checked={notificationFilter === 'unread'}
                    id="inline-radio-unread"
                    onChange={() => setNotificationFilter('unread')}
                />
                <Form.Check
                    inline
                    label="All"
                    name="notification"
                    type="radio"
                    id="inline-radio-all"
                    checked={notificationFilter === 'all'}
                    onChange={() => setNotificationFilter('all')}
                />
            </div>
            <div className="notification-content">
                {listMessage?.length > 0 ?
                    listMessage?.map((item: Object) => (
                        <NavDropdown.Item key={item?.ttcl_notificationid} onClick={() =>
                            handleClickNotifi(item)
                        }>
                            <span className="notification-message">{item?.message || ""}</span>
                            <span className="notification-datetime">{moment
                                .tz(item?.lastmodified + "Z", "NZ")
                                .format("MM-DD-YYYY HH:mm:ss")}</span>
                        </NavDropdown.Item>
                    )) : (
                        <NavDropdown.Item>
                            You don't have any notifications
                        </NavDropdown.Item>
                    )
                }
            </div>
        </NavDropdown>
    );
}