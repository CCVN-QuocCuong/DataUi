/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Spinner, Button } from "react-bootstrap";
import moment from "moment-timezone";
import { useAppDispatch, useAppSelector } from "hooks";
import { getListPhotos } from "store/coc";
import { getPhotoDetail } from "store/photo";
import ExportPhotosModal from "pages/PhotoList/components/ExportPhotosModal";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function Photos({ cocID }) {
    const dispatch = useAppDispatch();
    const [selectedPhotos, setSelectedPhotos] = useState<Object[]>([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [rows, setRows] = useState<object[]>([]);
    const { listPhotosloading, photos } = useAppSelector((state) => state.coc);

    useEffect(() => {
        if (Array.isArray(photos)) {
            setRows(photos);
        }
    }, [photos]);

    useEffect(() => {
        dispatch(getListPhotos(cocID));
    }, []);

    const columns = [
        {
            name: "ID",
            selector: (row) => row.url,
            sortable: true,
            wrap: true,
            omit: true,
            width: "0",
        },
        {
            name: "Job No",
            selector: (row) => row.jobnumber || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.jobnumber || "")?.localeCompare(b?.jobnumber || ""),
        },
        {
            name: "Site ID",
            selector: (row) => row.siteid || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.siteid || "")?.localeCompare(b?.siteid || ""),
        },
        {
            name: "Site Address",
            selector: (row) => row.siteaddress || "",
            sortable: true,
            wrap: true,
            width: "180px",
            sortFunction: (a, b) => (a?.siteaddress || "")?.localeCompare(b?.siteaddress || ""),
        },
        {
            name: "Staff",
            selector: (row) => row.staff || "",
            sortable: true,
            wrap: true,
            width: "250px",
            sortFunction: (a, b) => (a?.staff || "")?.localeCompare(b?.staff || ""),
        },
        {
            name: "Collection Date",
            selector: (row) => row.collectiondate || "",
            sortable: true,
            cell: (row) =>
                row.collectiondate &&
                moment
                    .tz(row.collectiondate, "NZ")
                    .format("MM-DD-YYYY HH:mm:ss"),
            wrap: true,
            width: "150px",
        },
        {
            name: "Sample Name",
            selector: (row) => row.samplename || "",
            sortable: true,
            wrap: true,
            width: "180px",
            sortFunction: (a, b) => (a?.samplename || "")?.localeCompare(b?.samplename || ""),
        },
        {
            name: "Objective",
            selector: (row) => row.objective || "",
            sortable: true,
            wrap: true,
            width: "170px",
            sortFunction: (a, b) => (a?.objective || "")?.localeCompare(b?.objective || ""),
        },
        {
            name: "File Type",
            selector: (row) => row.filetype || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.filetype || "")?.localeCompare(b?.filetype || ""),
        },
        {
            name: "Depth From (m)",
            selector: (row) => row.fromdepth,
            cell: (row) =>
                row.fromdepth?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => {
                if (a?.fromdepth === null) {
                    return -1;
                }
                if (b?.fromdepth === null) {
                    return 1;
                }
                return a?.fromdepth * 1 - b?.fromdepth * 1;
            },
        },
        {
            name: "Depth To (m)",
            selector: (row) => row.todepth,
            cell: (row) =>
                row.todepth?.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }),
            sortable: true,
            wrap: true,
            subHeaderWrap: true,
            width: "150px",
            sortFunction: (a, b) => {
                if (a?.todepth === null) {
                    return -1;
                }
                if (b?.todepth === null) {
                    return 1;
                }
                return a?.todepth * 1 - b?.todepth * 1;
            },
        },
        {
            name: "Actions",
            selector: (row) => row.url,
            cell: (row) =>
                <button type="button" className="btn btn-secondary btn-sm" onClick={(e) => handleDownloadFile(e, row.url)}>Download</button>,
            sortable: false,
            wrap: true,
            subHeaderWrap: true,
            width: "150px",
        },
    ];

    /**
     * Handle download file when click
     * @async
     * @param {Object} e
     * @param {String} url
     */
    const handleDownloadFile = async (e, url) => {
        e.preventDefault();
        const file = await dispatch(getPhotoDetail([{ url }]));
        if (file?.payload?.urls?.[0]) {
            downloadFile(file?.payload?.urls?.[0]);
        }
    }

    /**
     * Handle download file 
     * @param {Object} file
     */
    const downloadFile = (file) => {
        const link = document.createElement("a");
        link.href = `${file}`;
        link.download = 'Download File';
        document.body.appendChild(link);
        link.click();

    }

    /**
     * Handle export
     */
    const handleExport = () => {
        setShowExportModal(true);
    };

    /**
     * Handle close export modal
     */
    const handleCloseExportModal = useCallback(() => {
        setShowExportModal(false);
    }, []);

    return (
        <div className="photos-table-wrapper">
            {showExportModal && (
                <ExportPhotosModal open={showExportModal} closeModal={handleCloseExportModal} photosSelected={selectedPhotos} />
            )}
            <DataTable
                columns={columns}
                data={rows}
                selectableRows={true}
                fixedHeader={true}
                selectableRowsHighlight={true}
                progressPending={listPhotosloading}
                progressComponent={<div className="table-loading"><div className="loading-inner"><Spinner animation="border" role="status" /></div></div>}
                pagination
                paginationRowsPerPageOptions={[10, 15, 20, 25, 30, 50]}
                persistTableHead
                onSelectedRowsChange={({ selectedRows }) => {
                    setSelectedPhotos(selectedRows);
                }}
            />
            <div className="button-group text-right">
                <Button variant="secondary" type="button" onClick={() => handleExport()} disabled={selectedPhotos?.length !== 2 && selectedPhotos?.length !== 6}>
                    Export Photos
                </Button>
            </div>
        </div>
    );
}
