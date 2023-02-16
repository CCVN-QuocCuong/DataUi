/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Spinner, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import moment from "moment-timezone";
import { useAppDispatch, useAppSelector } from "hooks";
import { getLists, setListSamplesSeleted } from "store/sample";
import Message from "components/Message";
import SearchBar from "../SearchBar";
import "./style.css";

type Sample = {
    [key: string]: any;
};

/**
 * Component to display list Sample in table
 * @param {Array} samplesSelected
 * @param {Function} addSample
 */
export function SampleTable({ samplesSelected, addSample }) {
    const dispatch = useAppDispatch();

    const [rows, setRows] = useState<object[]>([]);
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [titlePopup] = useState("Error");
    const [paramQuery, setParamQuery] = useState<Object>({});
    const [selectedAll, setSelectedAll] = useState(false);
    const [currentPage, setCurrentPage] = useState<Number>(1);
    const { listLoading, samples, pagination, listSamplesSeleted } = useAppSelector((state) => state.sample);
    const validate = samplesSelected[0] || {};

    useEffect(() => {
        const newList: Object[] = [];
        rows?.forEach((sp: Sample) => {
            if (!listSamplesSeleted?.find((it: Sample) => it?.barcode === sp.barcode)) {
                newList.push(sp);
            }
        });

        if (listSamplesSeleted?.length > 0 && newList?.length === 0) {
            setSelectedAll(true);
        } else {
            setSelectedAll(false);
        }
    }, [rows, listSamplesSeleted]);

    /**
     * Function to update sample selected
     * @param {object} e
     * @param {object | string} item
     */
    const handleChangeSelected = (e, item) => {
        let listSamples: Object[] = [];
        if (item === 'all') {
            if (e?.target?.checked) {
                const newList: Object[] = [];
                rows?.forEach((pt: Sample) => {
                    if (!listSamplesSeleted?.find((it) => it?.barcode === pt.barcode)) {
                        newList.push(pt);
                    }
                });
                listSamples = [
                    ...listSamplesSeleted,
                    ...newList,
                ];
            } else {
                listSamples = [];
                const newList: Object[] = [];
                listSamplesSeleted?.forEach((pt) => {
                    if (!rows?.find((it: Sample) => it?.barcode === pt.barcode)) {
                        newList.push(pt);
                    }
                });
                listSamples = [
                    ...newList
                ];
            }
        } else {
            if (e?.target?.checked) {
                listSamples = [
                    ...listSamplesSeleted,
                    item,
                ];
            } else {
                const newListPhotos = listSamplesSeleted.filter((it: Sample) => it?.barcode !== item?.barcode);
                listSamples = [...newListPhotos];
            }
        }

        dispatch(setListSamplesSeleted(listSamples));
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
                    id={`item-${row?.barcode}`}
                    onChange={(e) => handleChangeSelected(e, row)}
                    checked={listSamplesSeleted?.find((it) => it?.barcode === row?.barcode)?.barcode ? true : false}
                />,
            wrap: true,
            width: "40px",
        },
        {
            id: "sampleid",
            name: "ID",
            selector: (row) => row.sampleid,
            sortable: true,
            wrap: true,
            omit: true,
            width: "0",
        },
        {
            id: "createdby",
            name: "Sampler",
            selector: (row) => row.createdby,
            sortable: true,
            wrap: true,
            width: "250px",
            sortFunction: (a, b) => (a?.createdby || "")?.localeCompare(b?.createdby || ""),
        },
        {
            id: "collectiondate",
            name: "Collection Date",
            selector: (row) => row.collectiondate,
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
            id: "objective",
            name: "Sample Objective",
            selector: (row) => row?.objective || "",
            sortable: true,
            wrap: true,
            width: "150px",
            // sortFunction: (a, b) => (a?.objective || "")?.localeCompare(b?.objective || ""),
        },
        {
            id: "jobnumber",
            name: "Job No",
            selector: (row) => row.jobnumber,
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.jobnumber || "")?.localeCompare(b?.jobnumber || ""),
        },
        {
            id: "siteid",
            name: "Site ID",
            selector: (row) => row.siteid,
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.siteid || "")?.localeCompare(b?.siteid || ""),
        },
        {
            id: "siteaddress",
            name: "Site Address",
            selector: (row) => row.siteaddress,
            sortable: true,
            wrap: true,
            width: "250px",
            sortFunction: (a, b) => (a?.siteaddress || "")?.localeCompare(b?.siteaddress || ""),
        },
        {
            id: "pointname",
            name: "Sample Name",
            selector: (row) => row.pointname,
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.pointname || "")?.localeCompare(b?.pointname || ""),
        },
        {
            id: "duplicatename",
            name: "Duplicate Name",
            selector: (row) => row.duplicatename,
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.duplicatename || "")?.localeCompare(b?.duplicatename || ""),
        },
        {
            id: "fromdepth",
            name: "Depth From (m)",
            selector: (row) => row.fromdepth,
            cell: (row) =>
                (row.fromdepth * 1).toLocaleString("en-US", {
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
            selector: (row) => row.todepth,
            cell: (row) =>
                (row.todepth * 1).toLocaleString("en-US", {
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
            id: "sampletype",
            name: "Sample Type",
            selector: (row) => row.sampletype,
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.sampletype || "")?.localeCompare(b?.sampletype || ""),
        },
        {
            id: "samplematerialtype",
            name: "Material Type",
            selector: (row) => row.samplematerialtype,
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.samplematerialtype || "")?.localeCompare(b?.samplematerialtype || ""),
        },
        {
            id: "containertype",
            name: "Container Type",
            selector: (row) => row.containertype,
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.containertype || "")?.localeCompare(b?.containertype || ""),
        },
        {
            id: "barcode",
            name: "Barcode",
            selector: (row) => row.barcode,
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.barcode || "")?.localeCompare(b?.barcode || ""),
        },
        {
            id: "teststringlist",
            name: "Tests Required",
            selector: (row) =>
                <OverlayTrigger
                    key="teststringlist"
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-teststringlist`}>
                            {row.teststringlist ? row.teststringlist : "Click to assign Test"}
                        </Tooltip>
                    }
                >
                    <span className="assign-text">{row.teststringlist ? row.teststringlist : "Click to assign Test"}</span>
                </OverlayTrigger>,
            sortable: false,
            wrap: true,
            width: "250px",
        },
    ];

    useEffect(() => {
        setParamQuery({
            jobnumber: validate?.jobnumber || "",
            siteid: validate?.siteid || "",
            sampler: "",
            siteaddress: "",
            collectiondate: "",
            objective: validate?.objective || "",
            sampletype: validate?.sampletype || "",
        });
    }, [dispatch]);

    useEffect(() => {
        if (Object.values(paramQuery)?.length > 0) {
            dispatch(getLists({
                ...paramQuery,
                page: currentPage,
                barcodes: samplesSelected?.map((it) => it?.barcode)?.join('|'),
            }));
        }
    }, [paramQuery]);

    useEffect(() => {
        if (Array.isArray(samples)) {
            setRows(samples);
        }
    }, [samples]);

    
    /**
     * Handle process smaples of search bar
     */
    const handleProcessSamples = useCallback(() => {
        if (listSamplesSeleted.length < 1) {
            setMessageContent(
                "Please select item before submitting Process Samples!"
            );
            setShowMessage(true);
        } else {
            addSample(listSamplesSeleted);
        }
    }, [listSamplesSeleted]);

    
    /**
     * Close message
     */
    const handleCloseMessage = useCallback(() => {
        setShowMessage(false);
    }, []);

    
    /**
     * Handle change page
     * @param {Number} page
     */
    const handleChangePage = (page) => {
        setCurrentPage(page);
        setParamQuery({
            ...paramQuery,
        });
    }

    /**
     * Handle change per page
     * @param {Number} currentRowsPerPage
     */
    const handleChangePerPage = (currentRowsPerPage) => {
        setCurrentPage(1);
        setParamQuery({
            ...paramQuery,
            pagesize: currentRowsPerPage,
        });
    }

    
    /**
     * Handle sort
     * @param {String} selectedColumn
     * @param {String} sortDirection
     */
    const handleSort = (selectedColumn, sortDirection) => {
        setCurrentPage(1);
        setParamQuery({
            ...paramQuery,
            orderby: selectedColumn?.id || "",
            is_asc: sortDirection === "asc"
        });
    }

    
    /**
     * Handle search
     * @param {String} searchParam
     */
    const handleSearchSample = (searchParam) => {
        setCurrentPage(1);
        setParamQuery({
            ...paramQuery,
            ...searchParam,
        });
    }

    return (
        <div className="add-sample-wrapper">
            <SearchBar validate={validate} onSubmit={handleProcessSamples} handleSearchSample={handleSearchSample} />
            {showMessage && (
                <Message
                    open={showMessage}
                    closeModal={() => handleCloseMessage()}
                    message={messageContent}
                    title={titlePopup}
                />
            )}
            <div className="sample-table-wrapper">
                <DataTable
                    persistTableHead
                    columns={columns}
                    data={rows}
                    selectableRows={false}
                    fixedHeader={true}
                    selectableRowsHighlight={true}
                    progressPending={listLoading}
                    progressComponent={<div className="table-loading"><div className="loading-inner"><Spinner animation="border" role="status" /></div></div>}

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
            </div>
        </div>
    );
}
