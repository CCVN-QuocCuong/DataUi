/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { Tabs, Tab, Button } from "react-bootstrap";
import { useLocation, useHistory } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "hooks";
import { getLists as getListsCode } from "store/code";
import { clearErrorMessage, setIsPrint } from "store/coc";
import PATHS from "routes/const";
import UserLayout from "layouts/User";
import COCForm from "./components/COCForm";
import SampleDetails from "./components/SampleDetails";
import "./style.css";
import Message from "components/Message";

export function CreateCOCForm() {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { state } = useLocation();
    const [samplesSelected, setSamplesSelected] = useState(state?.samples || []);
    const [submitForm, setSubmitForm] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [titlePopup] = useState("Error");
    const { error, loading } = useAppSelector((state) => state.coc);

    useEffect(() => {
        dispatch(getListsCode());
    }, []);

    useEffect(() => {
        if (error) {
            dispatch(clearErrorMessage());
            dispatch(setIsPrint(false));
        }
    }, [error]);

    /**
     * Handle change sample selected
     * @dependency {samplesSelected}
     */
    const handleChangeSampleSelected = useCallback((data) => {
        setSamplesSelected(data);
    }, [samplesSelected]);

    /**
     * Handle save
     * @dependency {samplesSelected}
     */
    const handleSubmitSave = useCallback(() => {
        if (samplesSelected.length > 50) {
            setMessageContent(
                "Maximum 50 samples can be generate COC at one time!"
            );
            setShowMessage(true);
        } else {
            dispatch(setIsPrint(false));
            setSubmitForm(true);
        }
    }, [samplesSelected]);

    /**
     * Handle savee and print pdf
     * @dependency {samplesSelected}
     */
    const handleSubmitSavePrint = useCallback(() => {
        if (samplesSelected.length > 50) {
            setMessageContent(
                "Maximum 50 samples can be generate COC at one time!"
            );
            setShowMessage(true);
        } else {
            setSubmitForm(true);
            dispatch(setIsPrint(true));
        }
    }, [samplesSelected]);

    /**
     * Handle change status submit
     * @param {Boolean}
     */
    const changeStatusSubmitForm = useCallback((status) => {
        setSubmitForm(status);
    }, []);

    /**
     * Handle close message
     * @type {*}
     */
    const handleCloseMessage = useCallback(() => {
        setShowMessage(false);
    }, []);

    return (
        <UserLayout>
            <div className="create-coc-wrapper">
                {showMessage && (
                    <Message
                        open={showMessage}
                        closeModal={() => handleCloseMessage()}
                        message={messageContent}
                        title={titlePopup}
                    />
                )}
                <COCForm samplesSelected={samplesSelected} submitForm={submitForm} changeStatusSubmitForm={changeStatusSubmitForm} />
                <Tabs
                    defaultActiveKey="sample_details"
                    id="justify-tab-coc"
                    className="coc-tabs"
                >
                    <Tab eventKey="sample_details" title="Sample Details">
                        <SampleDetails samplesSelected={samplesSelected} changeSampleSelected={handleChangeSampleSelected} />
                    </Tab>
                </Tabs>
                <div className="button-group text-right">
                    <Button
                        variant="secondary"
                        type="button"
                        disabled={loading}
                        onClick={handleSubmitSave}
                    >
                        Save
                    </Button>
                    <Button
                        variant="secondary"
                        type="button"
                        disabled={loading}
                        onClick={handleSubmitSavePrint}
                    >
                        Save & print COC
                    </Button>
                    <Button
                        variant="secondary"
                        type="button"
                        disabled={loading}
                        onClick={() => {
                            console.log('history.push 9')
                            history.push(PATHS.HOMEPAGE);
                        }}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </UserLayout>
    );
}
