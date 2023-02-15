/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Form, Container, Row, Col, Button, Modal, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { concatSampleName } from "helpers/sample";
import { useAppDispatch, useAppSelector } from "hooks";
import { SampleValidation } from "schema/sample";
import { getSampleByID, singleSample } from "store/sample";
import {
    optionsSampleType,
    optionMaterialType,
    optionContainerType,
} from "constants/options";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function EditSample({ open, sampleId, barcode, closeModal, savedSample }) {
    const dispatch = useAppDispatch();
    const { isEditSampleSuccess, sample, loadingDetail } = useAppSelector((state) => state.sample);
    const { codes } = useAppSelector((state) => state.code);
    const [saving, setSaving] = useState(false);
    const listObjectives = codes?.filter((item: Object) => item?.codetypecode === "Objective");
    const optionsObjective = listObjectives?.map((item: Object) => ({
        value: item.codename,
        label: item.codename,
    }));

    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onSubmit',
        reValidateMode: 'onChange',
        resolver: yupResolver(SampleValidation),
    });

    useEffect(() => {
        setValue('jobnumber', sample?.jobnumber || "");
        setValue('siteid', sample?.siteid || "");
        setValue('pointname', sample?.pointname || "");
        setValue('duplicatename', sample?.duplicatename || "");
        setValue('objective', sample?.objective || "");
        setValue('sampletype', sample?.sampletype || "");
        setValue('objectiveother', sample?.objectiveother || "");
        setValue('fromdepth', sample?.fromdepth);
        setValue('todepth', sample?.todepth);
        setValue('samplematerialtype', sample?.samplematerialtype || "");
        setValue('barcode', sample?.barcode || "");
        setValue('containertype', sample?.containertype || "");
        setValue('collectiondate', new Date(sample.collectiondate) || null);
    }, [sample]);

    useEffect(() => {
        reset({});
        if (sampleId && barcode) dispatch(getSampleByID({ sampleId, barcode }));
    }, [sampleId, barcode, open]);

    /**
     * Handle submit input form
     * @async
     * @param {Object} dataSample
     */
    const onSubmit = async (dataSample) => {
        const collectionDate = dataSample?.collectiondate ? new Date(dataSample.collectiondate).toISOString().replace('.000Z', '') : "";
        setSaving(true);
        const newData = {
            "sampleid": sample?.sampleid,
            "createdby": sample?.createdby,
            "collectiondate": collectionDate,
            "objective": dataSample?.objective,
            "objectiveother": dataSample?.objectiveother,
            "jobnumber": dataSample?.jobnumber,
            "siteid": dataSample?.siteid,
            "siteaddress": sample?.siteaddress,
            "pointname": dataSample?.pointname,
            "duplicatename": "Duplicate name",
            "fromdepth": dataSample?.fromdepth * 1,
            "todepth": dataSample?.todepth * 1,
            "sampletype": dataSample?.sampletype,
            "samplematerialtype": dataSample?.samplematerialtype,
            "containertype": dataSample?.containertype,
            "barcode": dataSample?.barcode,
            "testidlist": sample?.testidlist,
            "teststringlist": sample?.teststringlist,
        }
        await dispatch(singleSample(newData));
        setSaving(false);
    }

    useEffect(() => {
        if (isEditSampleSuccess) {
            savedSample();
            Object.entries(sample).forEach(
                ([name, value]) => setValue(name, value));
        }
    }, [isEditSampleSuccess]);

    return (
        <Modal show={open} onHide={closeModal} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{!loadingDetail && sample?.pointname ? concatSampleName(sample) : ""}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container fluid className="margin edit-sample-wrapper">
                    {loadingDetail ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Form id="form-edit-sample" onSubmit={handleSubmit(onSubmit)}>
                            <Col>
                                <Row xs={12} sm={6} md={4} lg={3}>
                                    <Form.Group
                                        className="form-item"
                                        controlId="jobnumber"
                                    >
                                        <Form.Label>Job No</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("jobnumber")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.jobnumber?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="siteid"
                                    >
                                        <Form.Label>Site ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("siteid")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.siteid?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="pointname"
                                    >
                                        <Form.Label>Sample Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("pointname")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.pointname?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
                            </Col>
                            <Col>
                                <Row xs={12} sm={6} md={4} lg={3}>
                                    <Form.Group
                                        className="form-item"
                                        controlId="duplicatename"
                                    >
                                        <Form.Label>Duplicated Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("duplicatename")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.duplicatename?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="objective"
                                    >
                                        <Form.Label>Objective</Form.Label>
                                        <Form.Select
                                            aria-label="Select Objective"
                                            {...register("objective")}
                                        >
                                            <option value="">
                                                --Select Objective--
                                            </option>
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
                                    <Form.Group
                                        className="form-item"
                                        controlId="objectiveother"
                                    >
                                        <Form.Label>Objective Other</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("objectiveother")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.objectiveother?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
                            </Col>
                            <Col>
                                <Row xs={12} sm={6} md={4} lg={3}>
                                    <Form.Group
                                        className="form-item"
                                        controlId="sampletype"
                                    >
                                        <Form.Label>Sample Type</Form.Label>
                                        <Form.Select
                                            aria-label="Select Sample Type"
                                            {...register("sampletype")}
                                        >
                                            {optionsSampleType.map((option) => (
                                                <option value={option} key={option} disabled={option !== 'Soil'}>
                                                    {option}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.sampletype?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group
                                        className="form-item"
                                        controlId="fromdepth"
                                    >
                                        <Form.Label>Depth From</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("fromdepth")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.fromdepth?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="todepth"
                                    >
                                        <Form.Label>Depth To</Form.Label>
                                        <Form.Control
                                            type="text"
                                            {...register("todepth")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.todepth?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="samplematerialtype"
                                    >
                                        <Form.Label>Material Type</Form.Label>
                                        <Form.Select
                                            aria-label="Select Material Type"
                                            {...register("samplematerialtype")}
                                        >
                                            <option value="">
                                                --Select Material Type--
                                            </option>
                                            {optionMaterialType.map((option) => (
                                                <option value={option} key={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.samplematerialtype?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="collectiondate"
                                    >
                                        <Form.Label>Collection Date</Form.Label>
                                        <Controller
                                            control={control}
                                            name='collectiondate'
                                            render={({ field }) => {
                                                return (
                                                    <DatePicker
                                                        className="form-control react-date-picker__wrapper"
                                                        onChange={(date) => field.onChange(date)}
                                                        selected={field.value}
                                                    />

                                                )
                                            }
                                            }
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.collectiondate?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="barcode"
                                    >
                                        <Form.Label>Barcode</Form.Label>
                                        <Form.Control
                                            type="text"
                                            readOnly
                                            {...register("barcode")}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.barcode?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group
                                        className="form-item"
                                        controlId="containertype"
                                    >
                                        <Form.Label>Container Type</Form.Label>
                                        <Form.Select
                                            aria-label="Select Container Type"
                                            {...register("containertype")}
                                        >
                                            <option value="">
                                                --Select Container Type--
                                            </option>
                                            {optionContainerType.map((option) => (
                                                <option value={option} key={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.containertype?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Row>
                            </Col>
                            <div className="button-group text-right">
                                <Button variant="secondary" type="submit" disabled={saving}>
                                    Save
                                </Button>
                                <Button variant="secondary" onClick={closeModal} disabled={saving}>
                                    Close
                                </Button>
                            </div>
                        </Form>
                    )}
                </Container>
            </Modal.Body>
        </Modal>
    );
}
