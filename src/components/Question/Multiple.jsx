import React, { useEffect, useState } from "react";
import { Checkbox, Space } from "antd";
import OptionImage from "~/components/OptionImage/OptionImage";
import "./Multiple.scss";

const MultipleChoiceQuestion = ({
  question,
  author,
  onAnswerChange,
  answer,
  isDone,
}) => {
  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    if (answer && answer.options) {
      const selectedIds = answer.options.map((option) => option.id);
      setSelectedValues(selectedIds);
    }
  }, [answer]);

  const onChange = (checkedValues) => {
    setSelectedValues(checkedValues);
    onAnswerChange(question._id, {
      type: "multiple_choice_question",
      options: checkedValues.map((value) => ({ id: value })),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Câu hỏi: {question.question_content.text}
      </h2>

      <Checkbox.Group
        className="option-list"
        onChange={isDone ? undefined : onChange} // Không cho phép thay đổi nếu đã có answer
        value={selectedValues}
      >
        <Space direction="vertical" size="large" className="w-full">
          {question.options.map((option) => (
            <div key={option.id} className="w-full">
              <Checkbox
                value={option.id}
                className="w-full flex items-center border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
              >
                <div className="flex flex-col justify-center items-center w-full space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <div className="flex-1 text-gray-800 text-lg font-medium text-center sm:text-left flex items-center justify-center">
                    {option.text}
                  </div>
                  {option.imageurl && (
                    <OptionImage
                      imageUrl={option.imageurl}
                      email={author}
                      width={80}
                      className="rounded-lg shadow-sm sm:ml-4 sm:mt-0 mt-4 w-24 object-cover"
                    />
                  )}
                </div>
              </Checkbox>
            </div>
          ))}
        </Space>
      </Checkbox.Group>
    </div>
  );
};

export default MultipleChoiceQuestion;
