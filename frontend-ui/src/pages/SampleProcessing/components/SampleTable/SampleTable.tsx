import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Spinner, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment-timezone";
import { useAppDispatch, useAppSelector } from "hooks";
import { getLists, setEditSuccess, setListSamplesSeleted } from "store/sample";
import PATHS from "routes/const";
import Message from "components/Message";
import EditSample from "../EditSample";
import SearchBar from "../SearchBar";
import TestTypeForm from "components/TestTypeForm";
import "./style.css";

type Sample = {
    [key: string]: any;
};

export function SampleTable() {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [rows, setRows] = useState<object[]>([]);
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [titlePopup, setTitlePopup] = useState("Error");
    const [sampleDetail, setSampleDetail] = useState<Sample>({});
    const [showSampleDetail, setShowSampleDetail] = useState(false);
    const [showTestTypeForm, setShowTestTypeForm] = useState(false);
    const [selectedSampleAssignTest, setSelectedSampleAssignTest] = useState<Sample[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [paramQuery, setParamQuery] = useState<Object>({});
    const [selectedAll, setSelectedAll] = useState(false);
    const { listLoading, samples, pagination, listSamplesSeleted } = useAppSelector((state) => state.sample);

    useEffect(() => {
        return () => {
            dispatch(setListSamplesSeleted([]));
        }
    }, []);

    useEffect(() => {
        const newList: Object[] = [];
        samples?.forEach((sp) => {
            if (!listSamplesSeleted?.find((it) => it?.barcode === sp.barcode)) {
                newList.push(sp);
            }
        });

        if (listSamplesSeleted?.length > 0 && newList?.length === 0 && samples.length > 0) {
            setSelectedAll(true);
        } else {
            setSelectedAll(false);
        }
    }, [samples, listSamplesSeleted]);

    /**
     * Handle change selected
     * @param {Object} e
     * @param {String} item
     */
    const handleChangeSelected = (e, item) => {
        let listSamples: Object[] = [];
        if (item === 'all') {
            if (e?.target?.checked) {
                const newList: Object[] = [];
                samples?.forEach((pt) => {
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
                    if (!samples?.find((it: Sample) => it?.barcode === pt.barcode)) {
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
            selector: (row) => row?.sampleid || "",
            sortable: true,
            wrap: true,
            omit: true,
            width: "0",
            sortFunction: (a, b) => (a?.sampleid || "")?.localeCompare(b?.sampleid || ""),
        },
        {
            id: "createdby",
            name: "Sampler",
            selector: (row) => row?.createdby || "",
            sortable: true,
            wrap: true,
            width: "250px",
            sortFunction: (a, b) => (a?.createdby || "")?.localeCompare(b?.createdby || ""),
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
            id: "objective",
            name: "Sample Objective",
            selector: (row) => row?.objective || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.objective || "")?.localeCompare(b?.objective || ""),
        },
        {
            id: "jobnumber",
            name: "Job No",
            selector: (row) => row?.jobnumber || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.jobnumber || "")?.localeCompare(b?.jobnumber || ""),
        },
        {
            id: "siteid",
            name: "Site ID",
            selector: (row) => row?.siteid || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.siteid || "")?.localeCompare(b?.siteid || ""),
        },
        {
            id: "siteaddress",
            name: "Site Address",
            selector: (row) => row?.siteaddress || "",
            sortable: true,
            wrap: true,
            width: "250px",
            sortFunction: (a, b) => (a?.siteaddress || "")?.localeCompare(b?.siteaddress || ""),
        },
        {
            id: "pointname",
            name: "Sample Name",
            selector: (row) => row?.pointname || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.pointname || "")?.localeCompare(b?.pointname || ""),
        },
        {
            id: "duplicatename",
            name: "Duplicate Name",
            selector: (row) => row?.duplicatename || "",
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
            selector: (row) => row?.sampletype || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.sampletype || "")?.localeCompare(b?.sampletype || ""),
        },
        {
            id: "samplematerialtype",
            name: "Material Type",
            selector: (row) => row?.samplematerialtype || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.samplematerialtype || "")?.localeCompare(b?.samplematerialtype || ""),
        },
        {
            id: "containertype",
            name: "Container Type",
            selector: (row) => row?.containertype || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.containertype || "")?.localeCompare(b?.containertype || ""),
        },
        {
            id: "barcode",
            name: "Barcode",
            selector: (row) => row?.barcode,
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.barcode || "")?.localeCompare(b?.barcode || ""),
        },
        {
            id: "teststringlist",
            name: "Tests Required",
            selector: (row) => row.teststringlist,
            sortable: false,
            cell: (row) =>
                <OverlayTrigger
                    key="teststringlist"
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-teststringlist`}>
                            {row.teststringlist ? row.teststringlist : "Click to assign Test"}
                        </Tooltip>
                    }
                >
                    <span className="assign-text" onClick={() => {
                        setShowTestTypeForm(true);
                        setSelectedSampleAssignTest([row]);
                    }}>{row.teststringlist ? row.teststringlist : "Click to assign Test"}</span>
                </OverlayTrigger>,
            wrap: true,
            width: "250px",
        },
    ];

    useEffect(() => {
        if (Array.isArray(samples)) {
            setToggleCleared(true);
            setRows(samples);
        }
    }, [samples]);

    useEffect(() => {
        if (toggleCleared) {
            setToggleCleared(false);
        }
    }, [toggleCleared]);

    /**
     * Handle process samples
     */
    const handleProcessSamples = useCallback(() => {
        let error = false;
        if (listSamplesSeleted.length < 1) {
            error = true;
            setMessageContent(
                "Please select item before submitting Process Samples!"
            );
            setShowMessage(true);
        } else {
            const siteIds = [];
            const jobNo = [];
            const objecttive = [];
            const sampleType = [];
            listSamplesSeleted.forEach((item) => {
                if (!siteIds.includes(item?.siteid as never)) {
                    siteIds.push(item?.siteid as never);
                }
                if (!jobNo.includes(item?.jobnumber as never)) {
                    jobNo.push(item?.jobnumber as never);
                }
                if (!objecttive.includes(item?.objective as never)) {
                    objecttive.push(item?.objective as never);
                }
                if (!sampleType.includes(item?.sampletype as never)) {
                    sampleType.push(item?.sampletype as never);
                }
            });

            const messageError: string[] = [];
            if (siteIds.length !== 1) {
                messageError.push("Site ID");
            }
            if (jobNo.length !== 1) {
                messageError.push("Job No");
            }
            if (objecttive.length !== 1) {
                messageError.push("Objective");
            }
            if (sampleType.length !== 1) {
                messageError.push("Sample Type");
            }
            if (messageError.length > 0) {
                error = true;
                setMessageContent(
                    "Please select all items with the same " +
                    messageError.join(", ") +
                    "!"
                );
                setShowMessage(true);
                setTitlePopup("Error");
            }
        }
        if (!error) {
            console.log('history.push 15')
            history.push({ pathname: PATHS.CREATE_COC, state: { samples: listSamplesSeleted } });
        }
    }, [history, listSamplesSeleted]);

    /**
     * Handle close message
     * @type {*}
     */
    const handleCloseMessage = useCallback(() => {
        setShowMessage(false);
    }, []);

    /**
     * Handle close sample detail
     */
    const handleCloseSampleDetail = useCallback(() => {
        setShowSampleDetail(false);
    }, []);

    /**
     * Handle save sample detail
     */
    const handleSavedSampleDetail = useCallback(() => {
        setShowSampleDetail(false);
        toast.success("Save Sample successfully!");
        dispatch(setEditSuccess(false));
        setTimeout(() => {
            dispatch(getLists({
                ...paramQuery
            }));
        }, 1500)
    }, [dispatch, paramQuery]);

    /**
     * Handle closee test type form
     */
    const handleCloseTestTypeForm = useCallback((submited) => {
        setShowTestTypeForm(false);
        if (submited) {
            setTimeout(() => {
                dispatch(getLists({
                    ...paramQuery
                }));
            }, 1000);
        }
    }, [dispatch, paramQuery]);

    /**
     * Set current page when click button next or prev page
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
     * @param {Object} selectedColumn
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
     * Handle search sample
     * @param {String} searchParam
     */
    const handleSearchSample = (searchParam) => {
        setParamQuery({
            ...paramQuery,
            ...searchParam,
        });
    }

    /**
     * Get list when click sort or change page
     */
    useEffect(() => {
        dispatch(getLists({
            ...paramQuery,
        }));
    }, [paramQuery]);

    return (
        <div className="sample-table-wrapper">
            <SearchBar onSubmit={handleProcessSamples} handleSearchSample={handleSearchSample} />
            {showMessage && (
                <Message
                    open={showMessage}
                    closeModal={() => handleCloseMessage()}
                    message={messageContent}
                    title={titlePopup}
                />
            )}
            {showSampleDetail && (
                <EditSample
                    open={showSampleDetail}
                    closeModal={() => handleCloseSampleDetail()}
                    sampleId={sampleDetail?.sampleid}
                    barcode={sampleDetail?.barcode}
                    savedSample={() => handleSavedSampleDetail()}
                />
            )}
            {showTestTypeForm && selectedSampleAssignTest?.length > 0 && (
                <TestTypeForm selectedSample={selectedSampleAssignTest} sampleType={selectedSampleAssignTest[0]?.sampletype} open={showTestTypeForm} closeModal={(submited: boolean) => handleCloseTestTypeForm(submited)} />
            )}

            <DataTable
                persistTableHead
                columns={columns}
                data={rows}
                selectableRows={false}
                fixedHeader={true}
                selectableRowsHighlight={true}
                progressPending={listLoading}
                progressComponent={<div className="table-loading"><div className="loading-inner"><Spinner animation="border" role="status" /></div></div>}
                onRowClicked={(row: Sample, event) => {
                    setShowSampleDetail(true);
                    setSampleDetail(row);
                }}
                clearSelectedRows={toggleCleared}

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
    );
}
