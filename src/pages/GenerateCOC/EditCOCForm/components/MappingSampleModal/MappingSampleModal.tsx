import React, { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { concatSampleName } from "helpers/sample";
import { useAppDispatch, useAppSelector } from "hooks";
import { mappingSample } from "store/coc";
import arrow_right_icon from "assets/images/arrow-right-icon.png";
import "./style.css";

type Object = {
    [key: string]: any;
}

export function MappingSampleModal({ open, closeModal, cocID }) {
    const dispatch = useAppDispatch();
    const [coc, listSampleFile, loading, mappingSamples] = useAppSelector((state) =>
        [
            state.coc.coc,
            state.coc.listSamplesFile,
            state.coc.loading,
            state.coc.mappingSample,
        ]
    );
    const [listSamples, setListSamples] = useState<Object[]>([]);
    const [listSamplesFile, setListSamplesFile] = useState<Object[]>([]);
    const [fieldChanging, setFieldChanging] = useState<Object>({});

    const {
        register,
        handleSubmit,
        formState: { isDirty },
    } = useForm({
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    /**
     * Handle submit data
     * @async
     * @param {Object} data
     */
    const onSubmit = async (data) => {
        const dataSubmit = Object.values(data).find((item) => item !== "");
        if (dataSubmit) {
            const dataMapping = listSampleFile?.map((item: Object) => (
                {
                    barcode: data[item?.key] || "",
                    labsamplename: item?.labsamplename || ""
                }
            ));
            const mapping = await dispatch(mappingSample({
                id: cocID,
                data: {
                    list_sample: dataMapping,
                }
            }));

            if (mapping?.meta?.requestStatus === "fulfilled") {
                toast.success('Mapping Sample successfully!');
                closeModal();
            }
        } else {
            toast.error("Please select Sample to mapping before submit import!");
        }
    }

    useEffect(() => {
        const samples: Object[] = [];
        const listSample = mappingSamples?.map((it: Object) => it?.barcode);
        coc.samples?.forEach((item: Object) => {
            samples.push({
                label: concatSampleName(item),
                value: item?.barcode,
                disable: listSample.includes(item?.barcode)
            });
        });
        setListSamples(samples);
    }, [coc.samples, mappingSamples])

    useEffect(() => {
        setListSamplesFile(listSampleFile);
    }, [listSampleFile]);

    useEffect(() => {
        let listSample = {};
        mappingSamples?.forEach((it: Object) => {
            const key: Object = listSampleFile?.find((sp: Object) => sp?.labsamplename === it?.labsamplename) || {};
            listSample = {
                ...listSample,
                [key?.key || 0]: it?.barcode
            };
        });
        setFieldChanging(listSample);
    }, [coc.samples, mappingSamples, listSampleFile])

    /**
     * Handle change sample
     * @param {Object} value
     * @param {String} key
     */
    const handleChangeSample = (value, key) => {
        const listOptionSelected = {
            ...fieldChanging,
            [key]: value,
        };
        console.log(listOptionSelected)
        setFieldChanging(listOptionSelected);
        const listSampleSelected = Object.values(listOptionSelected);
        const samples: Object[] = [];
        coc.samples?.forEach((item: Object) => {
            samples.push({
                label: concatSampleName(item),
                value: item?.barcode,
                disable: listSampleSelected.includes(item?.barcode)
            });
        });
        setListSamples(samples);
    };

    /**
     * Handle set default value
     * @param {Object} labsamplename
     * @returns {Object}
     */
    const setDefaultValue = (labsamplename) => {
        let defaultValue = listSamples?.find((it) => it.value === labsamplename)?.value || "";
        const sample: Object = mappingSamples?.find((sp: Object) => sp?.labsamplename === labsamplename) || {};
        if (sample) {
            defaultValue = sample?.barcode || ""
        }
        return defaultValue;
    }

    return (
        <Modal show={open} onHide={closeModal} size="lg" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Import Wizzard</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mapping-sample-wrapper">
                    <Form
                        id="form-mapping-sample"
                        noValidate
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        {listSamplesFile.map((item: Object) => (
                            <Form.Group key={item?.key} className="form-item" controlId={`sample_${item?.key}`}>
                                <Row>
                                    <Col xs={12} sm={12} md={5} lg={5}>
                                        <Form.Label className="text-right">{item?.labsamplename || ""}</Form.Label>
                                    </Col>
                                    <Col xs={12} sm={12} md={7} lg={7}>
                                        <span className="criteria-icon"><img src={arrow_right_icon} alt="" /></span>
                                        <Form.Select
                                            aria-label="Select Company"
                                            {...register(item?.key?.toString())}
                                            onChange={(e) => handleChangeSample(e.target.value, item?.key)}
                                            defaultValue={setDefaultValue(item?.labsamplename)}
                                        >
                                            <option value="" key={0}></option>
                                            {listSamples.map((option) => (
                                                <option value={option?.value} key={option?.value} disabled={option?.disable || false}>
                                                    {option?.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                </Row>
                            </Form.Group>
                        ))}
                        <div className="button-group text-center">
                            <Button variant="secondary" type="submit" disabled={loading || !isDirty}>
                                Start Import
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal.Body>
        </Modal >
    );
}
