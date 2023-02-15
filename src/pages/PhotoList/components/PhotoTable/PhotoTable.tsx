import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Spinner, Button, Form } from "react-bootstrap";
import moment from "moment-timezone";
import { useAppDispatch, useAppSelector } from "hooks";
import { getPhotoDetail, getLists, setListPhotosSeleted } from "store/photo";
import SearchBar from "../SearchBar";
import ExportPhotosModal from "../ExportPhotosModal";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function PhotoTable() {
    const dispatch = useAppDispatch();
    const [showExportModal, setShowExportModal] = useState(false);
    const [rows, setRows] = useState<object[]>([]);
    const [isFirst, setIsFirst] = useState(true);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [paramQuery, setParamQuery] = useState<Object>({});
    const [selectedAll, setSelectedAll] = useState(false);
    const { listLoading, photos, pagination, listPhotosSeleted } = useAppSelector((state) => state.photo);

    useEffect(() => {
        if (Array.isArray(photos)) {
            setRows(photos);
            setToggleCleared(true);
        }
    }, [photos]);

    useEffect(() => {
        const newList: Object[] = [];
        photos?.forEach((pt) => {
            if (!listPhotosSeleted?.find((it) => it?.id === pt.id)) {
                newList.push(pt);
            }
        });
        if (listPhotosSeleted?.length > 0 && newList?.length === 0 && photos.length > 0) {
            setSelectedAll(true);
        } else {
            setSelectedAll(false);
        }
    }, [photos, listPhotosSeleted]);

    useEffect(() => {
        if (toggleCleared) {
            setToggleCleared(false);
        }
    }, [photos]);

    /**
     * Handle change selected item
     * @param {Object} e
     * @param {Object} item
     */
    const handleChangeSelected = (e, item) => {
        let listPhotos: Object[] = [];
        if (item === 'all') {
            if (e?.target?.checked) {
                const newList: Object[] = [];
                photos?.forEach((pt) => {
                    if (!listPhotosSeleted?.find((it) => it?.id === pt.id)) {
                        newList.push(pt);
                    }
                });
                listPhotos = [
                    ...listPhotosSeleted,
                    ...newList,
                ];
            } else {
                const newList: Object[] = [];
                listPhotosSeleted?.forEach((pt) => {
                    if (!photos?.find((it) => it?.id === pt.id)) {
                        newList.push(pt);
                    }
                });
                listPhotos = [
                    ...newList
                ];
            }
        } else {
            if (e?.target?.checked) {
                listPhotos = [
                    ...listPhotosSeleted,
                    item,
                ];
            } else {
                const newListPhotos = listPhotosSeleted.filter((it: Object) => it?.id !== item?.id);
                listPhotos = [...newListPhotos];
            }
        }

        dispatch(setListPhotosSeleted(listPhotos));
    }

    const columns = [
        {
            id: "select",
            center: true,
            name: <Form.Check
                type="checkbox"
                id={`select-all`}
                onChange={(e) => handleChangeSelected(e, 'all')}
                checked={selectedAll}
                disabled={listLoading}
            />,
            cell: (row) =>
                <Form.Check
                    type="checkbox"
                    id={`item-${row?.id}`}
                    onChange={(e) => handleChangeSelected(e, row)}
                    checked={listPhotosSeleted?.find((it: Object) => it?.id === row?.id)?.id ? true : false}
                />,
            wrap: true,
            width: "40px",
        },
        {
            id: "id",
            name: "ID",
            selector: (row) => row?.id || "",
            sortable: true,
            wrap: true,
            omit: true,
            width: "0",
        },
        {
            id: "jobnumber",
            name: "Job No",
            selector: (row) => row?.jobnumber || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.jobnumber || "")?.localeCompare(b?.jobnumber || ""),
        },
        {
            id: "siteid",
            name: "Site ID",
            selector: (row) => row?.siteid || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.siteid || "")?.localeCompare(b?.siteid || ""),
        },
        {
            id: "siteaddress",
            name: "Site Address",
            selector: (row) => row.siteaddress || "",
            sortable: true,
            wrap: true,
            width: "180px",
            sortFunction: (a, b) => (a?.siteaddress || "")?.localeCompare(b?.siteaddress || ""),
        },
        {
            id: "staff",
            name: "Staff",
            selector: (row) => row?.staff || "",
            sortable: true,
            wrap: true,
            width: "250px",
            sortFunction: (a, b) => (a?.staff || "")?.localeCompare(b?.staff || ""),
        },
        {
            id: "collectiondate",
            name: "Collection Date",
            selector: (row) => row?.collectiondate || "",
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
            id: "samplename",
            name: "Sample Name",
            selector: (row) => row?.samplename || "",
            sortable: true,
            wrap: true,
            width: "180px",
            sortFunction: (a, b) => (a?.samplename || "")?.localeCompare(b?.samplename || ""),
        },
        {
            id: "objective",
            name: "Objective",
            selector: (row) => row?.objective || "",
            sortable: true,
            wrap: true,
            width: "170px",
            sortFunction: (a, b) => (a?.objective || "")?.localeCompare(b?.objective || ""),
        },
        {
            id: "filetype",
            name: "File Type",
            selector: (row) => row?.filetype || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.filetype || "")?.localeCompare(b?.filetype || ""),
        },
        {
            id: "fromdepth",
            name: "Depth From (m)",
            selector: (row) => row?.fromdepth,
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
            id: "todepth",
            name: "Depth To (m)",
            selector: (row) => row?.todepth,
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
     * Download file on click
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
     * Handle check first render
     */
    const handleSetIsFirst = useCallback((value) => {
        setIsFirst(value);
    }, []);

    /**
     * Handle export
     */
    const handleExport = () => {
        setShowExportModal(true);
    };

    /**
     * Handle download list file
     * @async
     */
    const handleDownloadListFile = async () => {
        const data = await dispatch(getPhotoDetail(listPhotosSeleted));
        if (data.payload.urls.length > 0) {
            console.log("data.payload.urls: ", data.payload.urls)
            await download_files(data.payload.urls)
        };
    }

    /**
     * Handle download file 
     * @async
     * @param {Object} files
     */
    const download_files = async (files) => {
        const download_next = (i) => {
            if (i >= files.length) {
                return;
            }
            var a = document.createElement('a');
            a.href = files[i];
            a.target = '_parent';

            // Add a to the doc for click to work.
            (document.body || document.documentElement).appendChild(a);
            if (a.click) {
                a.click(); // The click method is supported by most browsers.
            }

            // await download_next(i + 1); 
            setTimeout(function () {
                download_next(i + 1);
            }, 1000);
        }

        // Initiate the first download.
        download_next(0);
    }

    /**
     * Handle close export modal
     */
    const handleCloseExportModal = useCallback(() => {
        setShowExportModal(false);
    }, []);

    useEffect(() => {
        dispatch(getLists({
            ...paramQuery,
        }));
    }, [paramQuery]);

    /**
     * Handle change page
     * @param {Number} page
     */
    const handleChangePage = (page) => {
            setParamQuery({
                ...paramQuery,
                page: page,
            });
    }

    /**
     * Handle change per page
     * @param {Number} currentRowsPerPage
     */
    const handleChangePerPage = (currentRowsPerPage) => {
        setParamQuery({
            ...paramQuery,
            page: 1,
            pagesize: currentRowsPerPage,
        });
    }

    /**
     * Handle sort
     * @param {Number} selectedColumn
     * @param {String} sortDirection
     */
    const handleSort = (selectedColumn, sortDirection) => {
        const sort = () => {
            setParamQuery({
                ...paramQuery,
                page: 1,
                orderby: selectedColumn?.id || "",
                is_asc: sortDirection === "asc"
            });
        }

        if (pagination?.page > 1) {
            setTimeout(() => {
                return sort()
            }, 350);
        } else {
            return sort()
        }
    }

    /**
     * Handle search photo
     * @param {String} searchParam
     */
    const handleSearchPhoto = useCallback((searchParam) => {
        if (searchParam) {
            setParamQuery({
                ...paramQuery,
                ...searchParam,
                page: 1,
                pagesize: pagination?.pageSize
            });
        } else {
            setParamQuery({
                pagesize: pagination?.pageSize
            });
        }
    },[paramQuery, pagination])

    return (
        <div className="photos-table-wrapper">
            <SearchBar handleSetIsFirst={handleSetIsFirst} handleSearchPhoto={handleSearchPhoto} />
            {showExportModal && (
                <ExportPhotosModal open={showExportModal} closeModal={handleCloseExportModal} photosSelected={listPhotosSeleted} />
            )}
            <DataTable
                columns={columns}
                data={rows}
                selectableRows={false}
                fixedHeader={true}
                selectableRowsHighlight={true}
                progressPending={listLoading}
                progressComponent={<div className="table-loading"><div className="loading-inner"><Spinner animation="border" role="status" /></div></div>}
                persistTableHead
                clearSelectedRows={toggleCleared}
                noDataComponent={isFirst ? (<div className="no-content">Please input keyword search to display data</div>) : (<div className="no-content">No matching records found for the search condition.</div>)}

                pagination
                paginationServer
                paginationTotalRows={pagination?.total}
                paginationPerPage={pagination?.pageSize}
                paginationDefaultPage={pagination?.page}
                paginationRowsPerPageOptions={[10, 15, 20, 25, 30, 50]}
                onChangePage={(page) => handleChangePage(page)}
                onChangeRowsPerPage={(currentRowsPerPage) => handleChangePerPage(currentRowsPerPage)}
                onSort={(selectedColumn, sortDirection) => handleSort(selectedColumn, sortDirection)}
                sortServer
            />
            <div className="button-group text-right">
                <Button variant="secondary" type="button" onClick={() => handleExport()} disabled={listPhotosSeleted?.length !== 2 && listPhotosSeleted?.length !== 6}>
                    Photo Report
                </Button>

                <Button variant="secondary" type="button" onClick={() => handleDownloadListFile()} disabled={listPhotosSeleted?.length > 0 && listPhotosSeleted?.length > 50}>
                    Download Photo
                </Button>
            </div>
        </div>
    );
}
