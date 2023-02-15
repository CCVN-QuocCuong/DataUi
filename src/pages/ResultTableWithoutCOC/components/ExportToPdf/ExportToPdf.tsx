import React from 'react';
import { Table, Row, Col } from 'react-bootstrap';
import { useAppSelector } from "hooks";
import logo_tt from "assets/images/logo_tt.png";
import "./style.css";

type Code = {
    [key: string]: any;
};

export function ExportToPdf({ samples, formInfo }) {
    const { codes } = useAppSelector((state) => state.code);
    const conpanyName: Code = codes?.find((item: Code) => item?.codeid === formInfo?.companyid) || {};
    const labName: Code = codes?.find((item: Code) => item?.codeid === formInfo?.labid) || {};
    const capitalizeFirst = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <div className="lab-file-pdf-wrapper">
            <Row>
                <Col span={6}>
                    <img src={logo_tt} alt="logo_tt" className="logo" />
                </Col>
                <Col span={6}>
                    <h2>Project Contact Information</h2>
                </Col>
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
                                    {formInfo?.address?.split('\n').map((addline, i) => (
                                        <span key={i}>
                                            {addline}
                                            <br />
                                        </span>
                                    ))}
                                </td>
                            </tr>
                            <tr className="item-info">
                                <td>Client Ref(T+T Job No)</td>
                                <td>{formInfo?.jobno || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Site ID</td>
                                <td>{formInfo?.siteid || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Client Order# (T+T COC ID)</td>
                                <td>&nbsp;</td>
                            </tr>
                            <tr className="item-info">
                                <td>Lab Quote No</td>
                                <td>{formInfo?.labquoteno || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Primary Contact</td>
                                <td>{formInfo?.primarycontact || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Phone</td>
                                <td>{formInfo?.ttcontactphone || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Email</td>
                                <td>{formInfo?.ttemailaddress || ""}</td>
                            </tr>
                            <tr className="item-info">
                                <td>Email other</td>
                                <td>&nbsp;</td>
                            </tr>
                            <tr className="item-info">
                                <td>Submitted By</td>
                                <td>{formInfo?.createdby || ""}</td>
                            </tr>
                            <tr className="addtional item-info">
                                <td>Additional Infomation</td>
                                <td>
                                    {formInfo?.comment?.split('\n').map((additional, i) => (
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
                                    {formInfo?.labaddress?.split('\n').map((address, i) => (
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
                                <td>{capitalizeFirst(formInfo?.priority || "")}</td>
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
                    </tr >
                </thead >
                <tbody>
                    {samples?.map((sample, index) => (
                        <tr key={index}>
                            <td className="sample-no">{index + 1}</td>
                            <td className="sample-name">{sample?.labsamplename || ""}</td>
                            <td className="sample-container-type"></td>
                            <td className="sample-datetime"></td>
                            <td className="sample-type"></td>
                            <td className="sample-barcode"></td>
                            <td className="sample-test"><span className="assign-text"></span></td>
                        </tr>
                    ))}
                </tbody>
            </Table >
        </div >
    );
}