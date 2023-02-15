/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Spinner, Button } from "react-bootstrap";
import moment from "moment-timezone";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "hooks";
import { getCOCFile, getListsCOCFile, removeCOCFile, setRemoveFilesSuccess } from "store/coc";
import ModalConfirm from "components/ModalConfirm";
import "./style.css";

type Object = {
    [key: string]: any
}

export function DigitalCOC({ cocID }) {
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<string>();
    const [rows, setRows] = useState<object[]>([]);
    const [showModalConfirmDeleteFile, setShowModalConfirmDeleteFile] = useState(false);
    const [listLoading, loading, files, removeFilesSuccess] = useAppSelector((state) => [state.coc.listFilesloading, state.coc.loading, state.coc.files, state.coc.removeFilesSuccess]);

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
        const listFiles = files?.filter((file: Object) => file?.filetype === 'json') || [];
        setRows(listFiles);
    }, [files]);

    /**
     * Handle to download file on click
     * @async
     * @param {*} e
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
     * Handle to download
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
     * Handle close modal confirm delete file
     */
    const handleCloseModalConfirmDeleteFile = useCallback(() => {
        setShowModalConfirmDeleteFile(false);
        setSelectedFile('')
    }, []);

    /**
     * Handle delete file
     */
    const handleDeleteFile = () => {
        dispatch(removeCOCFile({ id: cocID, filename: selectedFile })).then(res => {
            if (res?.meta?.requestStatus !== 'fulfilled') {
                setSelectedFile('')
            }
        });
        setShowModalConfirmDeleteFile(false);
    };

    useEffect(() => {
        dispatch(getListsCOCFile(cocID));
        return () => {
            setSelectedFile('')
        }
    }, []);

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

            {showModalConfirmDeleteFile && (
                <ModalConfirm open={showModalConfirmDeleteFile} handleConfirm={() => handleDeleteFile()} closeModal={() => handleCloseModalConfirmDeleteFile()} message="Do you want to delete this file." title="Are you sure" disabledButton={loading} />
            )}

        </div>
    );
}
