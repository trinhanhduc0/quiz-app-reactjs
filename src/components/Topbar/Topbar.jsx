import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ToggleButton from "~/components/ToggleButton/ToggleButton";
import { useTranslation } from "react-i18next";
import "./Topbar.scss";

const Topbar = ({ onClick, isOpen }) => {
  const { i18n } = useTranslation();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (
      (dropdownRef.current && !dropdownRef.current.contains(event.target)) ||
      (languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target))
    ) {
      setDropdownOpen(false);
      setLanguageDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      {!isOpen && (
        <div className="topbar">
          <div className="left">
            <ToggleButton onClick={onClick} />
          </div>
          <div className="center">
            <div className="logo">QUIZ APP</div>
          </div>
          <div className="right">
            <div className="language" onClick={toggleLanguageDropdown}>
              Language
            </div>
            {isLanguageDropdownOpen && (
              <div className="dropdown" ref={languageDropdownRef}>
                <div
                  className="dropdownItem"
                  onClick={() => changeLanguage("en")}
                >
                  English
                </div>
                <div
                  className="dropdownItem"
                  onClick={() => changeLanguage("vi")}
                >
                  Tiếng Việt
                </div>
              </div>
            )}
            <div className="user" onClick={toggleDropdown}>
              User
            </div>
            {isDropdownOpen && (
              <div className="dropdown" ref={dropdownRef}>
                <div className="dropdownItem">
                  <Link className="link" to="/login">
                    Login
                  </Link>
                </div>
                <div className="dropdownItem">
                  <Link className="link" to="/logout">
                    Logout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
