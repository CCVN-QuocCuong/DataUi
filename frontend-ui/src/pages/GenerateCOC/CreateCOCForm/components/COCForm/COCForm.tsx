/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect } from "react";
import { useHistory, generatePath } from "react-router-dom";
import { Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputGroup } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "hooks";
import { usePrompt } from "hooks/prompt";
import { addCOC, setIsPrint } from "store/coc";
import { AddCOCValidation } from "schema/coc";
import PATHS from "routes/const";
import "./style.css";
import { concatSampleName } from "helpers/sample";

type Object = {
    [key: string]: any;
};

export function COCForm({ samplesSelected, submitForm, changeStatusSubmitForm }) {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const refForm = useRef<HTMLFormElement | null>(null);
    const { addSuccess, coc, isPrint } = useAppSelector((state) => state.coc);
    const { codes } = useAppSelector((state) => state.code);
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

    const listNotes = codes?.filter((item: Object) => item?.codetypecode === "CoCFormNotes");
    const optionsNote = listNotes?.map((item: Object) => ({
        value: item.codename,
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
    const note = watch('note');
    const keyErrors = Object.keys(errors)

    useEffect(() => {
        if (company && company * 1 !== 0) {
            const companyAddress: Object = listCompanies?.find((item: Object) => item.codeid === company * 1) || {};
            setValue("address", companyAddress?.address || "");
        }
        else {
            setValue("address", "");
        }
    }, [company]);

    useEffect(() => {
        if (isPrint && (keyErrors.length > 0)) {
            dispatch(setIsPrint(false))
        }
    }, [keyErrors])

    useEffect(() => {
        if (lab && lab * 1 !== 0) {
            const labAddress: Object = listLabs?.find((item: Object) => item.codeid === lab * 1) || {};
            setValue("labaddress", labAddress?.address || "");
        } else {
            setValue("labaddress", "");
        }
    }, [lab]);

    useEffect(() => {
        if (samplesSelected?.length > 0) {
            setValue("ttemailaddress", samplesSelected[0]?.sampler || "");
            setValue("jobno", samplesSelected[0]?.jobnumber || "");
            setValue("objective", samplesSelected[0]?.objective || "");
            setValue("siteaddress", samplesSelected[0]?.siteaddress || "");
            setValue("siteid", samplesSelected[0]?.siteid || "");
            setValue("priority", "standard");
        }
    }, [samplesSelected]);

    useEffect(() => {
        if (addSuccess) {
            refForm?.current?.reset();
            console.log('history.push 10')
            history.push(generatePath(PATHS.EDIT_COC, {
                id: coc?.cocid,
            }));
        }
    }, [addSuccess, coc]);


    /**
     * Handle to add COC 
     * @param {Object} data
     */
    const onSubmit = (data) => {
        const listSelectedSample = samplesSelected?.map((sp) => ({
            barcode: sp?.barcode || "",
            point_name: concatSampleName(sp),
        }));
        const dataCOC = {
            ...data,
            sampletype: samplesSelected?.[0]?.sampletype || "",
            samples: listSelectedSample,
            lastmodifiedby: currentUser?.username || "",
        }
        dispatch(addCOC(dataCOC));
        reset();
    };

    /**
     * Handle to clear input form
     */
    const handleClear = () => {
        setValue("emailother", "");
    };

    useEffect(() => {
        if (submitForm) {
            refForm?.current?.dispatchEvent(
                new Event("submit", { cancelable: true, bubbles: true })
            );
            changeStatusSubmitForm(false);
        }
    }, [submitForm]);

    const Prompt = usePrompt({
        when: isDirty,
        message: "You have unsaved data on COC form. Are you sure you want to leave?",
    });

    return (
        <div className="coc-form-wrapper">
            <Prompt />
            <Form
                id="form-create-coc"
                noValidate
                ref={refForm}
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
            >
                <Row>
                    <Col xs={12} sm={6} md={4} lg={3}>
                        <Form.Group className="form-item" controlId="jobno">
                            <Form.Label>Job No</Form.Label>
                            <Form.Control type="text" {...register("jobno")} />
                            <Form.Control.Feedback type="invalid">
                                {errors?.jobno?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="form-item" controlId="jobphase">
                            <Form.Label>Phase</Form.Label>
                            <Form.Control
                                type="text"
                                {...register("jobphase")}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.jobphase?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="form-item" controlId="jobtask">
                            <Form.Label>Task</Form.Label>
                            <Form.Control
                                type="text"
                                {...register("jobtask")}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.jobtask?.message}
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
                                rows={5}
                                {...register("siteaddress")}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.siteaddress?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={3}>
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
                                rows={5}
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
                        <Form.Group
                            className="form-item"
                            controlId="emailother"
                        >
                            <Form.Label>Email other</Form.Label>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    defaultValue={"labresults@tonkin.co.nz"}
                                    type="emailother"
                                    {...register("emailother")}
                                />
                                <button
                                    type="button"
                                    className="inner-btn"
                                    onClick={handleClear}
                                >
                                    X
                                </button>
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                                {errors?.emailother?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={3}>
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
                        <Form.Group
                            className="form-item"
                            controlId="labreference"
                        >
                            <Form.Label>Lab Reference</Form.Label>
                            <Form.Control
                                type="text"
                                required
                                {...register("labreference")}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.labreference?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="form-item" controlId="priority">
                            <Form.Label>Priority</Form.Label>
                            <Form.Check
                                id="priority-standard"
                                type="radio"
                                label="Standard"
                                value="standard"
                                {...register("priority")}
                                onChange={(e) =>
                                    setValue("priority", e.target.value)
                                }
                            />
                            <Form.Check
                                id="priority-priority"
                                type="radio"
                                label="Priority"
                                value="priority"
                                {...register("priority")}
                                onChange={(e) =>
                                    setValue("priority", e.target.value)
                                }
                            />
                            <Form.Check
                                id="priority-urgent"
                                type="radio"
                                label="Urgent"
                                value="urgent"
                                {...register("priority")}
                                onChange={(e) =>
                                    setValue("priority", e.target.value)
                                }
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.priority?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={4} lg={3}>
                        <Form.Group className="form-item" controlId="comment">
                            <Form.Label>Additional Infomation</Form.Label>
                            <Form.Control
                                type="text"
                                as="textarea"
                                rows={20}
                                {...register("comment")}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors?.comment?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="form-item" controlId="note">
                            <Form.Label>Note</Form.Label>
                            <Form.Select
                                aria-label="Select"
                                {...register("note")}
                            >
                                <option value="">--Select Note--</option>
                                {optionsNote.map((option) => (
                                    <option
                                        value={option.value}
                                        key={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                {errors?.note?.message}
                            </Form.Control.Feedback>
                        </Form.Group>
                        {note === "Other update, please see comments box." && (
                            <Form.Group className="form-item" controlId="notecomment">
                                <Form.Label>Comment</Form.Label>
                                <Form.Control
                                    type="text"
                                    as="textarea"
                                    rows={3}
                                    {...register("notecomment")}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors?.notecomment?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}
                    </Col>
                </Row>
            </Form>
        </div>
    );
}
