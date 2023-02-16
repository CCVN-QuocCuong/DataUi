import moment from "moment-timezone";
import { concatSampleName } from "helpers/sample";

export const columnsSoil = [
    {
        name: "ID",
        selector: (row) => row.sampleid,
        sortable: true,
        wrap: true,
        omit: true,
        width: "0",
    },
    {
        name: "Site ID",
        selector: (row) => row.siteid,
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "Sample Name",
        selector: (row) => concatSampleName(row),
        sortable: true,
        wrap: true,
        width: "180px",
    },
    {
        name: "Equipment Used",
        selector: (row) => row.duplicatename,
        sortable: true,
        wrap: true,
        width: "180px",
    },
    {
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
        name: "Screen Depth",
        selector: (row) => row.fromdepth,
        cell: (row) =>
            row.fromdepth?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "Sample Type",
        selector: (row) => row.sampletype,
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "Objective",
        selector: (row) => row.objective,
        sortable: true,
        wrap: true,
        width: "150px",
    },
    {
        name: "Material Type",
        selector: (row) => row.samplematerialtype,
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "Container Type",
        selector: (row) => row.containertype,
        sortable: true,
        wrap: true,
        width: "150px",
    },
    {
        name: "Lab Barcode",
        selector: (row) => row.barcode,
        sortable: true,
        wrap: true,
        width: "150px",
    }
];

export const columnsWater = [
    {
        name: "ID",
        selector: (row) => row.sampleid,
        sortable: true,
        wrap: true,
        omit: true,
        width: "0",
    },
    {
        name: "Site ID",
        selector: (row) => row.siteid,
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "Sample Name",
        selector: (row) => concatSampleName(row),
        sortable: true,
        wrap: true,
        width: "180px",
    },
    {
        name: "Duplicate Name",
        selector: (row) => row.duplicatename,
        sortable: true,
        wrap: true,
        width: "180px",
    },
    {
        name: "Collection Date",
        selector: (row) => row.collectiondate,
        sortable: true,
        cell: (row) =>
            row.collectiondate &&
            moment
                .tz(row.collectiondate * 1000, "NZ")
                .format("MM-DD-YYYY HH:mm:ss"),
        wrap: true,
        width: "150px",
    },
    {
        name: "Depth Range",
        selector: (row) => row.fromdepth,
        cell: (row) =>
            row.fromdepth?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        sortable: true,
        wrap: true,
        width: "120px",
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
        name: "Sample Type",
        selector: (row) => row.sampletype,
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "Objective",
        selector: (row) => row.objective,
        sortable: true,
        wrap: true,
        width: "150px",
    },
    {
        name: "Material Type",
        selector: (row) => row.samplematerialtype,
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "Container Type",
        selector: (row) => row.containertype,
        sortable: true,
        wrap: true,
        width: "150px",
    },
    {
        name: "Lab Barcode",
        selector: (row) => row.barcode,
        sortable: true,
        wrap: true,
        width: "150px",
    }
];

export const columnsGas = [
    {
        name: "ID",
        selector: (row) => row.sampleid,
        sortable: true,
        wrap: true,
        omit: true,
        width: "0",
    },
    {
        name: "Site ID",
        selector: (row) => row.siteid,
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "Sample Name",
        selector: (row) => concatSampleName(row),
        sortable: true,
        wrap: true,
        width: "180px",
    },
    {
        name: "Equipment Used",
        selector: (row) => row.duplicatename,
        sortable: true,
        wrap: true,
        width: "180px",
    },
    {
        name: "Collection Date",
        selector: (row) => row.collectiondate,
        sortable: true,
        cell: (row) =>
            row.collectiondate &&
            moment
                .tz(row.collectiondate * 1000, "NZ")
                .format("MM-DD-YYYY HH:mm:ss"),
        wrap: true,
        width: "150px",
    },
    {
        name: "Screen Depth",
        selector: (row) => row.fromdepth,
        cell: (row) =>
            row.fromdepth?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        sortable: true,
        wrap: true,
        width: "120px",
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
        name: "Methan (%)",
        selector: (row) => "",
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "CO2 (%)",
        selector: (row) => "",
        sortable: true,
        wrap: true,
        width: "150px",
    },
    {
        name: "O2 (%)",
        selector: (row) => "",
        sortable: true,
        wrap: true,
        width: "120px",
    },
    {
        name: "CO",
        selector: (row) => "",
        sortable: true,
        wrap: true,
        width: "150px",
    },
    {
        name: "H2S (ppm)",
        selector: (row) => "",
        sortable: true,
        wrap: true,
        width: "150px",
    },
    {
        name: "VOC (%)",
        selector: (row) => row.sampleid,
        sortable: false,
        cell: (row) => "",
        wrap: true,
        width: "150px",
    },
    {
        name: "Bal (%)",
        selector: (row) => row.sampleid,
        sortable: false,
        cell: (row) => "",
        wrap: true,
        width: "100px",
    },
];