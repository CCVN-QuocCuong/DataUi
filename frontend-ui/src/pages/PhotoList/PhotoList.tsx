/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

import { useAppDispatch } from "hooks";

import { getLists as getListsCode } from "store/code";
import { getListSampleNames } from "store/sample";

import UserLayout from "layouts/User";
import PhotoTable from "./components/PhotoTable";

export function PhotoList() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getListsCode());
        dispatch(getListSampleNames());
    }, []);

    return (
        <UserLayout>
            <div>
                <PhotoTable />
            </div>
        </UserLayout>
    );
}
