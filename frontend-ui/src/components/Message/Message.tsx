import { Button, Modal } from "react-bootstrap";
import "./style.css";

/**
 * Component to display popup messages
 * @param {boolean} open
 * @param {string} message
 * @param {string | null} title
 * @param {Function} closeModal
 */
export function Message({ open, closeModal, message, title }) {
    return (
        <Modal show={open} onHide={closeModal} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{title || "Error"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
