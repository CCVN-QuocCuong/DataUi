/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import { Form, Row, Col, Modal, Button, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { PDFExport } from "@progress/kendo-react-pdf";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "hooks";
import { AddCOCValidation } from "schema/coc";
import { getFileSamples, getFormLabFile, saveFormLabFile, setUpdateSuccess } from "store/file";
import PATHS from "routes/const";
import ExportToPdf from "../ExportToPdf";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function FormModal({ open, closeModal, fileid, setIsDirty }) {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const refForm = useRef<HTMLFormElement | null>(null);
    const pdfExportComponent = React.useRef<PDFExport>(null);
    const [validated, setValidated] = useState(false);
    const [isPrint, setIsPrint] = useState(false);
    const { updateSuccess, loading, formLoading, samples } = useAppSelector((state) => state.file);
    const [codes, formInfo] = useAppSelector((state) => [state.code?.codes, state.file?.formInfo]);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const listCompanies = codes?.filter((item: Object) => item?.codetypecode === "Company");
    const optionsCompany = listCompanies?.map((item: Object) => ({
        value: item.codeid,
        label: item.codename,
    }));

    const listLabs = codes?.filter((item: Object) => item?.codetypecode === "Lab");
    const optionsLab = listLabs?.map((item: Object) => ({
        value: item.codeid,
        label: item.codename,
    }));

    const listObjectives = codes?.filter((item: Object) => item?.codetypecode === "Objective");
    const optionsObjective = listObjectives?.map((item: Object) => ({
        value: item.codename,
        label: item.codename,
    }));

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
        reset,
    } = useForm({
        mode: "onSubmit",
        reValidateMode: "onChange",
        resolver: yupResolver(AddCOCValidation),
    });

    const company = watch('companyid');
    const lab = watch('labid');

    useEffect(() => {
        dispatch(getFileSamples(fileid));
        dispatch(getFormLabFile(fileid));
    }, []);

    useEffect(() => {
        if (company && company * 1 !== 0) {
            const companyAddress: Object = listCompanies?.find((item: Object) => item.codeid === company * 1) || {};
            setValue("address", companyAddress?.address || "");
        } else {
            setValue("address", "");
        }
    }, [company]);

    useEffect(() => {
        if (lab && lab * 1 !== 0) {
            const labAddress: Object = listLabs?.find((item: Object) => item.codeid === lab * 1) || {};
            setValue("labaddress", labAddress?.address || "");
        } else {
            setValue("labaddress", "");
        }
    }, [lab]);

    useEffect(() => {
        if (formInfo) {
            setValue("address", formInfo?.address || "");
            setValue("companyid", formInfo?.companyid || 0);
            setValue("createdby", formInfo?.createdby || "");
            setValue("jobno", formInfo?.jobno || "");
            setValue("labaddress", formInfo?.labaddress || "");
            setValue("labid", formInfo?.labid || 0);
            setValue("labquoteno", formInfo?.labquoteno || "");
            setValue("objective", formInfo?.objective || "");
            setValue("primarycontact", formInfo?.primarycontact || "");
            setValue("siteaddress", formInfo?.siteaddress || "");
            setValue("siteid", formInfo?.siteid || "");
            setValue("ttcontactphone", formInfo?.ttcontactphone || "");
            setValue("ttemailaddress", formInfo?.ttemailaddress || "");
        }
    }, [formInfo, updateSuccess]);

    useEffect(() => {
        if (updateSuccess) {
            toast.success('Save form successfully!');
            reset()
            setValidated(false);
            dispatch(setUpdateSuccess(false));
            if (isPrint) {
                setTimeout(() => {
                    exportPDFWithComponent();
                    setIsPrint(false);
                }, 1000);
            }
        }
    }, [updateSuccess]);

    useEffect(() => {
        setIsDirty(isDirty);
    }, [isDirty]);

    /**
     * Handle on submit form
     * @async
     * @param {*} data
     */
    const onSubmit = async (data) => {
        const dataLabFile = {
            ...data,
            lastmodifiedby: currentUser?.username,
            fileid: fileid,
            formid: formInfo?.formid || null,
        }
        await dispatch(saveFormLabFile(dataLabFile));
    };

    /**
     * Handle submit save
     */
    const handleSubmitSave = () => {
        setIsPrint(false);
        refForm?.current?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
        );
    };

    /**
     * Handle submit save and print pdf file
     */
    const handleSubmitSavePrint = () => {
        setIsPrint(true);
        refForm?.current?.dispatchEvent(
            new Event("submit", { cancelable: true, bubbles: true })
        );
    };

    /**
     * Handle submit print pdf file
     */
    const handleSubmitPrint = () => {
        exportPDFWithComponent();
    };

    /**
     * Handle close popup
     */
    const handleClosePopup = () => {
        if (!isDirty) {
            closeModal();
        } else {
            console.log('history.push 14')
            history.push(PATHS?.RESULT_TABLE_NO_COC, { closeForm: true })
        }
    }

    /**
     * Handle export pdf file
     */
    const exportPDFWithComponent = () => {
        if (pdfExportComponent?.current) {
            pdfExportComponent?.current?.save();
        }
    };

    return (
        <Modal show={open} onHide={handleClosePopup} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Lab Form</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="lab-file-form-wrapper">
                    {formLoading ? (
                        <div className="loading-icon">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Form
                            id="form-create-nococ"
                            noValidate
                            validated={validated}
                            ref={refForm}
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Row>
                                <Col xs={12} sm={6} md={4} lg={4}>
                                    <Form.Group className="form-item" controlId="jobno">
                                        <Form.Label>Job No</Form.Label>
                                        <Form.Control type="text" {...register("jobno")} />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.jobno?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="labquoteno"
                                    >
                                        <Form.Label>Lab Quote No</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("labquoteno")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.labquoteno?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="form-item" controlId="createdby">
                                        <Form.Label>Submitted By</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("createdby")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.createdby?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="form-item" controlId="siteid">
                                        <Form.Label>Site ID</Form.Label>
                                        <Form.Control type="text" {...register("siteid")} />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.siteid?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="siteaddress"
                                    >
                                        <Form.Label>Site Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            as="textarea"
                                            rows={7}
                                            {...register("siteaddress")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.siteaddress?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={4} lg={4}>
                                    <Form.Group className="form-item" controlId="objective">
                                        <Form.Label>Objective</Form.Label>
                                        <Form.Select
                                            aria-label="Select Objective"
                                            {...register("objective")}
                                        >
                                            <option value="">--Select Objective--</option>
                                            {optionsObjective.map((option: Object) => (
                                                <option value={option.value} key={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.objective?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="form-item" controlId="companyid">
                                        <Form.Label>Company</Form.Label>
                                        <Form.Select
                                            aria-label="Select Company"
                                            {...register("companyid")}
                                        >
                                            <option value={0}>--Select Company--</option>
                                            {optionsCompany.map((option) => (
                                                <option
                                                    value={option.value}
                                                    key={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.companyid?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="form-item" controlId="address">
                                        <Form.Label>Company Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            as="textarea"
                                            rows={4}
                                            {...register("address")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.address?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="primarycontact"
                                    >
                                        <Form.Label>Primary Contact</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("primarycontact")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.primarycontact?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="ttcontactphone"
                                    >
                                        <Form.Label>Phone</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("ttcontactphone")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.ttcontactphone?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="ttemailaddress"
                                    >
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="ttemailaddress"
                                            {...register("ttemailaddress")}
                                        />

                                        <Form.Control.Feedback type="invalid">
                                            {errors?.ttemailaddress?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={4} lg={4}>
                                    <Form.Group className="form-item" controlId="labid">
                                        <Form.Label>Lab</Form.Label>
                                        <Form.Select
                                            aria-label="Select Lab"
                                            {...register("labid")}
                                        >
                                            <option value={0}>--Select Lab--</option>
                                            {optionsLab.map((option) => (
                                                <option
                                                    value={option.value}
                                                    key={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.labid?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="labaddress"
                                    >
                                        <Form.Label>Lab Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            as="textarea"
                                            rows={5}
                                            {...register("labaddress")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.labaddress?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="form-item" controlId="comment">
                                        <Form.Label>Additional Infomation</Form.Label>
                                        <Form.Control
                                            type="text"
                                            as="textarea"
                                            rows={9}
                                            {...register("comment")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.comment?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="button-group text-right">
                                <Button
                                    variant="secondary"
                                    type="button"
                                    disabled={loading || !isDirty}
                                    onClick={handleSubmitSave}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    disabled={loading || !isDirty}
                                    onClick={handleSubmitSavePrint}
                                >
                                    Save & Print
                                </Button>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    disabled={loading || isDirty || !formInfo?.formid}
                                    onClick={handleSubmitPrint}
                                >
                                    Print
                                </Button>
                                <Button
                                    variant="secondary"
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleClosePopup()}
                                >
                                    Close
                                </Button>
                            </div>
                        </Form>
                    )}
                    <div className="export-lab-file-wrapper">
                        <PDFExport
                            ref={pdfExportComponent}
                            scale={0.7}
                            paperSize="A4"
                            fileName="Project Contact Information"
                            author="TnT Team"
                        >
                            <ExportToPdf samples={samples} formInfo={formInfo} />
                        </PDFExport>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}
