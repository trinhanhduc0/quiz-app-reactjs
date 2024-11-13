import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "antd";

import ToggleButton from "~/components/ToggleButton/ToggleButton";
import { useTranslation } from "react-i18next";
import "./Topbar.scss";
import TokenService from "~/services/TokenService";

const Topbar = ({ onClick, isOpen }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái hiển thị modal

  const toggleLanguageDropdown = () => {
    setLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (
      languageDropdownRef.current &&
      !languageDropdownRef.current.contains(event.target)
    ) {
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

  const showModal = () => {
    setIsModalVisible(true); // Hiển thị modal khi người dùng muốn đăng xuất
  };

  const handleOk = () => {
    TokenService.removeToken();
    window.location.href = "/login"; // Đăng xuất và chuyển đến trang login
    setIsModalVisible(false); // Đóng modal sau khi đăng xuất
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Đóng modal nếu người dùng hủy
  };
  return (
    <>
      {!isOpen && (
        <div className="topbar">
          <div className="left">
            <ToggleButton onClick={onClick} />
          </div>
          <div className="center">
            <div
              className="logo"
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              QUIZ APP
            </div>
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
                  {i18n.language === "en" && "✓"} English
                </div>
                <div
                  className="dropdownItem"
                  onClick={() => changeLanguage("vi")}
                >
                  {i18n.language === "vi" && "✓"} Tiếng Việt
                </div>
              </div>
            )}
            {TokenService.getToken() == null ? (
              <div className="login-btn text-nowrap">
                <Link
                  className="link"
                  to="/login"
                  onClick={() => {
                    TokenService.logout();
                  }}
                >
                  {t("sidebar.login")}
                </Link>
              </div>
            ) : (
              <div className="logout-btn text-nowrap" onClick={showModal}>
                <span
                  className="link"
                  onClick={() => {
                    TokenService.logout();
                  }}
                >
                  {t("sidebar.logout")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal xác nhận đăng xuất */}
      <Modal
        title="Confirm Logout"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes"
        cancelText="No"
      >
        <p>{t("sidebar.logout_comfirm")}</p>
      </Modal>
    </>
  );
};

export default Topbar;
