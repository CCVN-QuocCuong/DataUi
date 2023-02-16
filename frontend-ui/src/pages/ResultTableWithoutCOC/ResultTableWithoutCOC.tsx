import { Tabs, Tab } from "react-bootstrap";
import UserLayout from "layouts/User";
import COCFiles from "./components/COCFiles";
import "./style.css";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useAppSelector } from "hooks";

export function ResultTableWithoutCOC() {
    const [loading] = useAppSelector((state) => [state.file.loading]);

    const renderLoading = (children) => {
        return (
            <LoadingOverlayWrapper fadeSpeed={100} active={loading} spinner
                styles={{
                    overlay: (base) => ({
                        ...base,
                        background: 'rgba(0, 0, 0, 0.14)'
                    })
                }}
            >
                {children}
            </LoadingOverlayWrapper >
        )
    }

    return (
        <UserLayout>
            <div className="report-coc-wrapper">
                <Tabs
                    defaultActiveKey="lab_files"
                    id="justify-tab-coc"
                    className="lab-tabs"
                >
                    <Tab eventKey="lab_files" title="Lab Files">
                        {renderLoading(<COCFiles />)}
                    </Tab>
                </Tabs>
            </div>
        </UserLayout>
    );
}
