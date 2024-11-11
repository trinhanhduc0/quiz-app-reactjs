import { Card } from "antd";
import FillInTheBlankQuestion from "./Fill";
import MultipleChoiceQuestion from "./Multiple";
import OrderQuestion from "./Order";
import SingleChoiceQuestion from "./Single";
import MatchQuestion from "./Match";

const QuestionComponent = ({
  question,
  author,
  onAnswerChange,
  answer,
  isDone,
}) => {
  const renderQuestion = () => {
    switch (question.type) {
      case "fill_in_the_blank":
        return (
          <FillInTheBlankQuestion
            question={question}
            onAnswerChange={onAnswerChange}
            answer={answer}
            isDone={isDone}
          />
        );
      case "multiple_choice_question":
        return (
          <MultipleChoiceQuestion
            question={question}
            author={author}
            onAnswerChange={onAnswerChange}
            answer={answer}
            isDone={isDone}
          />
        );
      case "order_question":
        return (
          <OrderQuestion
            question={question}
            author={author}
            onAnswerChange={onAnswerChange}
            answer={answer}
            isDone={isDone}
          />
        );
      case "single_choice_question":
        return (
          <SingleChoiceQuestion
            question={question}
            author={author}
            onAnswerChange={onAnswerChange}
            answer={answer}
            isDone={isDone}
          />
        );
      case "match_choice_question":
        return (
          <MatchQuestion
            question={question}
            author={author}
            onAnswerChange={onAnswerChange}
            answer={answer}
            isDone={isDone}
          />
        );
      default:
        return (
          <div className="text-center text-red-500">
            Unsupported question type
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto my-4">
      <div className="bg-gray-100 p-4 rounded-lg">{renderQuestion()}</div>
    </div>
  );
};

export default QuestionComponent;
