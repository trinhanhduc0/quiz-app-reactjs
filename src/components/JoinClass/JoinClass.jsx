import React, { useState } from "react";
import { Modal } from "antd";
import API_ENDPOINTS from "~/config/config";
import { apiCall } from "~/services/apiCallService";
import "./JoinClass.scss";

function JoinClass({ isOpen, onRequestClose }) {
  const [classId, setClassId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleInputChange = (event) => {
    setClassId(event.target.value);
  };

  const handleJoinClass = async () => {
    setStatusMessage("Joining class...");
    const response = await apiCall(API_ENDPOINTS.JOINCLASS, "POST", {
      _id: classId,
    });
    // Check if the response contains a success field
    if (response.success) {
      setStatusMessage("Successfully joined the class!");
      setClassId(""); // Clear input on success
      window.location.reload();
    } else {
      setStatusMessage("Failed to join the class. Please try again.");
    }
  };

  return (
    <Modal
      visible={isOpen}
      onCancel={onRequestClose}
      footer={null}
      className="join-class-modal"
    >
      <div className="join-class-container">
        <h1 className="title">Join a Class</h1>
        <div className="input-container">
          <input
            type="text"
            value={classId}
            onChange={handleInputChange}
            placeholder="Enter Class ID"
            className="input-field"
          />
          <div className="buttons">
            <button onClick={handleJoinClass} className="join-button">
              Join
            </button>
          </div>
        </div>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </Modal>
  );
}

export default JoinClass;
