import React, { forwardRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.scss";
import { AiOutlineDashboard, AiOutlineLogout } from "react-icons/ai";
import { BiBookBookmark, BiTestTube } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import TokenService from "~/services/TokenService";
import { Modal } from "antd";

const Sidebar = forwardRef(({ isOpen, toggle }, ref) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    TokenService.removeToken();
    window.location.href = "/login"; // Chuyển đến trang login sau khi đăng xuất
    setIsModalVisible(false); // Đóng modal sau khi đăng xuất
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Đóng modal nếu người dùng hủy
  };

  return (
    <div ref={ref} className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="top-side flex justify-center align-center">
        <Link to="/dashboard">QUIZ APP</Link>
      </div>

      <ul>
        <li onClick={toggle}>
          <Link to="/dashboard">
            <AiOutlineDashboard className="icon" /> {t("sidebar.dashboard")}
          </Link>
        </li>
        <li onClick={toggle}>
          <Link to="/manage-class">
            <BiBookBookmark className="icon" /> {t("sidebar.manageClass")}
          </Link>
        </li>
        <li onClick={toggle}>
          <Link to="/manage-test">
            <BiTestTube className="icon" /> {t("sidebar.manageTest")}
          </Link>
        </li>
        <li onClick={toggle}>
          <Link to="/manage-question">
            <BiTestTube className="icon" /> {t("sidebar.manageQuestions")}
          </Link>
        </li>
        {TokenService.getToken() == null ? (
          <li onClick={toggle}>
            <Link to="/login">
              <AiOutlineLogout className="icon" /> {t("sidebar.login")}
            </Link>
          </li>
        ) : (
          <li onClick={toggle}>
            <Link onClick={showModal} className="logout-link">
              <AiOutlineLogout className="icon" /> {t("sidebar.logout")}
            </Link>
          </li>
        )}
      </ul>
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
    </div>
  );
});

export default Sidebar;
