import { configureStore } from '@reduxjs/toolkit'
import rootReducer from "./reducers";
import API from "service/api";
import API_BOOK from "service/endpoints";
import { history } from "helpers/common";
import toast from "components/DataUIToast";

const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: {
                    API,
                    API_BOOK,
                    toast,
                    history,
                }
            }
        })
});

export type RootState = ReturnType<typeof store.getState>

export default store;
