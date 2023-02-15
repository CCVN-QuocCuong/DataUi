import { Button, Modal } from "react-bootstrap";
import "./style.css";

/**
 * Component to display modal confirm 
 * @param {boolean} open
 * @param {string} message
 * @param {string | null} title
 * @param {Function} handleConfirm
 * @param {Function} closeModal
 * @param {string | null} textOK
 * @param {string | null} textCancel
 * @param {boolean} disabledButton
 */
export function ModalConfirm({ open, handleConfirm, closeModal, message, title, textOK = "OK", textCancel = "Cancel", disabledButton = false }) {
    return (
        <Modal show={open} onHide={closeModal} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{title || "Error"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" disabled={disabledButton} onClick={handleConfirm}>
                    {textOK}
                </Button>
                <Button variant="secondary" disabled={disabledButton} onClick={closeModal}>
                    {textCancel}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
