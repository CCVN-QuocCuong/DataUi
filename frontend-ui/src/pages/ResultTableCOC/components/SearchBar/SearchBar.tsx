import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useAppSelector } from "hooks";
import "./style.css";
import { optionsSampleType } from "constants/options";

type Object = {
    [key: string]: any;
};

export function SearchBar({ handleSearchSample }) {
    const [codes] = useAppSelector((state) => [state.code?.codes, state.coc?.pagination]);
    const [jobNo, setJobNo] = useState("");
    const [siteID, setSiteID] = useState("");
    const [cocId, setCOCId] = useState("");
    const [address, setAddress] = useState("");
    const [objective, setObjective] = useState("");
    const [sampleType, setSampleType] = useState("");
    const listObjectives = codes?.filter((item: Object) => item?.codetypecode === "Objective");
    const optionsObjective = listObjectives?.map((item: Object) => ({
        value: item?.codename || "",
        label: item?.codename || "",
    }));

    const COC = {
        cocid: cocId,
        jobno: jobNo,
        siteid: siteID,
        siteaddress: address,
        objective: objective,
        sampletype: sampleType,
    };

    /**
     * Handle search
     * @param {Object} e
     */
    const handleSearch = (e) => {
        e.preventDefault();
        handleSearchSample(COC);
    };

    /**
     * Handle clear input form
     */
    const handleClear = () => {
        setJobNo('')
        setSiteID("");
        setCOCId("");
        setAddress("");
        setObjective("");
        setSampleType("");
        handleSearchSample()
    };

    return (
        <div className="margin search-bar-wrapper">
            <form onSubmit={handleSearch}>
                <div className="row">
                    <div className="col-8">
                        <div className="row">
                            <div className="col form-item">
                                <p>Job No</p>
                                <input
                                    className="form-control dropdown-height"
                                    type=" text"
                                    placeholder=""
                                    onChange={(e) => setJobNo(e.target.value)}
                                    value={jobNo}
                                />
                            </div>
                            <div className="col form-item">
                                <p>COC ID</p>
                                <input
                                    className="form-control dropdown-height"
                                    type=" text"
                                    placeholder=""
                                    onChange={(e) => setCOCId(e.target.value)}
                                    value={cocId}
                                />
                            </div>
                            <div className="col form-item">
                                <p>Objective</p>
                                <div>
                                    <Form.Select
                                        aria-label="Select Objective"
                                        value={objective}
                                        onChange={(e) => {
                                            setObjective(e.target.value);
                                        }}
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
                            </div>
                            <div className="w-100"></div>
                            <div className="col form-item">
                                <p>Site ID</p>
                                <input
                                    className="form-control dropdown-height"
                                    type=" text"
                                    placeholder=""
                                    onChange={(e) => setSiteID(e.target.value)}
                                    value={siteID}
                                />
                            </div>
                            <div className="col form-item">
                                <p>Site Address</p>
                                <input
                                    className="form-control dropdown-height"
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => setAddress(e.target.value)}
                                    value={address}
                                />
                            </div>
                            <div className="col form-item">
                                <p>Sample Type</p>
                                <div>
                                    <Form.Select
                                        aria-label="Select Sample Type"
                                        value={sampleType}
                                        onChange={(e) => {
                                            setSampleType(e.target.value);
                                        }}
                                    >
                                        <option value="">
                                            --Select Sample Type--
                                        </option>
                                        {optionsSampleType.map((option) => (
                                            <option value={option} key={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm">
                        <div className="row">
                            <div className="col margin">
                                <button
                                    className="btn btn-outline-primary margin-button"
                                    type="submit"
                                    disabled={
                                        !jobNo &&
                                        !siteID &&
                                        !cocId &&
                                        !address &&
                                        !objective &&
                                        !sampleType
                                    }
                                >
                                    Search
                                </button>
                                <button
                                    className="btn btn-outline-primary"
                                    type="button"
                                    onClick={() => handleClear()}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
