import { useAppDispatch } from "hooks";
import { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { resetPagination } from "store/sample";
import SampleTable from "./components/SampleTable";
import "./style.css";

/**
 * Component to display Popup Add Sample to COC
 * @param {boolean} open
 * @param {Function} closeModal
 * @param {Array} samplesSelected
 * @param {Function} addSample
 */
export function AddSampleModal({ open, closeModal, samplesSelected, addSample }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(resetPagination());
    }, []);

    return (
        <Modal show={open} onHide={closeModal} size="xl" backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Add Sample</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="collection-wrapper">
                    <SampleTable samplesSelected={samplesSelected} addSample={addSample} />
                </div>
            </Modal.Body>
        </Modal>
    );
}
