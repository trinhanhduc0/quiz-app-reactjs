import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTests,
  createTest,
  saveTest,
  deleteTest,
} from "~/redux/test/testSlice";
import dayjs from "dayjs";

import {
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Row,
  Col,
  Table,
  List,
  Select,
  message,
  DatePicker,
  Card,
  Spin,
  Typography,
  InputNumber,
} from "antd";
import { TagsTwoTone, EditTwoTone, DeleteOutlined } from "@ant-design/icons";
import "./ManageTest.scss";
import ManageQuestion from "../ManageQuestion/ManageQuestion";
import { useNavigate } from "react-router-dom";

const { confirm } = Modal;
const { Text } = Typography;

function ManageTest() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allTests, status, error } = useSelector((state) => state.tests);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditQuestion, setIsEditQuestion] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    try {
      await dispatch(fetchTests({ navigate }));
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to fetch data");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = useCallback(
    (testData = null) => {
      setIsEditing(!!testData);
      if (testData) {
        form.setFieldsValue({
          ...testData,
          start_time: dayjs(testData.start_time),
          end_time: dayjs(testData.end_time),
          class_ids: testData.class_ids || [],
        });
        setSelectedQuestions(testData.question_ids || []);
      } else {
        form.resetFields();
        setSelectedQuestions([]);
      }
      setIsModalOpen(true);
    },
    [form]
  );

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (values) => {
      values.question_ids = selectedQuestions;
      const formattedValues = {
        ...values,
        start_time: values.start_time?.toISOString(),
        end_time: values.end_time?.toISOString(),
      };

      try {
        if (isEditing) {
          await dispatch(saveTest({ values: formattedValues }));
          message.success("Test updated successfully!");
        } else {
          await dispatch(createTest({ values: formattedValues }));
          message.success("Test created successfully!");
        }
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error saving test:", error);
        message.error("Error saving test");
      }
    },
    [dispatch, isEditing, selectedQuestions]
  );

  const handleDelete = useCallback(
    (testId) => {
      confirm({
        title: "Are you sure you want to delete this test?",
        content: "This action cannot be undone.",
        okText: "Delete",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await dispatch(deleteTest({ _id: testId }));
            message.success("Test deleted successfully!");
          } catch (error) {
            message.error("Error deleting test!");
          } finally {
            setIsModalOpen(false);
          }
        },
      });
    },
    [dispatch]
  );

  const handleQuestionSelect = useCallback((questionId) => {
    setSelectedQuestions((prev) => [...prev, questionId]);
  }, []);

  const handleQuestionDeselect = useCallback((questionId) => {
    setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));
  }, []);

  const columns = [
    {
      title: (
        <span>
          <TagsTwoTone /> Test Name
        </span>
      ),
      dataIndex: "test_name",
      key: "test_name",
    },
    {
      title: (
        <span>
          <TagsTwoTone /> Tags
        </span>
      ),
      dataIndex: "tags",
      key: "tags",
      render: (tags) =>
        Array.isArray(tags)
          ? tags.map((tag) => (
              <Text className="tag-badge" key={tag}>
                {tag}
              </Text>
            ))
          : "",
    },
    {
      title: (
        <span>
          <EditTwoTone /> Actions
        </span>
      ),
      key: "actions",
      render: (_, record) => (
        <Button
          shape="circle"
          icon={<EditTwoTone />}
          onClick={() => handleOpenModal(record)}
          type="link"
        />
      ),
    },
  ];

  if (status === "loading")
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div className="manage-test-container w-screen">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 border-b-4 border-blue-600 pb-2">
        Manage Tests
      </h2>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Col>
          <Button type="primary" onClick={() => handleOpenModal()}>
            Add Test
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={allTests}
          rowKey={(test) => test._id}
          responsive
          pagination={false}
          onRow={(record) => ({
            onClick: () => handleOpenModal(record),
          })}
          rowClassName="table-row"
          className="w-screen"
        />
      </Card>

      <Modal
        title={isEditing ? "Edit Test" : "Add Test"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {isEditing && (
            <Form.Item name="_id" label="Test ID">
              <Input disabled />
            </Form.Item>
          )}

          <Row>
            <Button onClick={() => setIsEditQuestion((prev) => !prev)}>
              Add Question
            </Button>
          </Row>
          {isEditQuestion && (
            <>
              <ManageQuestion
                isManageTest={isEditQuestion}
                onSelect={handleQuestionSelect}
                onDeselect={handleQuestionDeselect}
                listQuestion={selectedQuestions}
              />
            </>
          )}
          <Form.Item
            name="test_name"
            label="Test Name"
            rules={[{ required: true, message: "Please enter the test name" }]}
          >
            <Input maxLength={51} />
          </Form.Item>

          <Form.Item name="descript" label="Description">
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 10 }} />
          </Form.Item>

          <Form.Item
            name="duration_minutes"
            label="Duration (minutes)"
            rules={[{ required: true, message: "Please enter the duration" }]}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item name="start_time" label="Start Time">
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>

          <Form.Item name="end_time" label="End Time">
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>

          <Form.Item name="is_test" label="Is Test" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item
            name="random"
            label="Randomize Questions"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            rules={[
              { required: true, message: "Please enter at least one tag" },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="e.g., math, science"
            />
          </Form.Item>

          {isEditing && (
            <Button
              style={{
                backgroundColor: "red",
                color: "white",
                marginTop: "15px",
              }}
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(form.getFieldValue("_id"))}
            >
              Delete
            </Button>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default ManageTest;
