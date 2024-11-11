import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const OrderQuestion = ({ question, onAnswerChange, answer, isDone }) => {
  const [items, setItems] = useState(() => {
    const initialItems = question.options.map((item) => ({
      id: item.id,
      text: item.text,
      imageurl: item.imageurl,
    }));

    if (answer && answer.options) {
      const answerIds = answer.options.map((option) => option.id);
      return initialItems.sort(
        (a, b) => answerIds.indexOf(a.id) - answerIds.indexOf(b.id)
      );
    }

    return initialItems;
  });

  const onDragEnd = (result) => {
    if (!result.destination || isDone) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);

    onAnswerChange(question._id, {
      type: "order_question",
      options: newItems.map((item) => ({ id: item.id })),
    });
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Câu hỏi: {question.question_content.text}
      </h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="order-list space-y-2 lg:space-y-4 xl:space-y-8 mx-4 lg:mx-8 xl:mx-12"
            >
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`draggable-item p-4 md:p-6 lg:p-8 xl:p-10 bg-gray-100 rounded-lg shadow-md cursor-grab 
                      ${snapshot.isDragging ? "bg-purple-600 text-white" : ""}
                    `}
                    >
                      <div className="item-content flex items-center justify-between text-base md:text-lg lg:text-xl">
                        <span className="item-text font-large">
                          {item.text}
                        </span>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default OrderQuestion;
