/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useHistory, generatePath } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import moment from "moment-timezone";
import { useAppDispatch, useAppSelector } from "hooks";
import { getLists } from "store/coc";
import PATHS from "routes/const";
import SearchBar from "../SearchBar";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function COCTable() {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [rows, setRows] = useState<object[]>([]);
    const [paramQuery, setParamQuery] = useState<Object>({});
    const { cocs, loading, pagination } = useAppSelector((state) => state.coc);
    const { codes } = useAppSelector((state) => state.code);
    const listCompanies = codes?.filter((item: Object) => item?.codetypecode === "Company");
    const listLabs = codes?.filter((item: Object) => item?.codetypecode === "Lab");

    const columns = [
        {
            id: "cocid",
            name: "COC#",
            selector: (row) => `COC${row?.cocid} V${row?.version || 0}`,
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.cocid?.toString() || "")?.localeCompare(b?.cocid?.toString() || ""),
        },
        {
            id: "companyid",
            name: "Company Name",
            selector: (row) => row?.companyid || "",
            cell: (row) => listCompanies.find((item) => item?.codeid === row.companyid)?.codename || "",
            sortable: true,
            wrap: true,
            width: "200px",
            sortFunction: (a, b) => (listCompanies.find((item) => item?.codeid === a?.companyid)?.codename || "")?.localeCompare(listCompanies.find((item) => item?.codeid === b?.companyid)?.codename || ""),
        },
        {
            id: "jobno",
            name: "Job No",
            selector: (row) => row?.jobno || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.jobno || "")?.localeCompare(b?.jobno || ""),
        },
        {
            id: "siteid",
            name: "Site ID",
            selector: (row) => row?.siteid || "",
            sortable: true,
            wrap: true,
            width: "100px",
            sortFunction: (a, b) => (a?.siteid || "")?.localeCompare(b?.siteid || ""),
        },
        {
            id: "objective",
            name: "Objective",
            selector: (row) => row?.objective || "",
            sortable: true,
            wrap: true,
            width: "120px",
            sortFunction: (a, b) => (a?.objective || "")?.localeCompare(b?.objective || ""),
        },
        {
            id: "created",
            name: "Create Date",
            selector: (row) => row.created,
            sortable: true,
            cell: (row) =>
                row.created &&
                moment
                    .tz(row.created, "NZ")
                    .format("MM-DD-YYYY HH:mm:ss"),
            wrap: true,
            width: "150px",
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
            id: "labid",
            name: "Lab Name",
            selector: (row) => row.labid,
            cell: (row) => listLabs.find((item) => item?.codeid === row.labid)?.codename || "",
            sortable: true,
            wrap: true,
            width: "200px",
            sortFunction: (a, b) => (listLabs.find((item) => item?.codeid === a.labid)?.codename || "")?.localeCompare(listLabs.find((item) => item?.codeid === b.labid)?.codename || ""),
        },
        {
            id: "labreference",
            name: "Lab Reference",
            selector: (row) => row?.labreference || "",
            sortable: true,
            wrap: true,
            width: "200px",
            sortFunction: (a, b) => (a?.labreference || "")?.localeCompare(b?.labreference || ""),
        },
        {
            id: "labquoteno",
            name: "Lab Quote#",
            selector: (row) => row?.labquoteno || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.labquoteno || "")?.localeCompare(b?.labquoteno || ""),
        },
        {
            id: "primarycontact",
            name: "Primary Contact",
            selector: (row) => row?.primarycontact || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.primarycontact || "")?.localeCompare(b?.primarycontact || ""),
        },
        {
            id: "ttcontactphone",
            name: "Phone",
            selector: (row) => row?.ttcontactphone || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.ttcontactphone || "")?.localeCompare(b?.ttcontactphone || ""),
        },
        {
            id: "ttemailaddress",
            name: "Email",
            selector: (row) => row?.ttemailaddress || "",
            sortable: true,
            wrap: true,
            width: "220px",
            sortFunction: (a, b) => (a?.ttemailaddress || "")?.localeCompare(b?.ttemailaddress || ""),
        },
        {
            id: "submitter",
            name: "Submitter",
            selector: (row) => row?.submitter || "",
            sortable: true,
            wrap: true,
            width: "150px",
            sortFunction: (a, b) => (a?.submitter || "")?.localeCompare(b?.submitter || ""),
        },
        {
            id: "priority",
            name: "Priority",
            selector: (row) => (<div className="text-priority">{row?.priority || ""}</div>),
            sortable: true,
            wrap: true,
            width: "80px",
            sortFunction: (a, b) => (a?.priority || "")?.localeCompare(b?.priority || ""),
        },
    ];

    useEffect(() => {
        if (Array.isArray(cocs)) setRows(cocs);
    }, [cocs]);

    useEffect(() => {
        dispatch(getLists({
            ...paramQuery,
        }));
    }, [paramQuery]);

    /**
     * Handle change page by number
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
            pagesize: currentRowsPerPage,
        });
    }

    /**
     * Handle sort list data
     * @param {String} selectedColumn
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
     * Handle search Sample
     * @param {Object} searchParam
     */
    const handleSearchSample = useCallback((searchParam) => {
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
    },[pagination, paramQuery])

    return (
        <div className="coc-table-wrapper">
            <SearchBar handleSearchSample={handleSearchSample} />
            <DataTable
                persistTableHead
                columns={columns}
                data={rows}
                selectableRows={false}
                fixedHeader={true}
                selectableRowsHighlight={true}
                progressPending={loading}
                progressComponent={<div className="table-loading"><div className="loading-inner"><Spinner animation="border" role="status" /></div></div>}
                onRowClicked={(row: Object, event) => {
                    console.log('history.push 12')
                    history.push(generatePath(PATHS.RESULT_TABLE_COC_DETAIL, {
                        id: row?.cocid,
                    }));
                }}
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
        </div >
    );
}
