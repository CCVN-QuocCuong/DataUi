/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import DataTable from "react-data-table-component";
import { Spinner, Button } from "react-bootstrap";
import moment from "moment-timezone";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "hooks";
import { getCOCFile, getListsCOCFile, getFileDetail, uploadCOCFiles, removeAllCOCFile, removeCOCFile, setUploadSuccess, setRemoveFilesSuccess, uploadCOCFileToS3, getListSamplesFile, acceptMappingSample, rejectMappingSample, getMappingSample } from "store/coc";
import ReportParametersModal from "../ReportParametersModal";
import MappingSampleModal from "../MappingSampleModal";
import ModalConfirm from "components/ModalConfirm";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function COCFiles({ cocID }) {
    const dispatch = useAppDispatch();
    const uploadCSVRef = useRef<HTMLInputElement>(null);
    const uploadPDFRef = useRef<HTMLInputElement>(null);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [selectedFile, setSelectedFile] = useState<string>();
    const [currentFile, setCurrentFile] = useState<Object>({});
    const [fileType, setFileType] = useState<string>();
    const [rows, setRows] = useState<object[]>([]);
    const [showReportParameter, setShowReportParameter] = useState(false);
    const [showModalConfirmClearAllResult, setShowModalConfirmClearAllResult] = useState(false);
    const [showModalConfirmDeleteFile, setShowModalConfirmDeleteFile] = useState(false);
    const [showModalMappingSample, setShowModalMappingSample] = useState(false);
    const [showModalConfirmMappingSample, setShowModalConfirmMappingSample] = useState(false);
    const [listLoading, loading, files, uploadSuccess, removeFilesSuccess] = useAppSelector((state) => [state.coc.listFilesloading, state.coc.loading, state.coc.files, state.coc.uploadSuccess, state.coc.removeFilesSuccess]);

    const columns = [
        {
            name: "ID",
            selector: (row) => row.fileid,
            sortable: true,
            wrap: true,
            omit: true,
            width: "0",
        },
        {
            name: "File Name",
            selector: (row) => row.filename,
            cell: (row) => <a href="#" className="filename" onClick={(e) => handleDownloadFile(e, row.filename)}>{row.filename}</a>,
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
            selector: (row) => row.filename,
            sortable: false,
            cell: (row) => (<div className="button-group group-row">
                {row.filetype === "csv" && (
                    <Button variant="secondary" type="button" onClick={async () => {
                        await dispatch(getListSamplesFile({ id: cocID, filename: row.filename }));
                        await dispatch(getMappingSample(cocID));
                        setShowModalMappingSample(true);
                    }}>
                        Mapping Sample
                    </Button>
                )}
                <Button variant="secondary" type="button" onClick={() => {
                    setSelectedFile(row.filename);
                    setShowModalConfirmDeleteFile(true);
                }}>
                    Delete
                </Button>
            </div>),
            wrap: true,
            width: "200px",
        },
    ];

    useEffect(() => {
        setRows(files || []);
    }, [files]);

    /**
     * Handle download
     * @async
     * @param {Object} e
     * @param {String} filename
     */
    const handleDownloadFile = async (e, filename) => {
        e.preventDefault();
        const file = await dispatch(getCOCFile({ id: cocID, filename }));
        if (file.payload) {
            downloadFile(file.payload);
        }
    }

    /**
     * Handle to
     * @param {Object} file
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
     * Handle close report parameter
     */
    const handleCloseReportParameter = useCallback(() => {
        setShowReportParameter(false);
    }, []);

    /**
     * Handle close modal confirm clear result
     */
    const handleCloseModalConfirmClearResult = useCallback(() => {
        setShowModalConfirmClearAllResult(false);
    }, []);

    /**
     * Handle closee modal confirm delete file
     * @type {*}
     */
    const handleCloseModalConfirmDeleteFile = useCallback(() => {
        setShowModalConfirmDeleteFile(false);
        setSelectedFile('')
    }, []);

    /**
     * Handle close modal confirm mapping
     * @async
     */
    const handleCloseModalConfirmMapppingSample = useCallback(async () => {
        await Promise.all([
            dispatch(rejectMappingSample(currentFile?.header?.[0]?.fileid || 0)),
            dispatch(getListsCOCFile(cocID)),
        ]);
        setShowModalConfirmMappingSample(false);
    }, [currentFile]);

    /**
     * Handle close modal mapping
     */
    const handleCloseModalMapppingSample = useCallback(() => {
        setShowModalMappingSample(false);
    }, []);

    /**
     * Handle confirm mapping
     * @async
     */
    const handleConfirmMapping = useCallback(async () => {
        await Promise.all([
            dispatch(acceptMappingSample({ details: currentFile?.details || [] })),
            dispatch(getListSamplesFile({ id: cocID, filename: currentFile?.header?.filename || "" })),
            dispatch(getMappingSample(cocID)),
        ]);

        setShowModalConfirmMappingSample(false);
        setShowModalMappingSample(true);
    }, [currentFile])

    /**
     * Handle clear all lab result
     */
    const handleClearAllLabResult = () => {
        setShowModalConfirmClearAllResult(true);
    };;

    /**
     * Handle delete a file
     */
    const handleDeleteFile = () => {
        dispatch(removeCOCFile({ id: cocID, filename: selectedFile })).then(res => {
            setSelectedFile('')
        });
        setShowModalConfirmDeleteFile(false);
    };

    /**
     * Handle remove all file
     */
    const handleRemoveAllFile = useCallback(() => {
        dispatch(removeAllCOCFile(cocID));
        setShowModalConfirmClearAllResult(false);
    }, []);

    useEffect(() => {
        dispatch(getListsCOCFile(cocID));
        return () => {
            setSelectedFile('')
        }
    }, []);

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
                const resUploadCOCFiles = await dispatch(uploadCOCFiles({
                    "cocid": cocID,
                    "contenttype": file?.type,
                    "name": fileName,
                    "uploadby": currentUser?.username || "",
                }));
                if (resUploadCOCFiles?.payload) {
                    const formData = new FormData();
                    Object.keys(resUploadCOCFiles?.payload?.fields).forEach(key => {
                        formData.append(key, resUploadCOCFiles?.payload?.fields[key]);
                    });
                    formData.append("file", file);
                    const resUploadCOCFileToS3s = await dispatch(uploadCOCFileToS3({
                        "url": resUploadCOCFiles?.payload?.url,
                        "data": formData,
                    }));

                    if (type === 'csv' && resUploadCOCFileToS3s?.meta?.requestStatus === "fulfilled") {
                        const fileDetail = await dispatch(getFileDetail({ id: cocID, filename: fileName, uploadby: currentUser?.username || "" }));
                        dispatch(setUploadSuccess(false));
                        if (fileDetail?.meta?.requestStatus === "fulfilled") {
                            toast.success('Upload file successfully!');
                            setCurrentFile(fileDetail?.payload);
                            dispatch(getListsCOCFile(cocID));
                            setTimeout(async () => {
                                const fileHeader = fileDetail?.payload?.header?.[0] || {};
                                if (fileHeader?.cocid && fileHeader.cocidmapping) {
                                    if (fileHeader?.cocid !== fileHeader?.cocidmapping) {
                                        setShowModalConfirmMappingSample(true);
                                    } else {
                                        await Promise.all([
                                            dispatch(getListSamplesFile({ id: cocID, filename: fileName })),
                                            dispatch(getMappingSample(cocID)),
                                        ]);
                                        setShowModalMappingSample(true);
                                    }
                                }
                            }, 3500);
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
        setFileType(type);
        if (type === "csv") {
            uploadCSVRef.current?.click();
        }
        else if (type === "pdf") {
            uploadPDFRef.current?.click();
        }
    };

    useEffect(() => {
        if (uploadSuccess) {
            if (fileType !== 'csv') {
                toast.success('Upload file successfully!');
                dispatch(setUploadSuccess(false));
                setTimeout(() => {
                    dispatch(getListsCOCFile(cocID));
                }, 1500);
            }
        }
    }, [uploadSuccess]);

    useEffect(() => {
        if (removeFilesSuccess) {
            toast.success('Remove files successfully!');
            dispatch(setRemoveFilesSuccess(false));
            setTimeout(() => {
                dispatch(getListsCOCFile(cocID));
            }, 200);
        }
    }, [removeFilesSuccess]);

    return (
        <div className="coc-files-table-wrapper">
            <DataTable
                columns={columns}
                data={rows}
                selectableRows={false}
                fixedHeader={true}
                selectableRowsHighlight={true}
                progressPending={listLoading}
                persistTableHead
                progressComponent={<div className="table-loading"><div className="loading-inner"><Spinner animation="border" role="status" /></div></div>}
                pagination
                paginationRowsPerPageOptions={[10, 15, 20, 25, 30, 50]}
            />
            {showReportParameter && (
                <ReportParametersModal cocID={cocID} open={showReportParameter} closeModal={() => handleCloseReportParameter()} />
            )}

            {showModalConfirmClearAllResult && (
                <ModalConfirm open={showModalConfirmClearAllResult} handleConfirm={() => handleRemoveAllFile()} closeModal={() => handleCloseModalConfirmClearResult()} message="Do you want to clean all lab test result files. All lab results for this COC will be deleted. This include the orginal lab result raw files (.csv)" title="Are you sure" disabledButton={loading} />
            )}

            {showModalConfirmDeleteFile && (
                <ModalConfirm open={showModalConfirmDeleteFile} handleConfirm={() => handleDeleteFile()} closeModal={() => handleCloseModalConfirmDeleteFile()} message="Do you want to delete this file." title="Are you sure" disabledButton={loading} />
            )}

            {showModalConfirmMappingSample && (
                <ModalConfirm open={showModalConfirmMappingSample} handleConfirm={() => handleConfirmMapping()} closeModal={() => handleCloseModalConfirmMapppingSample()} message={`The COC Number: COC${currentFile?.header?.[0]?.cocidmapping} does not match with COC${cocID}, Do you still want to import?`} title="COC Number Not Match" textOK="Yes" textCancel="No" disabledButton={loading} />
            )}

            {showModalMappingSample && (
                <MappingSampleModal open={showModalMappingSample} closeModal={() => handleCloseModalMapppingSample()} cocID={cocID} />
            )}

            <div className="button-group">
                <input type="file" accept=".csv" id="csvFile" name="csvFile" ref={uploadCSVRef} className="hidden" onChange={(e) => handleUploadFile(e, 'csv')} />
                <input type="file" accept=".pdf" id="pdfFile" name="pdfFile" ref={uploadPDFRef} className="hidden" onChange={(e) => handleUploadFile(e, 'pdf')} />

                <Button variant="secondary" type="button" disabled={loading} onClick={() => handleUpload('csv')}>
                    Import Lab Result (CSV)
                </Button>
                <Button variant="secondary" type="button" disabled={loading} onClick={() => handleUpload('pdf')}>
                    Upload Lab PDF Report
                </Button>
                <Button variant="secondary" type="button" disabled={loading || !rows.some((item: Object) => item?.filetype === "csv")}>
                    Generate Exceedance Map
                </Button>
                <div className="button-right">
                    <Button variant="secondary" type="button" disabled={loading || rows?.length === 0} onClick={() => handleClearAllLabResult()}>
                        Clear All Lab Result Files
                    </Button>
                    <Button variant="secondary" type="button" onClick={() => setShowReportParameter(true)} disabled={loading || !rows.some((item: Object) => item?.filetype === "csv")}>
                        Open Lab Result
                    </Button>
                </div>
            </div>
        </div>
    );
}
