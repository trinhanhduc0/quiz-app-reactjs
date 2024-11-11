import React from "react";
import "./ToggleButton.scss";

const ToggleButton = ({ onClick }) => {
  return (
    <button className="toggle-btn" onClick={onClick}>
      <span className="middle-bar"></span>
    </button>
  );
};

export default ToggleButton;
