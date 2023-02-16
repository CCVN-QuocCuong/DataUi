/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useAppDispatch } from "hooks";
import UserLayout from "layouts/User";
import { getLists as getListsCode } from "store/code";
import { resetPagination } from "store/coc";
import COCTable from "./components/COCTable";
import "./style.css";

export function ResultTableCOC() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getListsCode());
        dispatch(resetPagination());
    }, []);

    return <UserLayout>
        <div className="coc-wrapper">
            <COCTable />
        </div>
    </UserLayout>;
}
