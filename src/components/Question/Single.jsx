import OptionImage from "~/components/OptionImage/OptionImage";
import React, { useEffect, useState } from "react";
import { Radio, Space } from "antd";
import "./Single.scss"; // Bạn có thể gỡ bỏ nếu Tailwind đã thay thế hoàn toàn CSS

const SingleChoiceQuestion = ({
  question,
  author,
  onAnswerChange,
  answer,
  isDone,
}) => {
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    if (answer && answer.options && answer.options.length > 0) {
      setSelectedValue(answer.options[0].id);
    }
  }, [answer]);

  const handleOptionChange = (e) => {
    setSelectedValue(e.target.value);
    onAnswerChange(question._id, {
      type: "single_choice_question",
      options: [{ id: e.target.value }],
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Câu hỏi: {question.question_content.text}
      </h2>

      <Radio.Group
        onChange={isDone ? undefined : handleOptionChange}
        value={selectedValue}
        className="space-y-6 w-full"
      >
        {question.question_content.image_url && (
          <div className="flex justify-center mb-6">
            <OptionImage
              imageUrl={question.question_content.image_url}
              email={author}
              width={200}
              className="rounded-lg shadow-lg"
            />
          </div>
        )}

        <Space direction="vertical" size="large" className="w-full">
          {question.options.map((option) => (
            <Radio
              key={option.id}
              value={option.id}
              className="w-full flex items-center p-2 border border-gray-300 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300 ant-radio-wrapper"
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
                    className="rounded-lg shadow-sm sm:ml-4 sm:mt-0 mt-4 h-24 w-24 object-cover"
                  />
                )}
              </div>
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );
};

export default SingleChoiceQuestion;
