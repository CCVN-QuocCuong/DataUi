/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "hooks";
import UserLayout from "layouts/User";
import { getLists as getListsCode } from "store/code";
import { resetPagination } from "store/coc";
import COCTable from "./components/COCTable";
import "./style.css";

export function COCList() {
    let { type } = useParams();
    const dispatch = useAppDispatch();

    const listType = [
        "list",
        "soil",
        "liquid",
        "gas",
    ];

    useEffect(() => {
        dispatch(getListsCode());
        dispatch(resetPagination());
    }, []);

    return listType.includes(type) ? (
        <UserLayout>
            <div className="coc-wrapper">
                <COCTable type={type} />
            </div>
        </UserLayout>
    ) : (
        <h1>Not Found!</h1>
    );
}
