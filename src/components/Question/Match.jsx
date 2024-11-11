import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./Match.scss";

const MatchQuestion = ({
  question,
  author,
  onAnswerChange,
  answer,
  isDone,
}) => {
  const [matchItems, setMatchItems] = useState(() => {
    const initialItems = question.options.map((item) => ({
      id: item.id,
      matchid: item.matchid,
      content: item.match || item,
      imageUrl: item.imageurl,
    }));

    if (answer && answer.options) {
      const answerIds = answer.options.map((option) => option.id);
      return initialItems.sort(
        (a, b) => answerIds.indexOf(a.id) - answerIds.indexOf(b.id)
      );
    }

    return initialItems;
  });

  const textItems = question.options.map((item) => ({
    id: item.id,
    content: item.text || item,
    imageUrl: item.image_url,
  }));
  const onDragEnd = (result) => {
    if (!result.destination || isDone) return;

    const updatedItems = Array.from(matchItems);

    // Swap the items at the source and destination indexes
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    const temp = updatedItems[sourceIndex];
    updatedItems[sourceIndex] = updatedItems[destinationIndex];
    updatedItems[destinationIndex] = temp;

    setMatchItems(updatedItems);

    // Update the matched pairs after the swap
    const matchedPairs = updatedItems.map((item) => ({
      id: item.id,
      matchid: item.matchid,
    }));

    onAnswerChange(question._id, {
      type: "match_choice_question",
      options: matchedPairs,
    });
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
        Câu hỏi: {question.question_content.text}
      </h2>
      <div className="match-question-container flex flex-col md:flex-row p-4 md:p-6 lg:p-8 bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="match-lists-container flex flex-row gap-4 md:gap-6 w-full overflow-x-auto flex-nowrap">
          <ul className="text-list flex-1 min-w-0 md:w-[45%] space-y-2 overflow-hidden">
            {textItems.map((item) => (
              <li
                key={item.id}
                className="text-item p-3 md:p-4 bg-gray-50 rounded-md shadow-md text-center"
              >
                <span className="text-sm md:text-base lg:text-lg text-wrap font-semibold">
                  {item.content}
                </span>
                {item.imageUrl && item.imageUrl !== "#" && (
                  <OptionImage
                    imageUrl={item.imageUrl}
                    author={author}
                    className="mt-2"
                  />
                )}
              </li>
            ))}
          </ul>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="match-list">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="match-list flex-1 min-w-0 md:w-[45%] space-y-2 bg-gray-100 rounded-md shadow-inner overflow-hidden"
                >
                  {matchItems.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`match-item p-3 md:p-4 bg-purple-100 rounded-md shadow-md text-center ${
                            snapshot.isDragging
                              ? "dragging bg-purple-600 scale-105 shadow-lg"
                              : ""
                          }`}
                        >
                          <span className="text-sm md:text-base lg:text-lg  text-wrap font-semibold">
                            {item.content}
                          </span>
                          {item.imageUrl && item.imageUrl !== "#" && (
                            <OptionImage
                              imageUrl={item.imageUrl}
                              author={author}
                              className="mt-2"
                            />
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </>
  );
};

export default MatchQuestion;
