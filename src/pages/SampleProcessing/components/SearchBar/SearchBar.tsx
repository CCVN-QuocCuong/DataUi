import { useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { Form } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "hooks";
import { getLists } from "store/sample";
import "./style.css";
import { optionsSampleType } from "constants/options";

type Object = {
    [key: string]: any;
};

export function SearchBar({ onSubmit, handleSearchSample }) {
    const dispatch = useAppDispatch();
    const { codes } = useAppSelector((state) => state.code);
    const refInput = useRef<HTMLInputElement>(null);
    const listObjectives = codes?.filter((item: Object) => item?.codetypecode === "Objective");
    const optionsObjective = listObjectives?.map((item: Object) => ({
        value: item.codename,
        label: item.codename,
    }));
    const [jobNo, setJobNo] = useState("");
    const [siteID, setSiteID] = useState("");
    const [sampler, setSampler] = useState("");
    const [address, setAddress] = useState("");
    const [objective, setObjective] = useState("");
    const [sampleType, setSampleType] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const Sample = {
        jobnumber: jobNo?.trim() || "",
        siteid: siteID?.trim() || "",
        sampler: sampler?.trim() || "",
        siteaddress: address?.trim() || "",
        collectiondate:
            startDate?.toLocaleDateString("en-UK") || "",
        objective: objective || "",
        sampletype: sampleType || "",
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleSearchSample(Sample);
    };
    const handleClear = () => {
        setJobNo("");
        setSiteID("");
        setSampler("");
        setAddress("");
        setObjective("");
        setStartDate(null);
        setSampleType('')
        dispatch(getLists({
            page: 1,
        }));
    };

    return (
        <div className="margin search-bar-wrapper">
            <form onSubmit={handleSearch}>
                <input type="text" ref={refInput} className="hidden" />
                <div className="row">
                    <div className="col-8">
                        <div className="row">
                            <div className="col form-item">
                                <p>Job No</p>
                                <input
                                    className="form-control dropdown-height"
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => setJobNo(e.target.value)}
                                    value={jobNo}
                                />
                            </div>
                            <div className="col form-item">
                                <p>Sampler</p>
                                <input
                                    className="form-control dropdown-height"
                                    type="text"
                                    placeholder=""
                                    onChange={(e) => setSampler(e.target.value)}
                                    value={sampler}
                                />
                            </div>
                            <div className="col form-item">
                                <p>Collection Date</p>
                                <DatePicker
                                    className="form-control react-date-picker__wrapper"
                                    selected={startDate}
                                    format="dd/MM/yyyy"
                                    onChange={(date) => setStartDate(date)}
                                    onCalendarClose={() => refInput?.current?.focus()}
                                    value={startDate}
                                />
                            </div>
                            <div className="col form-item"></div>
                            <div className="w-100"></div>
                            <div className="col form-item">
                                <p>Site ID</p>
                                <input
                                    className="form-control dropdown-height"
                                    type="text"
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
                                <p>Objective</p>
                                <div>
                                    <Form.Select
                                        aria-label="Select Objective"
                                        value={objective}
                                        name="objective"
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
                            <div className="col form-item">
                                <p>Sample Type</p>
                                <div>
                                    <Form.Select
                                        aria-label="Select Sample Type"
                                        value={sampleType}
                                        name="sampleType"
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
                                        !sampler &&
                                        !address &&
                                        !objective &&
                                        !startDate &&
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
                            <div className="col text-right">
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => onSubmit()}
                                >
                                    Generate COC
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
