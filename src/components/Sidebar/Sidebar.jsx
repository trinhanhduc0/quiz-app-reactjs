import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.scss";
import { AiOutlineDashboard, AiOutlineLogout } from "react-icons/ai";
import { BiBookBookmark, BiTestTube } from "react-icons/bi";
import { useTranslation } from "react-i18next"; // Import useTranslation
import TokenService from "~/services/TokenService";

const Sidebar = forwardRef(({ isOpen, toggle }, ref) => {
  const { t } = useTranslation(); // Use translation hook

  return (
    <div ref={ref} className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="top-side flex justify-center align-center">
        <Link to="/dashboard">QUIZ APP</Link>
      </div>

      <ul>
        <li onClick={toggle}>
          <Link to="/dashboard">
            <AiOutlineDashboard className="icon" /> {t("sidebar.dashboard")}{" "}
            {/* Use translation */}
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
            <Link
              to="/logout"
              onClick={() => {
                TokenService.logout();
              }}
            >
              <AiOutlineLogout className="icon" /> {t("sidebar.login")}
            </Link>
          </li>
        ) : (
          <li onClick={toggle}>
            <Link
              to="/logout"
              onClick={() => {
                TokenService.logout();
              }}
            >
              <AiOutlineLogout className="icon" /> {t("sidebar.logout")}
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
});

export default Sidebar;
