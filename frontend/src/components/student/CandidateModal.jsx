import React from "react";
import { Modal, Button } from "react-bootstrap";

const CandidateModal = ({ show, onHide, title, content }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{ whiteSpace: "pre-line" }}>{content}</div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

export default CandidateModal;
