import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TokenService from "~/services/TokenService";
import API_ENDPOINTS from "~/config/config";
import { apiCall } from "~/services/apiCallService";
import "./DoTest.scss";
import QuestionComponent from "~/components/Question/Question";
import { Alert, Button, Modal, message, Progress } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  CheckOutlined,
  HourglassOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const DoTest = () => {
  const navigate = useNavigate();
  const { isTest, author, testId } = useParams();
  const questionCache = `questions_${testId}`;
  const answerCache = "quizAnswers";

  const [infoTest, setInfoTest] = useState(null);
  const [countdownTime, setCountdownTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState(() => {
    const savedAnswers = localStorage.getItem(answerCache);
    return savedAnswers ? JSON.parse(savedAnswers) : {};
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleNavigateToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setIsModalVisible(false);
  };

  const handleSendTest = () => {
    Modal.confirm({
      title: (
        <span
          style={{ fontSize: "18px", fontWeight: "bold", color: "#FF4D4F" }}
        >
          Are you sure you want to submit the test?
        </span>
      ),
      content: (
        <span style={{ fontSize: "16px", color: "#595959" }}>
          Once submitted, you will not be able to make further changes.
        </span>
      ),
      okText: "Submit",
      okButtonProps: {
        style: {
          backgroundColor: "#4CAF50",
          color: "white",
          fontWeight: "bold",
        },
      },
      cancelText: "Cancel",
      cancelButtonProps: {
        style: { fontWeight: "bold" },
      },
      centered: true,
      icon: <ExclamationCircleOutlined style={{ color: "#FF4D4F" }} />,
      onOk: async () => {
        try {
          await apiSendTest();
          message.success("Test submitted successfully!");
        } catch {
          message.error(
            "There was an error submitting your test. Please try again."
          );
        }
      },
    });
  };

  const apiSendTest = async () => {
    const question_answer = Object.entries(answers).map(
      ([questionId, answer]) => {
        if (typeof answer === "object" && answer !== null) {
          if (answer.hasOwnProperty("fill_in_the_blank")) {
            return {
              question_id: questionId,
              fill_in_the_blank: answer.fill_in_the_blank.map((value) => value),
              type: answer.type,
            };
          } else if (answer.hasOwnProperty("options")) {
            return {
              question_id: questionId,
              options: answer.options,
              type: answer.type,
            };
          }
        }
        return { question_id: questionId, options: [] };
      }
    );
    const response = await apiCall(
      API_ENDPOINTS.SENDTEST,
      "POST",
      {
        test_id: testId,
        question_answer,
      },
      navigate
    );
    localStorage.removeItem(questionCache);
    localStorage.removeItem(answerCache);
    window.location.reload();
  };

  const simplifyAnswerData = (input) => {
    const simplifiedAnswer = {};
    !!input.question_answer &&
      input.question_answer.forEach((qa) => {
        const { question_id, type, options, fill_in_the_blank } = qa;
        const answerObj = { type };
        if (type === "fill_in_the_blank" && fill_in_the_blank) {
          answerObj.fill_in_the_blank = fill_in_the_blank.map((blank) => ({
            id: blank.id,
            correct_answer: blank.correct_answer,
          }));
        } else if (type === "match_choice_question") {
          answerObj.options = options.map((opt) => ({
            id: opt.id,
            ...(opt.matchid &&
              opt.matchid !== "000000000000000000000000" && {
                matchid: opt.matchid,
              }),
          }));
        } else if (options) {
          answerObj.options = options.map((opt) => ({ id: opt.id }));
        }
        simplifiedAnswer[question_id] = answerObj;
      });
    return simplifiedAnswer;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = { ...prevAnswers, [questionId]: answer };
      localStorage.setItem(answerCache, JSON.stringify(updatedAnswers));
      return updatedAnswers;
    });
  };

  const totalScore = questions.reduce(
    (total, question) => total + (question.score || 0),
    0
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const cachedData = localStorage.getItem(questionCache);
        if (cachedData) {
          const data = JSON.parse(cachedData);
          if (data.hasOwnProperty("answer")) {
            setIsDone(true);
            setScore(data.answer.score);
            const loadedQuestions = simplifyAnswerData(data.answer);
            setAnswers(loadedQuestions);
          } else {
            setInfoTest(data.test_info);
            startCountdown(data.test_info);
          }
          setQuestions(data.questions || []);
          setLoading(false);
          return;
        }
        const response = await apiCall(
          API_ENDPOINTS.GETQUESTIONS,
          "POST",
          {
            author_mail: author,
            _id: testId,
            is_test: isTest === "true",
          },
          navigate
        );

        localStorage.setItem(questionCache, JSON.stringify(response));

        if (response.hasOwnProperty("answer")) {
          setIsDone(true);
          setScore(response.answer.score);
          const loadedQuestions = simplifyAnswerData(response.answer);
          setAnswers(loadedQuestions);
        } else {
          setInfoTest(response.test_info);
          startCountdown(response.test_info);
        }
        setQuestions(response.questions || []);
      } catch (error) {
        setError("Error fetching questions");
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    const startCountdown = (testInfo) => {
      const now = Date.now();
      const cachedEndTime = localStorage.getItem("test_end_time");
      const endTime = cachedEndTime
        ? parseInt(cachedEndTime, 10)
        : now + testInfo.duration_minutes * 60 * 1000;

      if (!cachedEndTime) localStorage.setItem("test_end_time", endTime);

      if (endTime <= now) {
        handleSubmitTest();
        return;
      }

      const timerInterval = setInterval(() => {
        const remainingTime = endTime - Date.now();

        if (remainingTime <= 0) {
          clearInterval(timerInterval);
          handleSubmitTest();
        } else {
          const hours = Math.floor(remainingTime / (1000 * 60 * 60));
          const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
          const seconds = Math.floor((remainingTime / 1000) % 60);
          setCountdownTime({ hours, minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(timerInterval);
    };

    const handleSubmitTest = async () => {
      await apiSendTest();
    };

    fetchQuestions();
  }, [testId, author, isTest]);

  const handleNext = () => {
    setCurrentQuestionIndex((prevIndex) =>
      Math.min(prevIndex + 1, questions.length - 1)
    );
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="do-test">
      {questions && questions.length > 0 ? (
        <>
          {isDone ? (
            <div className="score-container completed">
              <CheckCircleOutlined
                style={{ fontSize: "24px", color: "#4CAF50" }}
              />
              <h4>
                <span className="score-text">
                  Total Score: {score.toFixed(2)} / {totalScore}
                </span>
              </h4>
              <Progress
                percent={(score / totalScore) * 100}
                status="success"
                strokeColor="#4CAF50"
                showInfo={false}
              />
              <span className="completion-status">Test Completed!</span>
            </div>
          ) : (
            <div className="score-container in-progress">
              <Progress
                percent={(
                  (Object.keys(answers).length / questions.length) *
                  100
                ).toFixed(2)}
                status="active"
                strokeColor="#FF9800"
                showInfo={false}
              />
              <p className="countdown-time">
                {`${countdownTime.hours} : ${countdownTime.minutes} : ${countdownTime.seconds}`}
              </p>
            </div>
          )}

          <h4 className="completion-status">
            {((Object.keys(answers).length / questions.length) * 100).toFixed(
              2
            )}
            %
          </h4>
          <div className="navigation-buttons">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              icon={<LeftOutlined />}
              className="navigation-btn"
            />
            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              icon={<RightOutlined />}
              className="navigation-btn"
            />

            {!isDone && (
              <Button
                size="large"
                onClick={handleSendTest}
                className="submit-test-btn"
                type="primary"
                icon={<CheckOutlined />}
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#4CAF50",
                  borderColor: "#4CAF50",
                  color: "#ffffff",
                }}
              />
            )}
          </div>

          <Button
            size="large"
            onClick={handleOpenModal}
            className="m-auto w-4/5 p-5 text-2xl border-2 border-gray-300 rounded-lg bg-white text-green-500 hover:bg-green-100 hover:text-green-700 transition-colors duration-300"
            icon={<FileSearchOutlined />}
          />

          <Modal
            title="Select Question"
            className="modal-question"
            open={isModalVisible}
            onCancel={handleCloseModal}
            footer={null}
            centered
          >
            <div className="question-status flex flex-wrap gap-2 justify-center">
              {questions.map((question, index) => (
                <Button
                  key={question._id}
                  onClick={() => handleNavigateToQuestion(index)}
                  className={`question-btn ${
                    answers[question._id] ? "answered" : "not-answered"
                  }`}
                  icon={
                    answers[question._id] ? (
                      <CheckCircleOutlined />
                    ) : (
                      <HourglassOutlined />
                    )
                  }
                  style={{
                    width: "50px",
                    height: "50px",
                    fontSize: "18px",
                    borderRadius: "50%",
                    border: answers[question._id]
                      ? "2px solid #4CAF50"
                      : "2px solid #E0E0E0",
                    backgroundColor: answers[question._id]
                      ? "#E8F5E9"
                      : "#F5F5F5",
                    transition: "all 0.3s ease",
                    color: "#3f51b5",
                  }}
                />
              ))}
            </div>
          </Modal>

          {isDone ? (
            <QuestionComponent
              key={questions[currentQuestionIndex]._id}
              question={questions[currentQuestionIndex]}
              author={author}
              answer={answers[questions[currentQuestionIndex]._id]}
              onAnswerChange={handleAnswerChange}
              isDone={isDone}
            />
          ) : (
            <QuestionComponent
              key={questions[currentQuestionIndex]._id}
              question={questions[currentQuestionIndex]}
              author={author}
              answer={answers[questions[currentQuestionIndex]._id]}
              onAnswerChange={handleAnswerChange}
              isDone={isDone}
            />
          )}
        </>
      ) : (
        <p>No questions available</p>
      )}
    </div>
  );
};

export default DoTest;
