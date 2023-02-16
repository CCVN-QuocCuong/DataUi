import { useState } from "react";
import DatePicker from "react-datepicker";
import { Form } from "react-bootstrap";
import { useAppSelector } from "hooks";
import "./style.css";

type Object = {
    [key: string]: any;
};

/**
 * Component to display the search form in modal Add Sample
 * @param {object} validate
 * @param {Function} onSubmit
 * @param {Function} handleSearchSample
 */
export function SearchBar({ validate, onSubmit, handleSearchSample }) {
    const { codes } = useAppSelector((state) => state.code);

    const listObjectives = codes?.filter((item: Object) => item?.codetypecode === "Objective");
    const optionsObjective = listObjectives?.map((item: Object) => ({
        value: item.codename,
        label: item.codename,
    }));

    const [jobNo, setJobNo] = useState(validate?.jobnumber || "");
    const [siteID, setSiteID] = useState(validate?.siteid || "");
    const [sampler, setSampler] = useState("");
    const [address, setAddress] = useState("");
    const [objective, setObjective] = useState(validate?.objective || "");
    const [startDate, setStartDate] = useState<Date | null>(null);

    const Sample = {
        jobnumber: jobNo?.trim() || "",
        siteid: siteID?.trim() || "",
        sampler: sampler?.trim() || "",
        siteaddress: address?.trim() || "",
        collectiondate:
            startDate?.toLocaleDateString("en-UK") || "",
        objective: objective || "",
        sampletype: validate?.sampletype || "",
    };

    /**
     * Function handle action submit search form
     * @param {object} e
     */
    const handleSearch = (e) => {
        e.preventDefault();
        handleSearchSample(Sample);
    };

    /**
     * Function handle action clear search form
     */
    const handleClear = () => {
        setJobNo(validate?.jobnumber || "");
        setSiteID(validate?.siteid || "");
        setSampler("");
        setAddress("");
        setObjective(validate?.objective || "");
        setStartDate(null);

        handleSearchSample({
            jobnumber: validate?.jobnumber || "",
            siteid: validate?.siteid || "",
            sampler: "",
            siteaddress: "",
            collectiondate: "",
            objective: validate?.objective || "",
            sampletype: validate?.sampletype || "",
        });
    };

    return (
        <div className="search-bar-wrapper">
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
                                    disabled
                                    onChange={(e) => setJobNo(e.target.value)}
                                    value={jobNo}
                                />
                            </div>
                            <div className="col form-item">
                                <p>Sampler</p>
                                <input
                                    className="form-control dropdown-height"
                                    type=" text"
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
                                    value={startDate}
                                />
                            </div>
                            <div className="w-100"></div>
                            <div className="col form-item">
                                <p>Site ID</p>
                                <input
                                    className="form-control dropdown-height"
                                    type=" text"
                                    placeholder=""
                                    disabled
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
                                        disabled
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
                                        !startDate
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
                                    Add Samples
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
