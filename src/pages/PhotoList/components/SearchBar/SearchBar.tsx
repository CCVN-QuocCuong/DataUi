/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { MultiSelect, Option } from "react-multi-select-component";
import moment from "moment-timezone";
import { useAppSelector } from "hooks";
import { optionsFileType } from "constants/options";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function SearchBar({ handleSetIsFirst, handleSearchPhoto }) {
    const refInput = useRef<HTMLInputElement>(null);
    const [codes, sampleNames, pagination] = useAppSelector((state) => [state.code?.codes, state.sample?.sampleNames, state.photo?.pagination]);
    const [selectedSample, setSelectedSample] = useState([]);
    const listObjectives = codes?.filter((item: Object) => item?.codetypecode === "Objective");
    const optionsObjective = listObjectives?.map((item: Object) => ({
        value: item.codename,
        label: item.codename,
    }));

    const optionsSample: Option[] = [];
    sampleNames?.forEach((item) => {
        optionsSample.push({
            value: item,
            label: item,
        })
    });

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
    } = useForm({
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });

    /**
     * Handle search
     * @param {Object} data
     */
    const handleSearch = (data) => {
        handleSetIsFirst(false);
        const fromDate = data?.fromdate ? moment.tz(data?.fromdate, "NZ").format("YYYYMMDD") : "";
        const toDate = data?.todate ? moment.tz(data?.todate, "NZ").format("YYYYMMDD") : "";

        handleSearchPhoto({
            ...data,
            pagesize: pagination?.pageSize || 10,
            page: 1,
            todate: toDate,
            fromdate: fromDate,
            samples: selectedSample?.map((item: Object) => item.value).join("|")
        })
    };
    
    /**
     * Handle clear form
     */
    const handleClear = () => {
        reset();
        setSelectedSample([]);
        handleSetIsFirst(true);
    };

    
    /**
     * Handle clear search when click clear
     */
    const handleClearSearch = () => {
        handleClear()
        handleSearchPhoto()
    }

    const jobnumber = watch("jobnumber");
    const objective = watch("objective");
    const fromdate = watch("fromdate");
    const todate = watch("todate");
    const siteid = watch("siteid");
    const siteaddress = watch("siteaddress");
    const filetype = watch("filetype");

    /**
     * Handle custom value render
     * @param {Array} selected
     * @param {*} _options
     */
    const customValueRenderer = (selected, _options) => {
        if (selected.length > 5) {
            return `Selected ${selected.length} items`;
        } else {
            return selected.length
                ? selected.map((item, index) => index > 0 ? ", " + item?.label : item?.label)
                : "No Items Selected";
        }

    };

    useEffect(() => {
        return () => handleClear();
    }, []);

    return (
        <div className="margin search-bar-wrapper">
            <Form onSubmit={handleSubmit(handleSearch)} className="form-container">
                <input type="text" ref={refInput} className="hidden" />
                <div className="form-wrapper">
                    <div className="row">
                        <Form.Group
                            className="col form-item"
                            controlId="jobnumber"
                        >
                            <Form.Label>Job No</Form.Label>
                            <Form.Control type="text" {...register("jobnumber")} />
                        </Form.Group>
                        <Form.Group
                            className="col form-item"
                            controlId="objective"
                        >
                            <Form.Label>Objective</Form.Label>
                            <div>
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
                            </div>
                        </Form.Group>
                        <Form.Group
                            className="col form-item"
                            controlId="fromdate"
                        >
                            <Form.Label>Sample Collection Date - Start From</Form.Label>
                            <Controller
                                control={control}
                                name='fromdate'
                                render={({ field }) => {
                                    return (
                                        <DatePicker
                                            className="form-control react-date-picker__wrapper"
                                            onChange={(date) => {
                                                field.onChange(date ? new Date(moment
                                                    .tz(date, "NZ").format("YYYY-MM-DD")) : null);
                                            }}
                                            onCalendarClose={() => refInput?.current?.focus()}
                                            selected={field?.value || null}
                                            maxDate={todate ? new Date(todate) : new Date()}
                                        />

                                    )
                                }
                                }
                            />
                        </Form.Group>
                        <Form.Group
                            className="col form-item"
                            controlId="todate"
                        >
                            <Form.Label>Sample Collection Date - Date End</Form.Label>
                            <Controller
                                control={control}
                                name='todate'
                                render={({ field }) => {
                                    return (
                                        <DatePicker
                                            className="form-control react-date-picker__wrapper"
                                            onChange={(date) => {
                                                field.onChange(date ? new Date(moment
                                                    .tz(date, "NZ").format("YYYY-MM-DD")) : null);
                                            }}
                                            onCalendarClose={() => refInput?.current?.focus()}
                                            selected={field?.value || null}
                                            maxDate={new Date()}
                                            minDate={fromdate ? new Date(fromdate) : null}
                                        />

                                    )
                                }
                                }
                            />
                        </Form.Group>
                        <div className="w-100"></div>
                        <Form.Group
                            className="col form-item"
                            controlId="siteid"
                        >
                            <Form.Label>Site ID</Form.Label>
                            <Form.Control type="text" {...register("siteid")} />
                        </Form.Group>
                        <Form.Group
                            className="col form-item"
                            controlId="siteaddress"
                        >
                            <Form.Label>Site Address</Form.Label>
                            <Form.Control type="text" {...register("siteaddress")} />
                        </Form.Group>
                        <Form.Group
                            className="col form-item"
                            controlId="filetype"
                        >
                            <Form.Label>File Type</Form.Label>
                            <div>
                                <Form.Select
                                    aria-label="Select Sample Type"
                                    {...register("filetype")}
                                >
                                    <option value="">
                                        --Select File Type--
                                    </option>
                                    {optionsFileType.map((option: Object) => (
                                        <option value={option?.value} key={option?.value}>
                                            {option?.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Form.Group>
                        <Form.Group
                            className="col form-item"
                            controlId="samplenames"
                        >
                            <Form.Label>Sample Name</Form.Label>
                            <MultiSelect
                                options={optionsSample}
                                value={selectedSample}
                                onChange={setSelectedSample}
                                labelledBy="Select Sample Name"
                                valueRenderer={customValueRenderer}
                            />
                        </Form.Group>

                    </div>
                </div>
                <div className="button-search-group">
                    <button
                        className="btn btn-outline-primary margin-button"
                        type="submit"
                        disabled={
                            !jobnumber?.trim() &&
                            !objective?.trim() &&
                            !fromdate &&
                            !todate &&
                            !siteid?.trim() &&
                            !siteaddress?.trim() &&
                            !filetype?.trim() &&
                            selectedSample.length === 0
                        }
                    >
                        Search
                    </button>
                    <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={handleClearSearch}
                    >
                        Clear
                    </button>
                </div>
            </Form>
        </div>
    );
}
