/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import DataTable from "react-data-table-component";
import { Spinner, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "hooks";
import { getCOCByID } from "store/coc";
import { columnsSoil, columnsWater, columnsGas } from "./const";
import ModalConfirm from "components/ModalConfirm";
import TestTypeForm from "components/TestTypeForm";
import AddSampleModal from "components/AddSampleModal";
import "./style.css";

type Sample = {
    [key: string]: any;
};

export function SampleDetails({ samplesSelected, changeSampleSelected, changeIsDirty }) {
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const [selectedSample, setSelectedSample] = useState<Sample[]>([]);
    const [rows, setRows] = useState<object[]>([]);
    const [columns, setColumns] = useState<object[]>(columnsSoil);
    const [sampleBarcode, setSampleBarcode] = useState<string>();
    const [showTestTypeForm, setShowTestTypeForm] = useState(false);
    const [showAddSample, setShowAddSample] = useState(false);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const { loading } = useAppSelector((state) => state.coc);

    const removeSample = {
        name: "Remove",
        selector: (row) => row.id,
        sortable: false,
        cell: (row) => samplesSelected?.length > 1 && (<Button variant="light" onClick={() => {
            setShowModalDelete(true);
            setSampleBarcode(row.barcode);
        }}>Remove</Button>),
        wrap: true,
        width: "150px",
    }

    const newColumnsSoil = [
        ...columnsSoil,
        {
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
                        setSelectedSample([row]);
                    }}>{row.teststringlist ? row.teststringlist : "Click to assign Test"}</span>
                </OverlayTrigger>
            ,
            wrap: true,
            width: "250px",
        },
        removeSample,
    ];

    const newColumnsGas = [
        ...columnsGas,
        {
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
                        setSelectedSample([row]);
                    }}>{row.teststringlist ? row.teststringlist : "Click to assign Test"}</span>
                </OverlayTrigger>,
            wrap: true,
            width: "250px",
        },
        removeSample,
    ];

    const newColumnsWater = [
        ...columnsWater,
        {
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
                        setSelectedSample([row]);
                    }}>{row.teststringlist ? row.teststringlist : "Click to assign Test"}</span>
                </OverlayTrigger>,
            wrap: true,
            width: "250px",
        },
        removeSample,
    ];

    useEffect(() => {
        if (samplesSelected?.length > 0) {
            setRows(samplesSelected);
            switch (samplesSelected[0]?.sampletype) {
                case "Liquid":
                    setColumns(newColumnsWater);
                    break;
                case "Landfill Gas":
                    setColumns(newColumnsGas);
                    break;
                default:
                    setColumns(newColumnsSoil);
                    break;
            }
        }
    }, [samplesSelected]);

    /**
     * Handle close test type form
     */
    const handleCloseTestTypeForm = useCallback((submited) => {
        setShowTestTypeForm(false);
        setSelectedSample([]);
        setToggleCleared(true);
        if (submited) {
            setTimeout(() => {
                dispatch(getCOCByID(id));
            }, 1000);
        }
    }, []);

    /**
     * Handle close add sample
     */
    const handleCloseAddSample = useCallback(() => {
        setToggleCleared(true);
        setShowAddSample(false);
    }, []);

    /**
     * Handle close modal confirm
     */
    const handleCloseModalConfirm = useCallback(() => {
        setShowModalDelete(false);
    }, []);

    /**
     * Handle add sample
     */
    const handleAddSample = useCallback((data) => {
        setShowAddSample(false);
        const newListSample = [
            ...data,
            ...rows,
        ];
        changeSampleSelected(newListSample);
        changeIsDirty(true);
    }, [rows]);

    /**
     * Handle remove sample
     */
    const handleRemoveSample = useCallback(() => {
        setShowModalDelete(false);
        const newListSample = samplesSelected.filter((item: Sample) => item.barcode !== sampleBarcode);
        changeSampleSelected(newListSample);
        changeIsDirty(true);
    }, [samplesSelected, sampleBarcode]);

    useEffect(() => {
        if (toggleCleared) {
            setToggleCleared(false);
        }
    }, [toggleCleared]);
    return (
        <div className="sample-table-wrapper">
            {showTestTypeForm && selectedSample?.length > 0 && (
                <TestTypeForm selectedSample={selectedSample} sampleType={samplesSelected?.[0]?.sampletype || ""} open={showTestTypeForm} closeModal={(submited: boolean) => handleCloseTestTypeForm(submited)} />
            )}

            {showAddSample && samplesSelected?.length > 0 && (
                <AddSampleModal samplesSelected={samplesSelected} open={showAddSample} closeModal={() => handleCloseAddSample()} addSample={(data) => handleAddSample(data)} />
            )}

            {showModalDelete && samplesSelected?.length > 0 && (
                <ModalConfirm open={showModalDelete} handleConfirm={() => handleRemoveSample()} closeModal={() => handleCloseModalConfirm()} message="Are you sure you want to remove this Sample in Sample Details!" title="Remove Sample" />
            )}
            <DataTable
                columns={columns}
                data={rows}
                selectableRows={true}
                fixedHeader={true}
                selectableRowsHighlight={true}
                progressPending={loading}
                progressComponent={<div className="table-loading"><div className="loading-inner"><Spinner animation="border" role="status" /></div></div>}
                pagination
                paginationRowsPerPageOptions={[10, 15, 20, 25, 30, 50]}
                persistTableHead
                onSelectedRowsChange={({ selectedRows }) => {
                    setSelectedSample(selectedRows);
                }}
                clearSelectedRows={toggleCleared}
            />
            <div className="button-group text-right">
                <Button variant="secondary" type="button" disabled={selectedSample?.length <= 0} onClick={() => setShowTestTypeForm(true)}>
                    Assign Test
                </Button>
                <Button variant="secondary" type="button" onClick={() => setShowAddSample(true)}>
                    Add Sample
                </Button>
            </div>
        </div >
    );
}
