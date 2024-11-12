import React, { useState, useEffect, useCallback } from "react";
import TokenService from "~/services/TokenService";
import { useNavigate } from "react-router-dom";
import API_ENDPOINTS from "~/config/config";
import "./Dashboard.scss";
import JoinClass from "~/components/JoinClass/JoinClass";
import { Button, Spin } from "antd"; // Thêm Spin cho loading state
import { apiCallGet } from "../../services/apiCallService";

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [loading, setLoading] = useState(true); // State loading để hiển thị khi fetching dữ liệu
  const navigate = useNavigate();

  // Hàm fetch classes được tối ưu để sử dụng useCallback
  const fetchClasses = useCallback(async () => {
    setLoading(true); // Bắt đầu loading khi gọi API
    try {
      const response = await apiCallGet(
        API_ENDPOINTS.STUDENT_CLASSES,
        navigate
      );
      console.log(response);
      // if (!response.ok) {
      //   if (response.status === 401) {
      //     navigate("/login");
      //   }
      //   throw new Error("Network response was not ok");
      // }
      setClasses(response);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  }, []);

  // Gọi fetchClasses chỉ 1 lần khi component mount
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
    <div className="dashboard">
      <div className="joinClass">
        <Button
          onClick={openJoinClassModal}
          className="open-join-class-button"
          type="primary"
        >
          Join a Class
        </Button>

        <JoinClass
          isOpen={isJoinClassOpen}
          onRequestClose={closeJoinClassModal}
        />
      </div>
      <p className="welcome-text">Welcome to your dashboard!</p>
      {loading ? (
        <div className="loading-state">
          <Spin size="large" />
        </div>
      ) : classes && classes.length > 0 ? (
        <div className="class-list">
          {classes.map((classItem) => (
            <div
              key={classItem._id}
              className="class-card"
              onClick={() =>
                handleClassClick(
                  classItem._id,
                  classItem.author_mail,
                  classItem.test_id
                )
              }
            >
              <h2 className="class-title">{classItem.class_name}</h2>
              <div className="class-details">
                <p>
                  <strong>Author:</strong> {classItem.author_mail}
                </p>
                <p>
                  <strong>Tags:</strong> {classItem.tags.join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-classes">No classes found.</p>
      )}
    </div>
  );
};

export default Dashboard;
