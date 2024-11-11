import React, { useState } from "react";
import { Input } from "antd";
import "./Fill.scss";

const FillInTheBlankQuestion = ({
  question,
  onAnswerChange,
  answer,
  isDone,
}) => {
  const [answers, setAnswers] = useState({});

  const calculateInputWidth = (text) => {
    const characterWidth = 8; // Adjusted width for readability
    return Math.max(60, (text || "").length * characterWidth); // Minimum width for readability
  };

  const handleInputChange = (optionId, event) => {
    const newAnswer = event.target.value;

    setAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [optionId]: newAnswer,
      };

      onAnswerChange(question._id, {
        type: "fill_in_the_blank",
        fill_in_the_blank: Object.entries(updatedAnswers).map(
          ([id, value]) => ({
            id,
            correct_answer: value,
          })
        ),
      });

      return updatedAnswers;
    });
  };

  return (
    <div className="fill-in-the-blank-content bg-white rounded-lg shadow-lg max-w-full border border-gray-300">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Câu hỏi: {question.question_content.text}
      </h2>
      {question.fill_in_the_blank.map((item) => (
        <div
          key={item.id}
          className="fill-in-the-blank-item lg:text-lg sm:text-sm text-gray-800 mb-4 text-wrap"
          style={{ display: "inline" }} // Ensure inline display
        >
          <span className="text-gray-700" style={{ display: "inline" }}>
            {item.text_before}
          </span>

          <Input
            className="blank-input transition-all duration-200 border border-blue-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-md"
            placeholder={item.blank}
            value={
              answer
                ? answer.fill_in_the_blank.find((a) => a.id === item.id)
                    ?.correct_answer ?? ""
                : answers[item.id] || ""
            }
            maxLength={30}
            onChange={
              isDone ? undefined : (event) => handleInputChange(item.id, event)
            }
            style={{
              padding: "6px 10px",
              margin: "0 8px",
              minWidth: "80px", // For better responsiveness
              maxWidth: "200px", // Set a maximum width to prevent overflow
              width:
                calculateInputWidth(
                  answer
                    ? answer.fill_in_the_blank.find((a) => a.id === item.id)
                        ?.correct_answer || item.blank
                    : item.blank
                ) + 20, // Extra space for placeholder visibility
              display: "inline-block", // Ensure input displays inline
            }}
          />
          <span className="text-gray-700" style={{ display: "inline" }}>
            {item.text_after}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FillInTheBlankQuestion;
