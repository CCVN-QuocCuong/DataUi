import { combineReducers } from "redux";
import auth from "./auth";
import app from "./app";
import user from "./user";
import sample from "./sample";
import coc from "./coc";
import testType from "./testType";
import code from "./code";
import parameter from "./parameter";
import file from "./file";
import photo from "./photo";
import notification from "./notification";

export default combineReducers({
    auth,
    app,
    user,
    sample,
    coc,
    testType,
    code,
    parameter,
    file,
    photo,
    notification,
});