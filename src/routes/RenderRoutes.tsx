import { lazy } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import { getToken } from 'helpers/webStorage';
import PATHS from "./const";
import { useDispatch } from "react-redux";
import { setCurrentRoute } from "store/app";

const Home = lazy(() => import("pages/SampleProcessing"));
const CreateCOCForm = lazy(() => import("pages/GenerateCOC/CreateCOCForm"));
const EditCOCForm = lazy(() => import("pages/GenerateCOC/EditCOCForm"));
const COCList = lazy(() => import("pages/COCList"));
const MyAccount = lazy(() => import("pages/MyAccount"));
const Login = lazy(() => import("pages/Auth/Login"));
const ResetPassword = lazy(() => import("pages/Auth/FirstTimeResetPassword"));
const ForgotPassword = lazy(() => import("pages/Auth/ForgotPassword"));
const PhotoList = lazy(() => import("pages/PhotoList"));
const ResultTableWithoutCOC = lazy(() => import("pages/ResultTableWithoutCOC"));
const Map = lazy(() => import("pages/Map"));
const ResultTableCOC = lazy(() => import("pages/ResultTableCOC"));
const ResultTableCOCDetail = lazy(() => import("pages/ResultTableCOCDetail"));

const CommingSoon = lazy(() => import("pages/CommingSoon"));

/**
 * Declare type route
 */
type routeItem = {
    path: string;
    title: string;
    key: string;
    exact: boolean;
    component: Function;
    requiredAuth: boolean;
    name: string;
    computedMatch?: any
};

/**
 * Declare type routes
 */
type routes = routeItem & {
    routes?: routeItem[];
};

/**
 * Declare routes
 */
const ROUTES: routes[] = [
    {
        path: PATHS.HOMEPAGE,
        title: "DATA UI",
        key: "ROOT",
        exact: true,
        component: Home,
        routes: [],
        requiredAuth: true,
        name: "homepage",
    },
    {
        path: PATHS.CREATE_COC,
        title: "DATA UI | Create COC",
        key: "ROOT",
        exact: true,
        component: CreateCOCForm,
        routes: [],
        requiredAuth: true,
        name: "create-coc",
    },
    {
        path: PATHS.EDIT_COC,
        title: "DATA UI | Edit COC",
        key: "ROOT",
        exact: true,
        component: EditCOCForm,
        routes: [],
        requiredAuth: true,
        name: "edit-coc",
    },
    {
        path: PATHS.LIST_COC,
        title: "DATA UI | List COC",
        key: "ROOT",
        exact: true,
        component: COCList,
        routes: [],
        requiredAuth: true,
        name: "list-coc",
    },
    {
        path: PATHS.ACCOUNT,
        title: "DATA UI | My account",
        key: "ROOT",
        exact: true,
        component: MyAccount,
        routes: [],
        requiredAuth: true,
        name: "myaccount",
    },
    {
        path: PATHS.LOGIN,
        title: "DATA UI | Login",
        key: "ROOT",
        exact: true,
        component: Login,
        routes: [],
        requiredAuth: false,
        name: "login",
    },
    {
        path: PATHS.RESET_PASSWORD,
        title: "DATA UI | Reset Password",
        key: "ROOT",
        exact: true,
        component: ResetPassword,
        routes: [],
        requiredAuth: false,
        name: "reset-password",
    },
    {
        path: PATHS.FORGOT_PASSWORD,
        title: "DATA UI | Forgot Password",
        key: "ROOT",
        exact: true,
        component: ForgotPassword,
        routes: [],
        requiredAuth: false,
        name: "forgot-password",
    },
    {
        path: PATHS.PHOTO_LIST,
        title: "DATA UI | Photo List",
        key: "ROOT",
        exact: true,
        component: PhotoList,
        routes: [],
        requiredAuth: false,
        name: "photo-list",
    },
    {
        path: PATHS.FIELD_OBSERVATIONS,
        title: "DATA UI | Field Observations",
        key: "ROOT",
        exact: true,
        component: CommingSoon,
        routes: [],
        requiredAuth: false,
        name: "field-observations",
    },
    {
        path: PATHS.RESULT_TABLE_COC,
        title: "DATA UI | Result Table (With CoC)",
        key: "ROOT",
        exact: true,
        component: ResultTableCOC,
        routes: [],
        requiredAuth: false,
        name: "result-table-coc",
    },
    {
        path: PATHS.RESULT_TABLE_COC_DETAIL,
        title: "DATA UI | Result Table (With CoC)",
        key: "ROOT",
        exact: true,
        component: ResultTableCOCDetail,
        routes: [],
        requiredAuth: true,
        name: "result-table-coc-detail",
    },
    {
        path: PATHS.RESULT_TABLE_NO_COC,
        title: "DATA UI | Result Table (Without CoC)",
        key: "ROOT",
        exact: true,
        component: ResultTableWithoutCOC,
        routes: [],
        requiredAuth: false,
        name: "result-table-no-coc",
    },
    {
        path: PATHS.MAP,
        title: "DATA UI | Map",
        key: "ROOT",
        exact: true,
        component: Map,
        routes: [],
        requiredAuth: false,
        name: "map",
    },
];

export default ROUTES;

/**
 * Function render routes
 * @param {Array} route
 */
export function RenderRoutes({ routes }: { routes: routes[] }) {
    return (
        <Switch>
            {routes.map((route, i) => {
                return <RouteWithSubRoutes {...route} />;
            })}

            <Route component={() => <h1>Not Found!</h1>} />
        </Switch>
    );
}

/**
 * Function render sub routes
 * @param {Array} route
 */
function RouteWithSubRoutes(route: routes) {
    const history = useHistory();
    document.title = route.title;
    const dispatch = useDispatch()

    return (
        <Route
            key={route.key}
            path={route.path}
            exact={route.exact}
            render={(props) => {
                if ((props.match.path).indexOf('/:id') === -1) {
                    dispatch(setCurrentRoute(props.match.url))
                    localStorage.setItem('CURRENT_ROUTE', JSON.stringify(props.match.url))
                }
                if (!getToken()) {
                    console.log('history.push 16')
                    route.requiredAuth && history.push("/login");
                } else if (["/login", "/register", "/forgot-password"].includes(route.path)) {
                    console.log('history.push 17')
                    history.push("/")
                }
                return <route.component {...props} routes={route.routes} />;
            }}
        />
    );
}
