import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "~/config/config";
import JoinClass from "~/components/JoinClass/JoinClass";
import { Button, Spin } from "antd";
import { apiCallGet } from "../../services/apiCallService";
import { useTranslation } from "react-i18next"; // Import i18n hook

const Dashboard = () => {
  const { t } = useTranslation(); // Hook để truy cập i18n
  const [classes, setClasses] = useState([]);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCallGet(
        API_ENDPOINTS.STUDENT_CLASSES,
        navigate
      );
      setClasses(response);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const openJoinClassModal = () => {
    setIsJoinClassOpen(true);
  };

  const closeJoinClassModal = () => {
    setIsJoinClassOpen(false);
  };

  const handleClassClick = (classId, author, testIds) => {
    navigate(`/list-test/${classId}/${author}`, {
      state: { test_ids: testIds },
    });
  };

  return (
    <div className="dashboard max-w-7xl mx-auto px-4 py-6">
      <div className="joinClass mb-6">
        <Button
          onClick={openJoinClassModal}
          className="open-join-class-button bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 py-2 px-4 rounded-lg shadow-md"
        >
          {t("dashboard.join_class")} {/* Dùng i18n cho nút */}
        </Button>

        <JoinClass
          isOpen={isJoinClassOpen}
          onRequestClose={closeJoinClassModal}
        />
      </div>

      {/* Dùng i18n cho lời chào */}
      {loading ? (
        <div className="loading-state flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : classes && classes.length > 0 ? (
        <div className="class-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem._id}
              className="class-card bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() =>
                handleClassClick(
                  classItem._id,
                  classItem.author_mail,
                  classItem.test_id
                )
              }
            >
              <h2 className="class-title text-xl font-semibold text-gray-900 mb-4">
                {classItem.class_name}
              </h2>
              <div className="class-details text-gray-700">
                <p className="mb-2">
                  <strong>{t("dashboard.author")}:</strong>{" "}
                  {classItem.author_mail}
                </p>
                <p>
                  <strong>{t("dashboard.tags")}:</strong>{" "}
                  {classItem.tags.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-classes text-center text-gray-600">
          {t("dashboard.no_classes")}
        </p>
      )}
    </div>
  );
};

export default Dashboard;
