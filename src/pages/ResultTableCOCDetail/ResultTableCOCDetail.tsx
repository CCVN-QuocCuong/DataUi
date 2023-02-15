import React, { useEffect } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "hooks";
import { toast } from "react-toastify";
import UserLayout from "layouts/User";
import COCFiles from "./components/COCFiles";
import { getLists as getListsCode } from "store/code";
import { getCOCByID, clearErrorMessage, setRemoveFilesSuccess, getListsCOCFile } from "store/coc";
import "./style.css";
import COCFilesPDF from "./components/COCFilesPDF";
import LoadingOverlayWrapper from "react-loading-overlay-ts";

export function ResultTableCOCDetail() {
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const [error, removeFilesSuccess] = useAppSelector((state) => [state.coc.error, state.coc.removeFilesSuccess]);
    const [loadingDelete] = useAppSelector((state) => [state.coc.loadingDelete]);


    useEffect(() => {
        dispatch(getListsCode());
    }, []);

    useEffect(() => {
        dispatch(getCOCByID(id));
    }, [id]);

    useEffect(() => {
        if (error) {
            dispatch(clearErrorMessage());
        }
    }, [error]);

    useEffect(() => {
        if (removeFilesSuccess) {
            toast.success('Remove files successfully!');
            dispatch(setRemoveFilesSuccess(false));
            setTimeout(() => {
                dispatch(getListsCOCFile(id));
            }, 200);
        }
    }, [removeFilesSuccess]);

    const renderLoading = (children) => {
        return (
            <LoadingOverlayWrapper fadeSpeed={100} active={loadingDelete} spinner
                styles={{
                    overlay: (base) => ({
                        ...base,
                        background: 'rgba(0, 0, 0, 0.14)'
                    })
                }}
            >
                {children}
            </LoadingOverlayWrapper >
        )
    }

    return (
        <UserLayout>
            <div className="edit-coc-wrapper">
                <Tabs
                    defaultActiveKey="coc_files"
                    id="justify-tab-coc"
                    className="coc-tabs"
                >
                    <Tab eventKey="coc_files" title="Result Table">
                        {renderLoading(<COCFiles cocID={id || 0} />)}
                    </Tab>
                    <Tab eventKey="coc_files_pdf" title="PDF Lab Report">
                        {renderLoading(<COCFilesPDF cocID={id || 0} />)}
                    </Tab>
                </Tabs>
            </div>
        </UserLayout>
    );
}
