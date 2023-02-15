import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useAppSelector } from "hooks";
import "./style.css";

type Object = {
    [key: string]: any;
};

export function SearchBar({ sampleType, handleSearchSample }) {
    const [codes] = useAppSelector((state) => [state.code?.codes, state.coc?.pagination]);
    const [jobNo, setJobNo] = useState("");
    const [siteID, setSiteID] = useState("");
    const [cocId, setCOCId] = useState("");
    const [address, setAddress] = useState("");
    const [objective, setObjective] = useState("");
    const listObjectives = codes?.filter((item: Object) => item?.codetypecode === "Objective");
    const optionsObjective = listObjectives?.map((item: Object) => ({
        value: item?.codename || "",
        label: item?.codename || "",
    }));

    const sampleTypes = {
        list: "",
        soil: "Soil",
        liquid: "Liquid",
        gas: "Landfill Gas",
    }

    const COC = {
        cocid: cocId,
        jobno: jobNo,
        siteid: siteID,
        siteaddress: address,
        objective: objective,
        sampletype: sampleTypes[sampleType],
    };

    /**
     * Handle search
     * @param {String} e
     */
    const handleSearch = (e) => {
        e.preventDefault();
        handleSearchSample(COC);
    };

    /**
     * Clear search key word and return list data default
     */
    const handleClear = () => {
        setJobNo("");
        setSiteID("");
        setCOCId("");
        setAddress("");
        setObjective("");

        handleSearchSample({
            cocid: "",
            jobno: "",
            siteid: "",
            siteaddress: "",
            objective: "",
            sampletype: sampleTypes[sampleType],
        });
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
                            <div className="col form-item"></div>
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
                                        !objective
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
