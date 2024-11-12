import React, { useState, Suspense } from "react";
import DataTable from "react-data-table-component";
import { Button, Input, Space, Typography, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const QuestionTable = ({
  questions,
  isManageTest,
  handleOpenModal,
  handleDelete,
  handleLoadMore,
  onSelect,
  onDeselect,
  listQuestion,
}) => {
  const [searchText, setSearchText] = useState("");

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };
  console.log(questions);
  const columns = [
    {
      name: "Actions",
      maxWidth: "150px",
      cell: (row) => (
        <Space size="small" style={{ justifyContent: "center" }}>
          {isManageTest && (
            <>
              {(() => {
                const isSelected = listQuestion.includes(row._id);
                const selectButtonColor = isSelected ? "#007bff" : "#4CAF50"; // Xanh dương đậm cho "Select", xanh lá cây cho "Deselect"
                const deselectButtonColor = isSelected ? "#dc3545" : "#FF5722"; // Đỏ đậm cho "Deselect", cam cho "Select"

                return (
                  <>
                    <Tooltip title="Select">
                      <Button
                        icon={<CheckCircleOutlined />}
                        onClick={() => onSelect(row._id)}
                        disabled={isSelected}
                        style={{
                          backgroundColor: selectButtonColor,
                          color: "#fff",
                          borderColor: selectButtonColor,
                        }}
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip title="Deselect">
                      <Button
                        icon={<CloseCircleOutlined />}
                        onClick={() => onDeselect(row._id)}
                        disabled={!isSelected}
                        style={{
                          backgroundColor: deselectButtonColor,
                          color: "#fff",
                          borderColor: deselectButtonColor,
                        }}
                        size="small"
                      />
                    </Tooltip>
                  </>
                );
              })()}
            </>
          )}
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleOpenModal(row)}
              style={{
                backgroundColor: "#2196F3",
                color: "#fff",
                borderColor: "#2196F3",
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(row._id)}
              style={{
                backgroundColor: "#F44336",
                color: "#fff",
                borderColor: "#F44336",
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      name: `Total ${questions.length} Question`,
      selector: (row) => row.question_content.text,
      sortable: true,
      cell: (row) => (
        <Tooltip title={row.question_content.text} placement="topLeft">
          <Typography.Text
            ellipsis
            style={{
              maxWidth: "300px",
              fontSize: "14px",
              lineHeight: "1.5",
              padding: "8px",
              backgroundColor: "#f9f9f9",
              borderRadius: "4px",
            }}
          >
            {row.question_content.text}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      width: "120px",
      center: true,
      cell: (row) => {
        const typeStyles = {
          order_question: { backgroundColor: "#ff7043", label: "ORDER" },
          multiple_choice_question: {
            backgroundColor: "#ffb74d",
            label: "MULTIPLE",
          },
          fill_in_the_blank: { backgroundColor: "#42a5f5", label: "FILL" },
          match_choice_question: { backgroundColor: "#66bb6a", label: "MATCH" },
          single_choice_question: {
            backgroundColor: "#ab47bc",
            label: "SINGLE",
          },
        };

        const { backgroundColor, label } = typeStyles[row.type] || {
          backgroundColor: "#e0e0e0",
          label: row.type,
        };

        return (
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "12px",
              fontWeight: "600",
              color: "#ffffff",
              backgroundColor,
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      name: "Tags",
      selector: (row) => row.tags.join(", "),
      sortable: true,
      width: "100px",
      cell: (row) => (
        <Space size="small" style={{ justifyContent: "center" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 8px",
              backgroundColor: "#e3f2fd",
              borderRadius: "4px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {Array.isArray(row.tags) ? row.tags.join(", ") : ""}
          </span>
        </Space>
      ),
      sortFunction: (a, b) => {
        const tagsA = a.tags.join(", ");
        const tagsB = b.tags.join(", ");
        return tagsA.localeCompare(tagsB);
      },
    },
  ];

  const filteredData = questions.filter((item) => {
    return (
      item.question_content.text
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (item.tags &&
        item.tags.join(", ").toLowerCase().includes(searchText.toLowerCase()))
    );
  });

  return (
    <>
      <Input
        placeholder="Search..."
        value={searchText}
        onChange={handleSearch}
        style={{ marginBottom: 16, width: 200 }}
      />
      <Button
        onClick={handleLoadMore}
        style={{
          marginBottom: 16,
          backgroundColor: "#007bff",
          color: "#fff",
        }}
      >
        Load More
      </Button>
      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          responsive
          highlightOnHover
          striped
          noDataComponent="No data available"
          style={{ borderRadius: "8px", overflow: "hidden" }} // Rounded corners for the table
        />
      </Suspense>
    </>
  );
};

export default QuestionTable;
