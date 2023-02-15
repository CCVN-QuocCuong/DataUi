/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Table, Row, Col } from 'react-bootstrap';
import moment from "moment-timezone";
import { useAppSelector } from "hooks";
import { concatSampleName } from "helpers/sample";
import logo_tt from "assets/images/logo_tt.png";
import "./style.css";

type Sample = {
    [key: string]: any;
};

type Code = {
    [key: string]: any;
};

export function ExportCOCToPdf({ samples, coc }) {
    const [rows, setRows] = useState<Sample[]>([]);
    const { codes } = useAppSelector((state) => state.code);
    const conpanyName: Code = codes?.find((item: Code) => item?.codeid === coc?.companyid) || {};
    const labName: Code = codes?.find((item: Code) => item?.codeid === coc?.labid) || {};

    useEffect(() => {
        if (samples?.length > 0) {
            setRows(samples);
        }
    }, [samples]);

    /**
     * Handle capitalize first charater
     * @param {String} str
     * @returns {String}
     */
    const capitalizeFirst = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <div className="coc-pdf-wrapper">
            <Row>
                <Col span={6}>
                    <img src={logo_tt} alt="logo_tt" className="logo" />
                </Col>
                <Col span={6} />
            </Row>
            <Row>
                <Col span={6}>
                    <Table className="table-infomation">
                        <thead>
                            <tr>
                                <th colSpan={2}><span>Client Infomation</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="item-info">
                                <td>Company Name</td>
                                <td>{conpanyName?.codename || ""}</td>
                            </tr>
                            <tr className="address item-info">
                                <td>Address</td>
                                <td>
                                    {coc?.address?.split('\n').map((addline, i) => (
                                        <span key={i}>
                                            {addline}
                                            <br />
                                        </span>
                                    ))}
                                </td>
                            </tr>
                            <tr className="item-info">
                                <td>Client Ref(T+T Job No)</td>
                                <td>{coc?.jobno || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Site ID</td>
                                <td>{coc?.siteid || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Client Order# (T+T COC ID)</td>
                                <td>{`COC${coc?.cocid}`}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Lab Quote No</td>
                                <td>{coc?.labquoteno || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Primary Contact</td>
                                <td>{coc?.primarycontact || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Phone</td>
                                <td>{coc?.ttcontactphone || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Email</td>
                                <td>{coc?.ttemailaddress || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Email other</td>
                                <td>{coc?.emailother || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Submitted By</td>
                                <td>{coc?.createdby || ""}</td>
                            </tr>
                            <tr className="addtional item-info">
                                <td>Additional Infomation</td>
                                <td>
                                    {coc?.comment?.split('\n').map((additional, i) => (
                                        <span key={i}>
                                            {additional}
                                            <br />
                                        </span>
                                    ))}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
                <Col span={6}>
                    <Table className="table-infomation">
                        <thead>
                            <tr>
                                <th colSpan={2}><span>Sent to Lab</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="item-info">
                                <td>Lab</td>
                                <td>{labName?.codename || ""}</td>
                            </tr>
                            <tr className="address item-info">
                                <td>Address</td>
                                <td>
                                    {coc?.labaddress?.split('\n').map((address, i) => (
                                        <span key={i}>
                                            {address}
                                            <br />
                                        </span>
                                    ))}
                                </td>
                            </tr>
                            <tr className="item-info">
                                <td>Date & Time</td>
                                <td>&nbsp;</td>
                            </tr>
                            <tr className="item-info">
                                <td>Priority</td>
                                <td>{capitalizeFirst(coc?.priority || "")}</td>
                            </tr>
                            <tr className="item-info">
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                            </tr>
                            <tr className="item-info">
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                            </tr>
                        </tbody>
                    </Table>
                    <Table className="table-infomation">
                        <thead>
                            <tr>
                                <th colSpan={2}><span>Received by Lab</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="item-info">
                                <td>Date & Time</td>
                                <td>&nbsp;</td>
                            </tr>
                            <tr className="item-info">
                                <td>Name</td>
                                <td>&nbsp;</td>
                            </tr>
                            <tr className="item-info">
                                <td>Signature</td>
                                <td>&nbsp;</td>
                            </tr>
                            <tr>
                                <td>{coc?.version?.toString() || ""}</td>
                                <td>{coc?.comment || coc?.note}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Table className="table-sample">
                <thead>
                    <tr>
                        <th className="sample-no">NO.</th>
                        <th className="sample-name">Sample Name</th>
                        <th className="sample-container-type">Container Type</th>
                        <th className="sample-datetime">Date & Time</th>
                        <th className="sample-type">Sample Type</th>
                        <th className="sample-barcode">Barcode</th>
                        <th className="sample-test">Tests Required</th>
                    </tr>
                </thead>
                <tbody>
                    {rows?.map((sample, index) => (
                        <tr key={index}>
                            <td className="sample-no">{index + 1}</td>
                            <td className="sample-name">{concatSampleName(sample)}</td>
                            <td className="sample-container-type">{sample?.containertype || ""}</td>
                            <td className="sample-datetime">{sample?.collectiondate ? moment
                                .tz(sample.collectiondate, "NZ")
                                .format("MM-DD-YYYY HH:mm:ss") : ""}</td>
                            <td className="sample-type">{sample?.sampletype || ""}</td>
                            <td className="sample-barcode">{sample?.barcode || ""}</td>
                            <td className="sample-test"><span className="assign-text">{sample?.teststringlist || ""}</span></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}