/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import DataTable from "react-data-table-component";
import { useLocation, useHistory } from "react-router-dom";
import { Spinner, Button } from "react-bootstrap";
import moment from "moment-timezone";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "hooks";
import { usePrompt } from "hooks/prompt";
import { getLists, uploadFiles, removeFile, setUploadSuccess, setRemoveFilesSuccess, getFileDetail, uploadFileToS3, getFile } from "store/file";
import { getLists as getListsCode } from "store/code";
import PATHS from "routes/const";
import ReportParametersModal from "../ReportParametersModal";
import ModalConfirm from "components/ModalConfirm";
import FormModal from "../FormModal";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function COCFiles() {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const history = useHistory();
    const uploadCSVRef = useRef<HTMLInputElement>(null);
    const uploadPDFRef = useRef<HTMLInputElement>(null);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [selectedFile, setSelectedFile] = useState<number>(0);
    const [rows, setRows] = useState<object[]>([]);
    const [showReportParameter, setShowReportParameter] = useState(false);
    const [showModalConfirmDeleteFile, setShowModalConfirmDeleteFile] = useState(false);
    const [showModalForm, setShowModalForm] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [listFilesloading, files, removeFilesSuccess] = useAppSelector((state) => [state.file.listFilesloading, state.file.files, state.file.removeFilesSuccess]);

    const columns = [
        {
            name: "ID",
            selector: (row) => row.sampleid,
            sortable: true,
            wrap: true,
            omit: true,
            width: "0",
        },
        {
            name: "File Name",
            selector: (row) => row.filename,
            cell: (row) => <a href="#" className="filename" onClick={(e) => handleDownloadFile(e, row.fileid)}>{row.filename}</a>,
            sortable: true,
            wrap: true,
            width: "250px",
            sortFunction: (a, b) => (a?.filename || "")?.localeCompare(b?.filename || ""),
        },
        {
            name: "Upload By",
            selector: (row) => row?.uploadby || "",
            sortable: true,
            wrap: true,
            width: "200px",
            sortFunction: (a, b) => (a?.uploadby || "")?.localeCompare(b?.uploadby || ""),
        },
        {
            name: "Upload Date",
            selector: (row) => row.createdon,
            sortable: true,
            cell: (row) =>
                row.createdon &&
                moment(row.createdon)
                    .tz("NZ")
                    .format("MM-DD-YYYY HH:mm:ss"),
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => {
                if (a?.createdon === null) {
                    return -1;
                }
                if (b?.createdon === null) {
                    return 1;
                }
                return new Date(a.createdon).getTime() - new Date(b.createdon).getTime();
            },
        },
        {
            name: "Objective",
            selector: (row) => '',
            sortable: true,
            wrap: true,
            width: "150px",
            // sortFunction: (a, b) => (a?.objective || "")?.localeCompare(b?.objective || ""),
        },
        {
            name: "Function",
            selector: (row) => row.fileid,
            sortable: false,
            cell: (row) => (<div className="button-group group-row">
                {row.filetype === "csv" && (
                    <>
                        <Button variant="secondary" type="button" onClick={() => {
                            setSelectedFile(row.fileid);
                            setShowReportParameter(true);
                        }}>
                            Open Lab Result
                        </Button>
                        <Button variant="secondary" type="button" onClick={() => {
                            setSelectedFile(row.fileid);
                            setShowModalForm(true);
                        }}>
                            Form
                        </Button>
                    </>
                )}
                <Button variant="secondary" type="button" onClick={() => {
                    if (selectedFile !== row.fileid) {
                        setSelectedFile(row.fileid);
                        setShowModalConfirmDeleteFile(true);
                    }
                }}>
                    Delete
                </Button>
            </div>),
            wrap: true,
            width: "265px",
        },
    ];

    useEffect(() => {
        setRows(files);
    }, [files]);

    /**
     * Handle download file when click
     * @async
     * @param {Object} e
     * @param {String} fileid
    */
    const handleDownloadFile = async (e, fileid) => {
        e.preventDefault();
        const file = await dispatch(getFile(fileid));
        if (file.payload) {
            downloadFile(file.payload);
        }
    }

    /**
     * Handle convert file to base64 and download
     * @param {File} file
    */
    const downloadFile = (file) => {
        let base64 = file?.base64 || "";
        if (base64) {
            const link = document.createElement("a");
            link.href = `data:${file?.contenttype};base64,${base64}`;
            link.download = file?.filename;
            document.body.appendChild(link);
            link.click();
        }
    }

    /**
     * Handle close report 
    */
    const handleCloseReportParameter = useCallback(() => {
        setShowReportParameter(false);
        setSelectedFile(0)
    }, []);

    /**
     * Handle close modal confirm delete file
    */
    const handleCloseModalConfirmDeleteFile = useCallback(() => {
        setShowModalConfirmDeleteFile(false);
        setSelectedFile(0)
    }, []);

    /**
     * Handle close modal form
    */
    const handleCloseModalForm = useCallback(() => {
        setShowModalForm(false);
        setSelectedFile(0)
    }, []);


    /**
     * Handle delete file
     */
    const handleDeleteFile = () => {
        dispatch(removeFile(selectedFile)).then(() => {
            setSelectedFile(0)
        });
        setShowModalConfirmDeleteFile(false);
    };

    useEffect(() => {
        dispatch(getLists());
        dispatch(getListsCode());
        return () => {
            setSelectedFile(0)
        }
    }, []);

    useEffect(() => {
        if (location?.state?.closeForm) {
            handleCloseModalForm();
            setIsDirty(false);
            setTimeout(() => {
                console.log('history.push 13')
                history.push(PATHS?.RESULT_TABLE_NO_COC);
            }, 500);

        }
    }, [location?.state]);

    /**
     * Handle upload file
     * @async
     * @param {Object} e
     * @param {String} type
     */
    const handleUploadFile = async (e, type) => {
        let file = e?.target?.files?.[0];
        if (file) {
            if (file.type && ((type === 'csv' && file.type !== "text/csv") || (type === 'pdf' && file.type !== "application/pdf"))) {
                toast.error("Please only upload file .csv");
            } else {
                let fileName = file.name;
                const exitsFile = files?.find((item: Object) => item?.filename === fileName);
                if (exitsFile) {
                    if (type === 'csv') {
                        fileName = `${fileName.replace(".csv", "")}(${moment
                            .tz(new Date(), "NZ")
                            .format("YYYYMMDDHHmmss")}).csv`;
                    } else {
                        fileName = `${fileName.replace(".pdf", "")}(${moment
                            .tz(new Date(), "NZ")
                            .format("YYYYMMDDHHmmss")}).pdf`;
                    }
                }
                const res = await dispatch(uploadFiles({
                    "contenttype": file?.type,
                    "name": fileName,
                }));
                if (res?.payload) {
                    const formData = new FormData();
                    Object.keys(res?.payload?.fields).forEach(key => {
                        formData.append(key, res?.payload?.fields[key]);
                    });
                    formData.append("file", file);
                    const resUploadFileToS3s = await dispatch(uploadFileToS3({
                        "url": res?.payload?.url,
                        "data": formData,
                    }));

                    if (type === 'csv' && resUploadFileToS3s?.meta?.requestStatus === "fulfilled") {
                        const fileDetail = await dispatch(getFileDetail({ filename: fileName, uploadby: currentUser?.username || "" }));
                        dispatch(setUploadSuccess(false));
                        if (fileDetail?.meta?.requestStatus === "fulfilled") {
                            toast.success('Upload file successfully!');
                            dispatch(getLists());
                        }
                    }
                }
            }
            if (uploadCSVRef?.current?.value) uploadCSVRef.current.value = "";
            if (uploadPDFRef?.current?.value) uploadPDFRef.current.value = "";
        }
    };

    /**
     * Handle upload
     * @param {String} type
     */
    const handleUpload = (type) => {
        if (type === "csv") {
            uploadCSVRef.current?.click();
        }
        else if (type === "pdf") {
            uploadPDFRef.current?.click();
        }
    };

    useEffect(() => {
        if (removeFilesSuccess) {
            toast.success('Remove files successfully!');
            dispatch(setRemoveFilesSuccess(false));
            setTimeout(() => {
                dispatch(getLists());
            }, 200);
        }
    }, [removeFilesSuccess]);

    const Prompt = usePrompt({
        when: isDirty,
        message: "You have unsaved data on lab form. Are you sure you want to leave?",
    });

    return (
        <div className="lab-files-table-wrapper">
            <Prompt />
            <DataTable
                columns={columns}
                data={rows}
                selectableRows={false}
                fixedHeader={true}
                selectableRowsHighlight={true}
                progressPending={listFilesloading}
                persistTableHead
                progressComponent={<div className="table-loading"><div className="loading-inner"><Spinner animation="border" role="status" /></div></div>}
                pagination
                paginationRowsPerPageOptions={[10, 15, 20, 25, 30, 50]}
            />
            {showReportParameter && (
                <ReportParametersModal open={showReportParameter} closeModal={() => handleCloseReportParameter()} fileid={selectedFile} />
            )}

            {showModalConfirmDeleteFile && (
                <ModalConfirm open={showModalConfirmDeleteFile} handleConfirm={() => handleDeleteFile()} closeModal={() => handleCloseModalConfirmDeleteFile()} message="Do you want to delete this file." title="Are you sure" disabledButton={listFilesloading} />
            )}

            {showModalForm && (
                <FormModal open={showModalForm} closeModal={() => handleCloseModalForm()} fileid={selectedFile} setIsDirty={setIsDirty} />
            )}


            <div className="button-group">
                <input type="file" accept=".csv" id="csvFile" name="csvFile" ref={uploadCSVRef} className="hidden" onChange={(e) => handleUploadFile(e, 'csv')} />
                <input type="file" accept=".pdf" id="pdfFile" name="pdfFile" ref={uploadPDFRef} className="hidden" onChange={(e) => handleUploadFile(e, 'pdf')} />

                <Button variant="secondary" type="button" onClick={() => handleUpload('csv')} disabled={listFilesloading}>
                    Import Lab Result (CSV)
                </Button>
            </div>
        </div>
    );
}
