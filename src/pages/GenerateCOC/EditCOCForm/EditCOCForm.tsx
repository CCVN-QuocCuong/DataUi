/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { Tabs, Tab, Button } from "react-bootstrap";
import { useHistory, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "hooks";
import { toast } from "react-toastify";
import UserLayout from "layouts/User";
import COCForm from "./components/COCForm";
import SampleDetails from "./components/SampleDetails";
import { getLists as getListsCode } from "store/code";
import { getCOCByID, clearErrorMessage, setIsPrint, setUpdateSuccess, setSuccess, getListsCOCFile } from "store/coc";
import "./style.css";
import PATHS from "routes/const";
import DigitalCOC from "./components/DigitalCOC";
import Message from "components/Message";

export function EditCOCForm() {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { id } = useParams();
    const [cocDetail, error, loading, updateSuccess, addSuccess] = useAppSelector((state) => [state.coc.coc, state.coc.error, state.coc.loading, state.coc.updateSuccess, state.coc.addSuccess]);
    const [samplesSelected, setSamplesSelected] = useState([]);
    const [submitForm, setSubmitForm] = useState(false);
    const [printCOC, setPrintCOC] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isAddSample, setIsAddSample] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [titlePopup] = useState("Error");
    const handleChangeSampleSelected = useCallback((data) => {
        setSamplesSelected(data);
        setIsAddSample(true);
    }, [samplesSelected]);

    useEffect(() => {
        dispatch(getListsCode());
    }, []);

    useEffect(() => {
        dispatch(getCOCByID(id));
    }, [id]);

    useEffect(() => {
        setSamplesSelected(cocDetail?.samples || []);
    }, [cocDetail]);

    useEffect(() => {
        if (updateSuccess) {
            toast.success("Save COC successfully!");
            dispatch(setUpdateSuccess(false));
            dispatch(getListsCOCFile(id));
            setTimeout(() => {
                dispatch(setIsPrint(printCOC));
            }, 3500);
            setIsDirty(false);
        }
    }, [updateSuccess, cocDetail]);

    useEffect(() => {
        if (addSuccess) {
            toast.success("Save COC successfully!");
            dispatch(getListsCOCFile(id));
            dispatch(setSuccess(false));
        }
    }, [addSuccess]);

    useEffect(() => {
        if (error) {
            dispatch(clearErrorMessage());
            dispatch(setIsPrint(false));
        }
    }, [error]);

    /**
     * Handle save COC
     */
    const handleSubmitSave = useCallback(() => {
        if (samplesSelected.length > 50) {
            setMessageContent(
                "Maximum 50 samples can be generate COC at one time!"
            );
            setShowMessage(true);
        } else {
            setPrintCOC(false);
            setSubmitForm(true);
        }
    }, [samplesSelected]);

    /**
     * Handle save and print pdf file
     */
    const handleSubmitSavePrint = useCallback(() => {
        if (samplesSelected.length > 50) {
            setMessageContent(
                "Maximum 50 samples can be generate COC at one time!"
            );
            setShowMessage(true);
        } else {
            setPrintCOC(true);
            setSubmitForm(true);
        }
    }, [samplesSelected]);

    /**
     * Handle change status print
     */
    const handleSubmitPrint = useCallback(() => {
        dispatch(setIsPrint(true));
    }, [samplesSelected]);

    /**
     * Handle change status submit
     */
    const changeStatusSubmitForm = useCallback((status) => {
        setSubmitForm(status);
    }, []);

    /**
     * Handle change is dirty
     */
    const changeIsDirty = useCallback((status) => {
        setIsDirty(status);
    }, []);

    /**
     * Handle close message
     */
    const handleCloseMessage = useCallback(() => {
        setShowMessage(false);
    }, []);

    return (
        <UserLayout>
            <div className="edit-coc-wrapper">
                {showMessage && (
                    <Message
                        open={showMessage}
                        closeModal={() => handleCloseMessage()}
                        message={messageContent}
                        title={titlePopup}
                    />
                )}

                <COCForm cocDetail={cocDetail} isAddSample={isAddSample} samplesSelected={samplesSelected} submitForm={submitForm} changeStatusSubmitForm={changeStatusSubmitForm} changeIsDirty={changeIsDirty} />
                <Tabs
                    defaultActiveKey="sample_details"
                    id="justify-tab-coc"
                    className="coc-tabs"
                >
                    <Tab eventKey="sample_details" title="Sample Details">
                        <SampleDetails samplesSelected={samplesSelected} changeSampleSelected={handleChangeSampleSelected} changeIsDirty={changeIsDirty} />
                    </Tab>
                    <Tab eventKey="coc_files" title="Digital COC">
                        <DigitalCOC cocID={id || 0} />
                    </Tab>
                </Tabs>
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
                        Save & print COC
                    </Button>
                    <Button
                        variant="secondary"
                        type="button"
                        disabled={loading || isDirty}
                        onClick={handleSubmitPrint}
                    >
                        Print COC
                    </Button>
                    <Button
                        variant="secondary"
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            console.log('history.push 11')
                            history.push(PATHS.COC_LIST_SOIL);
                        }}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </UserLayout>
    );
}
