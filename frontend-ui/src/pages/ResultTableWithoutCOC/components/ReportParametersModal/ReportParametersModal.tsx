/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Col, Modal, Row, Spinner } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "hooks";
import { ReportParameterValidation } from "schema/report";
import { getListsOfRegion } from "store/parameter";
import { getListsAdditional } from "store/code";
import { getLists, generateReportNoCOC, getReportParametter, clearParametersWithoutCoC } from "store/file";
import arrow_right_icon from "assets/images/arrow-right-icon.png";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function ReportParametersModal({ open, closeModal, fileid }) {
    const dispatch = useAppDispatch();
    const [criterias, setCriteries] = useState<Object[]>([]);
    const [optionsRegion, setOptionsRegion] = useState<Object[]>([]);
    const [optionsSoilType, setOptionsSoilType] = useState<Object[]>([]);
    const [optionsDepthContamination, setOptionsDepthContamination] = useState<Object[]>([]);
    const [optionsGroundWaterLevel, setOptionsGroundWaterLevel] = useState<Object[]>([]);
    const [optionsCriteriaValue, setOptionsCriteriaValue] = useState<Object[]>([]);
    const [optionsHTNSVGSoilType, setOptionsHTNSVGSoilType] = useState<Object[]>([]);
    const [optionsHTNSoildAge, setOptionsHTNSoildAge] = useState<Object[]>([]);
    const [optionsCHCRegion, setOptionsCHCRegion] = useState<Object[]>([]);
    const [optionsCHCSoilType, setOptionsCHCSoilType] = useState<Object[]>([]);
    const [codes, parameters, loadingParameter, additionalCodes, loading, reportParamaters, reportLoading] = useAppSelector((state) => [state?.code?.codes, state?.parameter?.parameters, state?.parameter?.loading, state?.code?.additionalCodes, state?.file?.loading, state?.file?.parameters, state?.file?.reportLoading]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        mode: "onSubmit",
        reValidateMode: "onChange",
        resolver: yupResolver(ReportParameterValidation),
    });

    const currentRegion = watch('region');
    const canterburyArea = watch('canterburyArea');

    useEffect(() => {
        dispatch(getReportParametter(fileid));
        return () => {
            dispatch(clearParametersWithoutCoC(null));
        }
    }, []);

    useEffect(() => {
        if (additionalCodes?.length > 0) {
            const listRegions = additionalCodes?.filter((item: Object) => item?.codetypecode === "CHC_region");
            const optionsRegion = listRegions?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsCHCRegion(optionsRegion);

            const listSVGSoilAges = additionalCodes?.filter((item: Object) => item?.codetypecode === "HTN_sgvsoilage");
            const optionsSVGSoilAge = listSVGSoilAges?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsHTNSoildAge(optionsSVGSoilAge);

            const listSVGSoilTypes = additionalCodes?.filter((item: Object) => item?.codetypecode === "HTN_sgvsoiltype");
            const optionsSVGSoilType = listSVGSoilTypes?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsHTNSVGSoilType(optionsSVGSoilType);
        }
    }, [additionalCodes]);

    useEffect(() => {
        if (codes?.length > 0) {
            const listRegions = codes?.filter((item: Object) => item?.codetypecode === "Region");
            const optionsRegions = listRegions?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsRegion(optionsRegions);
            setValue("region", listRegions[0]?.codename);

            const listSoilType = codes?.filter((item: Object) => item?.codetypecode === "SoilTypeCode");
            const optionsSoilTypes = listSoilType?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsSoilType(optionsSoilTypes);
            setValue("soiltype", listSoilType[0]?.codename);

            const listDepthContaminations = codes?.filter((item: Object) => item?.codetypecode === "DepthCode");
            const optionsDepthContaminations = listDepthContaminations?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsDepthContamination(optionsDepthContaminations);
            setValue("deptContamination", listDepthContaminations[0]?.codename);

            const listGroundWaterLevels = codes?.filter((item: Object) => item?.codetypecode === "GroundwaterDepthCode");
            const optionsGroundWaterLevels = listGroundWaterLevels?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsGroundWaterLevel(optionsGroundWaterLevels);
            setValue("groundWaterLevel", listGroundWaterLevels[0]?.codename);

            const listCriteriaValues = codes?.filter((item: Object) => item?.codetypecode === "Criteria");
            const optionsCriteriaValues = listCriteriaValues?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsCriteriaValue(optionsCriteriaValues);
        }
    }, [codes]);

    useEffect(() => {
        if (reportParamaters?.formattype) {
            reportParamaters?.criteria?.forEach((item: Object) => {
                setValue(item?.businesscriteriacode, true);
            });

            let canterburyIsSiteUrban: string = "";
            if (reportParamaters?.canterburyIsSiteUrban === true) {
                canterburyIsSiteUrban = "1";
            }
            if (reportParamaters?.canterburyIsSiteUrban === false) {
                canterburyIsSiteUrban = "0";
            }

            setValue("header", reportParamaters?.header || "");
            setValue("formattype", reportParamaters?.formattype || "vertical");
            setValue("region", reportParamaters?.region || "");
            setValue("soiltype", reportParamaters?.soiltype || "");
            setValue("deptContamination", reportParamaters?.deptContamination || "");
            setValue("groundWaterLevel", reportParamaters?.groundWaterLevel || "");

            setValue("canterburyArea", reportParamaters?.canterburyArea || "");
            setValue("canterburyIsSiteUrban", canterburyIsSiteUrban);

            setValue("waikatoGrainOfSize", reportParamaters?.waikatoGrainOfSize || "");
        }
    }, [optionsRegion, reportParamaters, setValue]);

    useEffect(() => {
        if (reportParamaters?.formattype) {
            setValue("waikatoSoiltype", reportParamaters?.waikatoSoiltype || "");
        }
    }, [reportParamaters, setValue, optionsHTNSVGSoilType]);

    useEffect(() => {
        if (reportParamaters?.formattype) {
            setValue("waikatoFreshAged", reportParamaters?.waikatoFreshAged || "");
        }
    }, [reportParamaters, setValue, optionsHTNSoildAge]);

    useEffect(() => {
        if (reportParamaters?.formattype) {
            setValue("canterburySoiltype", reportParamaters?.canterburySoiltype || "");
        }
    }, [reportParamaters, setValue, canterburyArea]);

    useEffect(() => {
        if (parameters && currentRegion) {
            setCriteries(parameters);
            parameters.forEach((item) => {
                const itemReport: Object = reportParamaters?.criteria?.find((it: Object) => it.businesscriteriacode === item.businesscriteriacode) || {};
                if (itemReport?.businesscriteriacode) {
                    setValue(`criteria-${itemReport?.businesscriteriacode}`, itemReport?.stylevalue);
                } else {
                    setValue(`criteria-${item.businesscriteriacode}`, item.defaultstyle);
                }
            });
        }
    }, [parameters, currentRegion, reportParamaters]);

    useEffect(() => {
        if (currentRegion) {
            dispatch(getListsOfRegion({ codename: currentRegion }));
            dispatch(getListsAdditional({ codename: currentRegion }));
        }
    }, [currentRegion]);

    useEffect(() => {
        if (canterburyArea) {
            const listSoilTypes = additionalCodes?.filter((item: Object) => item?.codetypecode === "CHC_soiltype" && item?.region === canterburyArea);
            const optionsSoilType = listSoilTypes?.map((item: Object) => ({
                value: item.codename,
                label: item.description,
            }));
            setOptionsCHCSoilType(optionsSoilType);
        }
    }, [canterburyArea]);

    const criteriaItems: Boolean[] = [];
    if (criterias.length > 0) {
        criterias.forEach((item: Object) => {
            if (item?.businesscriteriacode) {
                criteriaItems[item?.businesscriteriacode] = watch(item?.businesscriteriacode);
            }
        });
    }

    /**
     * Handle on submit form
     * @async
     * @param {Object} data
     */
    const onSubmit = async (data) => {
        const criteriaValues: Object[] = [];
        criterias.forEach((item: Object) => {
            if (data[item?.businesscriteriacode]) {
                criteriaValues.push({ businesscriteriacode: item?.businesscriteriacode, stylevalue: data[`criteria-${item.businesscriteriacode}`] });
            }
        });
        let submitData: Object = {
            criteria: criteriaValues,
            deptContamination: data?.deptContamination || "",
            groundWaterLevel: data?.groundWaterLevel || "",
            soiltype: data?.soiltype || "",
            region: data?.region || "",
            formattype: data?.formattype || "vertical",
            header: data?.header || "",
        };
        if (data?.region === "CHC") {
            let canterburyIsSiteUrban: boolean | null = null;
            if (data?.canterburyIsSiteUrban === "1") {
                canterburyIsSiteUrban = true;
            }
            if (data?.canterburyIsSiteUrban === "0") {
                canterburyIsSiteUrban = false;
            }

            submitData = {
                ...submitData,
                canterburyArea: data?.canterburyArea || "",
                canterburyIsSiteUrban: canterburyIsSiteUrban,
                canterburySoiltype: data?.canterburySoiltype || "",
            }
        } else if (data['region'] === "HTN") {
            submitData = {
                ...submitData,
                waikatoFreshAged: data?.waikatoFreshAged,
                waikatoGrainOfSize: data?.waikatoGrainOfSize,
                waikatoSoiltype: data?.waikatoSoiltype,
            }
        }
        const generateReport = await dispatch(generateReportNoCOC({ fileid: fileid, data: submitData }));
        if (generateReport?.meta?.requestStatus === "fulfilled") {
            closeModal();
            reset();
            toast.success('Generate report successfully!');
            if (generateReport?.payload?.report_lab_url != '') {
                downloadFile(generateReport?.payload?.report_lab_url || "");
            }
            dispatch(getLists());
        }

    };

    /**
     * Handle download file
     * @param {File} file
     */
    const downloadFile = (file) => {
        console.log(file)
        const link = document.createElement("a");
        link.href = `${file}`;
        link.download = 'Download File';
        document.body.appendChild(link);
        link.click();
    }

    return (
        <Modal show={open} onHide={closeModal} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Report Parameters</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="report-parameters-wrapper">
                    {reportLoading ? (
                        <div className="loading-icon">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Form
                            id="form-create-coc"
                            noValidate
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <Form.Group className="form-item" controlId="header">
                                <Form.Label>Report Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    required
                                    {...register("header")}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors?.header?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Row gutter={[16, 16]}>
                                <Col sm={12} md={6}>
                                    <Form.Group className="form-item" controlId="formattype">
                                        <Form.Label>Format Type</Form.Label>
                                        <Form.Select
                                            aria-label="Select Format Type"
                                            {...register("formattype")}
                                        >
                                            <option value="vertical">
                                                Vertical
                                            </option>
                                            <option value="horizontal">
                                                Horizontal
                                            </option>
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.formattype?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="form-item" controlId="region">
                                        <Form.Label>Region</Form.Label>
                                        <Form.Select
                                            aria-label="Select Region"
                                            {...register("region")}
                                        >
                                            {optionsRegion.map((option) => (
                                                <option value={option?.value} key={option?.value}>
                                                    {option?.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Control.Feedback type="invalid">
                                            {errors?.region?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                    <div className="group-field">
                                        <span className="group-title">MfE HC Guideline Criteria Selection</span>
                                        <Form.Group className="form-item" controlId="soiltype">
                                            <Form.Label>Soil Type</Form.Label>
                                            <Form.Select
                                                aria-label="Select Soil Type"
                                                {...register("soiltype")}
                                            >
                                                <option value="" ></option>
                                                {optionsSoilType.map((option) => (
                                                    <option value={option?.value} key={option?.value}>
                                                        {option?.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors?.soiltype?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group className="form-item" controlId="deptContamination">
                                            <Form.Label>Dept of Contamination</Form.Label>
                                            <Form.Select
                                                aria-label="Select Dept of Contamination"
                                                {...register("deptContamination")}
                                            >
                                                <option value="" ></option>
                                                {optionsDepthContamination.map((option) => (
                                                    <option value={option?.value} key={option?.value}>
                                                        {option?.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors?.deptContamination?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group className="form-item" controlId="groundWaterLevel">
                                            <Form.Label>Ground Water Level</Form.Label>
                                            <Form.Select
                                                aria-label="Select Ground Water Level"
                                                {...register("groundWaterLevel")}
                                            >
                                                <option value="NA" ></option>
                                                {optionsGroundWaterLevel.map((option) => (
                                                    <option value={option?.value} key={option?.value}>
                                                        {option?.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                {errors?.groundWaterLevel?.message}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </div>
                                </Col>
                                <Col sm={12} md={6}>
                                    {currentRegion === "CHC" && (
                                        <div className="group-field group-field-right">
                                            <span className="group-title">Canterbury Background Criteria</span>
                                            <Form.Group className="form-item" controlId="canterburyArea">
                                                <Form.Label>Area</Form.Label>
                                                <Form.Select
                                                    aria-label="Select Dept of Contamination"
                                                    {...register("canterburyArea")}
                                                >
                                                    <option value="" ></option>
                                                    {optionsCHCRegion.map((option) => (
                                                        <option value={option?.value} key={option?.value}>
                                                            {option?.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors?.canterburyArea?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group className="form-item" controlId="canterburySoiltype">
                                                <Form.Label>Soil Type</Form.Label>
                                                <Form.Select
                                                    aria-label="Select Soil Type"
                                                    {...register("canterburySoiltype")}
                                                >
                                                    <option value="" ></option>
                                                    {optionsCHCSoilType.map((option) => (
                                                        <option value={option?.value} key={option?.value}>
                                                            {option?.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors?.canterburySoiltype?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="form-item" controlId="canterburyIsSiteUrban">
                                                <Form.Label>Is site urban</Form.Label>
                                                <Form.Select
                                                    aria-label="Select Is site urban"
                                                    {...register("canterburyIsSiteUrban")}
                                                >
                                                    <option value="" ></option>
                                                    <option value="1" >Yes</option>
                                                    <option value="0" >No</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors?.canterburyIsSiteUrban?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </div>
                                    )}
                                    {currentRegion === "HTN" && (
                                        <div className="group-field group-field-right">
                                            <span className="group-title">Waikato Criteria</span>
                                            <Form.Group className="form-item" controlId="waikatoSoiltype">
                                                <Form.Label>Eco_SGV Soil Type</Form.Label>
                                                <Form.Select
                                                    aria-label="Select Eco_SGV Soil Type"
                                                    {...register("waikatoSoiltype")}
                                                >
                                                    <option value="" ></option>
                                                    {optionsHTNSVGSoilType.map((option) => (
                                                        <option value={option?.value} key={option?.value}>
                                                            {option?.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors?.waikatoSoiltype?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                            <Form.Group className="form-item" controlId="waikatoFreshAged">
                                                <Form.Label>Fresh/Aged</Form.Label>
                                                <Form.Select
                                                    aria-label="Select Fresh/Aged"
                                                    {...register("waikatoFreshAged")}
                                                >
                                                    <option value="" ></option>
                                                    {optionsHTNSoildAge.map((option) => (
                                                        <option value={option?.value} key={option?.value}>
                                                            {option?.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors?.waikatoFreshAged?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>

                                            <Form.Group className="form-item" controlId="waikatoGrainOfSize">
                                                <Form.Label>Grain of size</Form.Label>
                                                <Form.Select
                                                    aria-label="Select Grain of size"
                                                    {...register("waikatoGrainOfSize")}
                                                >
                                                    <option value="" ></option>
                                                    <option value="Fine" >Fine</option>
                                                    <option value="Coarse" >Coarse</option>
                                                </Form.Select>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors?.waikatoGrainOfSize?.message}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </div>
                                    )}
                                </Col>
                            </Row>
                            <div className="list-criterias">
                                {loadingParameter ? (
                                    <div className="loading-icon">
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </Spinner>
                                    </div>
                                ) : (
                                    <>
                                        <Form.Label className="list-title">Criteria</Form.Label>
                                        <div className="list-content">
                                            {criterias.map((item) => {
                                                return (
                                                    < Form.Group key={item?.businesscriteriacode} className={`form-item ${criteriaItems[item?.businesscriteriacode] && 'checked'}`} controlId={`criteria-${item?.businesscriteriacode}`}>
                                                        <Row>
                                                            <Col xs={12} sm={6} md={6} lg={7}>
                                                                <Form.Check type="checkbox" id={item?.businesscriteriacode} >
                                                                    <Form.Check.Input type="checkbox" {...register(item?.businesscriteriacode)} />
                                                                    <span className="checkmark"><i className="fa fa-check" aria-hidden="true"></i></span>
                                                                    <Form.Check.Label>{item?.criterianame || ""}</Form.Check.Label>
                                                                </Form.Check>
                                                            </Col>
                                                            <Col xs={12} sm={6} md={6} lg={5}>
                                                                <span className="criteria-icon"><img src={arrow_right_icon} alt="" /></span>
                                                                <Form.Select
                                                                    aria-label="Select Criteria Value"
                                                                    {...register(`criteria-${item?.businesscriteriacode}`)}
                                                                >
                                                                    <option value="" ></option>
                                                                    {optionsCriteriaValue.map((option) => (
                                                                        <option value={option?.value} key={option?.value}>
                                                                            {option?.label}
                                                                        </option>
                                                                    ))}
                                                                </Form.Select>
                                                            </Col>
                                                        </Row>
                                                    </Form.Group>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="button-group text-center">
                                <Button variant="secondary" type="submit" disabled={loading}>
                                    OK
                                </Button>
                                <Button variant="secondary" type="button" disabled={loading} onClick={closeModal}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </div>
            </Modal.Body >
        </Modal >
    );
}
