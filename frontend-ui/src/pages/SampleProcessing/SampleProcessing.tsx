/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useAppDispatch } from "hooks";
import { getLists as getListsCode } from "store/code";
import { resetPagination } from "store/sample";
import UserLayout from "layouts/User";
import SampleTable from "./components/SampleTable";
import "./style.css";

export function SampleProcessing() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(getListsCode());
        dispatch(resetPagination());
    }, []);

    return (
        <UserLayout>
            <div className="collection-wrapper">
                <SampleTable />
            </div>
        </UserLayout>
    );
}
