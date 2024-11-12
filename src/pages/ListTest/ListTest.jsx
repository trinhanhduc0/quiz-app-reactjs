import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TokenService from "~/services/TokenService";
import API_ENDPOINTS from "~/config/config";
import { Spin, Alert } from "antd"; // Thêm Spin cho loading và Alert cho thông báo lỗi
import "./ListTest.scss";
import { apiCall } from "../../services/apiCallService";

const ListTest = () => {
  const navigate = useNavigate();
  const { classId, author } = useParams();
  const location = useLocation();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true); // State loading
  const [error, setError] = useState(null); // State error

  const { test_ids: testIds } = location.state || {};

  // Hàm fetch dữ liệu được tối ưu hóa
  const fetchClassData = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset lỗi khi bắt đầu tải dữ liệu
    try {
      const testsResponse = await apiCall(
        API_ENDPOINTS.GETTESTS,
        "POST",
        {
          _id: testIds,
        },
        navigate
      );

      const testsData = await testsResponse;
      setTests(testsData);
    } catch (error) {
      setError("There was an error loading the tests. Please try again later.");
      console.error("Error fetching class data:", error);
    } finally {
      setLoading(false);
    }
  }, [testIds]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  const handleTestClick = (testId, author, isTest) => {
    navigate(`/do-test/${isTest}/${author}/${testId}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <Spin size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          className="error-message"
        />
      );
    }

    return (
      <div className="list-test-content">
        {tests.length > 0 ? (
          tests.map((test) => {
            const startTime = new Date(test.start_time);
            const endTime = new Date(test.end_time);
            const now = Date.now();

            const isWithinTimeRange =
              now >= startTime.getTime() && now <= endTime.getTime();

            return (
              <div key={test._id} className="test-item">
                <h3 className="test-title">{test.test_name}</h3>
                <pre className="test-description">{test.descript}</pre>
                <div className="test-dates">
                  <div>
                    <span className="start-time">
                      {startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="start-date">
                      {startTime.toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="end-time">
                      {endTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="end-date">
                      {endTime.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="test-duration">
                  Duration: {test.duration_minutes}'
                </p>
                {isWithinTimeRange && (
                  <button
                    className="start-test-btn"
                    onClick={() =>
                      handleTestClick(test._id, author, test.is_test)
                    }
                  >
                    Start Test
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p className="no-tests">No tests found for this class.</p>
        )}
      </div>
    );
  };

  return (
    <div className="list-test-container">
      <main className="main-content">{renderContent()}</main>
    </div>
  );
};

export default ListTest;
