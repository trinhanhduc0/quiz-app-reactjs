import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  incrementPage,
} from "~/redux/question/questionSlice";
import {
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Select,
  message,
  Space,
  InputNumber,
  Card,
  Typography,
  Divider,
  Switch,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
  UpOutlined,
  DownOutlined,
  CloseOutlined,
  PlusSquareTwoTone,
} from "@ant-design/icons";

import QuestionTable from "./QuestionTable";
import ImageManage from "~/components/Image/ImageManager";
import { useMediaQuery } from "react-responsive";
import "./ManageQuestion.scss";
import TextArea from "antd/es/input/TextArea";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function ManageQuestion({ isManageTest, onSelect, onDeselect, listQuestion }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { questionsByPage, page, hasMoreQuestions, status, error } =
    useSelector((state) => state.questions);
  const [forceUpdate, setForceUpdate] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalImageOpen, setIsModalImageOpen] = useState(false);
  const [isQuestionImageOpen, setIsQuestionImageOpen] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [form] = Form.useForm();
  useEffect(() => {
    if (hasMoreQuestions && status !== "loading") {
      dispatch(fetchQuestions({ navigate }));
    }
  }, [dispatch, hasMoreQuestions, page]); // Trigger fetch when page or hasMoreQuestions changes

  const handleLoadMore = () => {
    if (hasMoreQuestions && status !== "loading") {
      dispatch(incrementPage()); // Trigger next page fetch
    } else {
      message.success("All Question Uploaded");
    }
  };
  const handleOpenModal = (questionData = null) => {
    setIsEditing(!!questionData);
    setCurrentQuestion(questionData);
    form.setFieldsValue(questionData || {});
    setIsModalOpen(true);
  };

  const handleTypeChange = (value) => {
    const typeSpecificFields = {
      single_choice_question: {
        options: [{ text: "", imageurl: "", iscorrect: false }],
      },
      multiple_choice_question: {
        options: [{ text: "", imageurl: "", iscorrect: false }],
      },
      match_choice_question: {
        options: [{ text: "", match: "" }],
      },
      order_question: { options: [{ text: "", order: 1 }] },
      fill_in_the_blank: {
        fill_in_the_blank: [
          {
            text_before: "",
            blank: "_____",
            text_after: "",
            correct_answer: "",
          },
        ],
      },
      file_upload_question: {},
    };

    form.setFieldsValue({
      options: [],
      fill_in_the_blank: [],
      ...typeSpecificFields[value],
    });

    setForceUpdate((prev) => prev + 1);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentQuestion(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const action = isEditing
        ? updateQuestion({ ...values, _id: currentQuestion._id })
        : createQuestion(values);
      await dispatch(action);
      message.success(
        `Question ${isEditing ? "updated" : "created"} successfully!`
      );
      setIsModalOpen(false);
      //dispatch(fetchQuestions());
      setCurrentQuestion(null);
    } catch (error) {
      console.error("Error saving question:", error);
      message.error("Error saving question");
    }
  };

  const handleDelete = async (questionId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this question?",
      content: "This action cannot be undone.",
      okText: "Delete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await dispatch(deleteQuestion(questionId));
          message.success("Question deleted successfully!");
        } catch (error) {
          message.error("Error deleting question!", error);
        }
      },
    });
  };

  if (status === "loading")
    return <div className="loading-spinner">Loading...</div>;
  if (status === "failed")
    return <div className="error-message">Error: {error}</div>;

  return (
    <div className="manage-question-container">
      <Card>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 border-b-4 border-blue-600 pb-2">
          Manage Question
        </h2>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <Button
              size={"large"}
              shape="default"
              icon={<PlusSquareTwoTone />}
              onClick={() => handleOpenModal()}
            />
          </Col>
        </Row>
        {questionsByPage && (
          <QuestionTable
            questions={Object.values(questionsByPage).flat()}
            isManageTest={isManageTest}
            handleOpenModal={handleOpenModal}
            handleDelete={handleDelete}
            handleLoadMore={handleLoadMore}
            onSelect={onSelect}
            onDeselect={onDeselect}
            listQuestion={listQuestion}
            isMobile={isMobile}
          />
        )}
      </Card>
      <Modal
        title={
          <Title level={3} style={{ color: "#1890ff" }}>
            {isEditing ? "Edit Question" : "Add Question"}
          </Title>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={isMobile ? "90vw" : isTablet ? "80%" : "60%"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Question content - Text */}
          <Form.Item
            name={["question_content", "text"]}
            label="Question Text"
            rules={[
              { required: true, message: "Please enter the question text" },
            ]}
          >
            <Input.TextArea rows={4} style={{ borderColor: "#91d5ff" }} />
          </Form.Item>

          {(form.getFieldValue("type") === "single_choice_question" ||
            form.getFieldValue("type") === "multiple_choice_question") && (
            <>
              <Form.Item name={["question_content", "image_url"]}>
                <Input
                  placeholder="Upload Question Image"
                  disabled
                  value={form.getFieldValue(["question_content", "image_url"])}
                  addonAfter={
                    <Button
                      type="text"
                      icon={<CloseOutlined />}
                      onClick={() =>
                        form.setFieldsValue({
                          question_content: { image_url: "" },
                        })
                      }
                    />
                  }
                  style={{ borderColor: "#91d5ff", width: "200px" }}
                />
              </Form.Item>

              <ImageManage
                isOpen={isModalImageOpen}
                onClose={() => setIsModalImageOpen(false)}
                onSelectImage={(fileName) => {
                  form.setFieldsValue({
                    question_content: { image_url: fileName },
                  });
                  setIsModalImageOpen(false);
                  setForceUpdate((prev) => prev + 1);
                }}
              />

              <Button
                onClick={() => setIsModalImageOpen(true)}
                icon={<UploadOutlined />}
                style={{
                  marginBottom: 16,
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                }}
              >
                Upload Question Image
              </Button>
            </>
          )}

          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="type"
                label="Question Type"
                rules={[
                  {
                    required: true,
                    message: "Please select the question type",
                  },
                ]}
              >
                <Select
                  defaultValue={null}
                  onChange={handleTypeChange}
                  placeholder="Select question type"
                  allowClear
                  style={{ borderColor: "#91d5ff" }}
                >
                  <Select.Option value="single_choice_question">
                    Single Choice
                  </Select.Option>
                  <Select.Option value="multiple_choice_question">
                    Multiple Choice
                  </Select.Option>
                  <Select.Option value="match_choice_question">
                    Matching
                  </Select.Option>
                  <Select.Option value="order_question">Ordering</Select.Option>
                  <Select.Option value="fill_in_the_blank">
                    Fill in the Blank
                  </Select.Option>
                  <Select.Option value="file_upload_question">
                    File Upload
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="tags"
                label="Tags"
                rules={[
                  { required: true, message: "Please enter at least one tag" },
                ]}
              >
                <Select
                  mode="tags"
                  style={{ width: "100%", borderColor: "#91d5ff" }}
                  placeholder="e.g., B1, B2"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="score"
                label="Score"
                rules={[
                  {
                    required: true,
                    type: "number",
                    message: "Please enter the score",
                  },
                  {
                    type: "number",
                    min: 0,
                    message: "Score must be a positive number",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%", borderColor: "#91d5ff" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="center" style={{ color: "#7cb305" }}>
            Question Options
          </Divider>
          {form.getFieldValue("type") === "fill_in_the_blank" && (
            <Form.List name="fill_in_the_blank">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      style={{ marginBottom: 16, borderColor: "#91d5ff" }}
                    >
                      <Space
                        direction={isMobile ? "vertical" : "horizontal"}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "text_before"]}
                          rules={[
                            { required: true, message: "Missing text before" },
                          ]}
                        >
                          <Input
                            maxLength={200}
                            placeholder="Text before blank"
                            style={{ borderColor: "#91d5ff" }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "blank"]}
                          rules={[{ required: true, message: "Missing blank" }]}
                        >
                          <Input
                            maxLength={30}
                            placeholder="Blank (e.g., _____)"
                            style={{ borderColor: "#91d5ff" }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "text_after"]}
                          rules={[
                            { required: true, message: "Missing text after" },
                          ]}
                        >
                          <Input
                            maxLength={200}
                            placeholder="Text after blank"
                            style={{ borderColor: "#91d5ff" }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "correct_answer"]}
                          rules={[
                            {
                              required: true,
                              message: "Missing correct answer",
                            },
                          ]}
                        >
                          <Input
                            maxLength={30}
                            placeholder="Correct answer"
                            style={{ borderColor: "#91d5ff" }}
                          />
                        </Form.Item>
                        <Button
                          onClick={() => remove(name)}
                          icon={<MinusCircleOutlined />}
                          danger
                        >
                          Remove
                        </Button>
                      </Space>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{ borderColor: "#91d5ff" }}
                    >
                      Add Blank
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}
          {(form.getFieldValue("type") === "single_choice_question" ||
            form.getFieldValue("type") === "multiple_choice_question") && (
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      style={{ marginBottom: 16, borderColor: "#91d5ff" }}
                    >
                      <Divider style={{ borderColor: "#7cb305" }}>
                        Option {`${key + 1}`}
                      </Divider>
                      <Form.Item
                        {...restField}
                        name={[name, "text"]}
                        rules={[
                          { required: true, message: "Missing option text" },
                        ]}
                      >
                        <TextArea
                          placeholder="Option text"
                          style={{ borderColor: "#91d5ff" }}
                        />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, "imageurl"]}>
                        <Input
                          placeholder="Image URL"
                          readOnly
                          addonAfter={
                            <Button
                              type="text"
                              icon={<CloseOutlined />}
                              onClick={() => {
                                const options = form.getFieldValue("options");
                                options[index].imageurl = "";
                                form.setFieldsValue({ options });
                              }}
                            />
                          }
                          style={{ borderColor: "#91d5ff" }}
                        />
                      </Form.Item>

                      <Button
                        onClick={() => setIsQuestionImageOpen(index)}
                        icon={<UploadOutlined />}
                        style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                      >
                        Upload Option Image
                      </Button>

                      <ImageManage
                        isOpen={isQuestionImageOpen === index}
                        onClose={() => setIsQuestionImageOpen(null)}
                        onSelectImage={(fileName) => {
                          const options = form.getFieldValue("options");
                          options[index].imageurl = fileName;
                          form.setFieldsValue({ options });
                          setIsQuestionImageOpen(null);
                          setForceUpdate((prev) => prev + 1);
                        }}
                      />

                      <Form.Item
                        {...restField}
                        name={[name, "iscorrect"]}
                        valuePropName="checked"
                        label={<Typography>Correct</Typography>}
                      >
                        <Switch />
                      </Form.Item>

                      <Button
                        onClick={() => remove(name)}
                        icon={<MinusCircleOutlined />}
                        danger
                      >
                        Remove
                      </Button>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{ borderColor: "#91d5ff" }}
                    >
                      Add Option
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}
          {form.getFieldValue("type") === "order_question" && (
            <Form.List name="options">
              {(fields, { add, remove }) => {
                const handleMove = (fromIndex, toIndex) => {
                  if (toIndex < 0 || toIndex >= fields.length) return;

                  const values = form.getFieldValue("options") || [];
                  const itemToMove = values[fromIndex];

                  values.splice(fromIndex, 1);
                  values.splice(toIndex, 0, itemToMove);

                  form.setFieldsValue({ options: values });
                };

                return (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        style={{ marginBottom: 16, borderColor: "#91d5ff" }}
                      >
                        <Divider style={{ borderColor: "#7cb305" }}>
                          Option {index + 1}
                        </Divider>
                        <Form.Item
                          {...restField}
                          name={[name, "text"]}
                          rules={[
                            { required: true, message: "Missing option text" },
                          ]}
                        >
                          <TextArea
                            placeholder="Option text"
                            style={{ borderColor: "#91d5ff" }}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "order"]}
                          initialValue={index + 1}
                        ></Form.Item>
                        <Button.Group style={{ marginTop: 8 }}>
                          <Button
                            onClick={() => handleMove(index, index - 1)}
                            disabled={index === 0}
                            icon={<UpOutlined />}
                          >
                            Up
                          </Button>
                          <Button
                            onClick={() => handleMove(index, index + 1)}
                            disabled={index === fields.length - 1}
                            icon={<DownOutlined />}
                          >
                            Down
                          </Button>
                        </Button.Group>
                        <Button
                          onClick={() => remove(name)}
                          icon={<MinusCircleOutlined />}
                          danger
                          style={{ marginTop: 8, marginLeft: 8 }}
                        >
                          Remove
                        </Button>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                        style={{ borderColor: "#91d5ff" }}
                      >
                        Add Option
                      </Button>
                    </Form.Item>
                  </>
                );
              }}
            </Form.List>
          )}
          {form.getFieldValue("type") === "match_choice_question" && (
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      style={{ marginBottom: 16, borderColor: "#91d5ff" }}
                    >
                      <Divider style={{ borderColor: "#7cb305" }}>
                        Option {index + 1}
                      </Divider>
                      <Form.Item
                        {...restField}
                        name={[name, "text"]}
                        rules={[
                          { required: true, message: "Missing option text" },
                        ]}
                      >
                        <TextArea
                          placeholder="Option text"
                          style={{ borderColor: "#91d5ff" }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "match"]}
                        rules={[{ required: true, message: "Missing match" }]}
                      >
                        <Input
                          placeholder="Match"
                          style={{ borderColor: "#91d5ff" }}
                        />
                      </Form.Item>
                      <Button
                        onClick={() => remove(name)}
                        icon={<Minus CircleOutlined />}
                        danger
                      >
                        Remove
                      </Button>
                    </Card>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{ borderColor: "#91d5ff" }}
                    >
                      Add Option
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          )}
          {form.getFieldValue("type") === "file_upload_question" && (
            <h1 style={{ color: "#ff4d4f" }}>COMING SOON</h1>
          )}
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: "#4CAF50", color: "#fff" }}
              >
                {isEditing ? "Update" : "Create"} Question
              </Button>
              <Button
                onClick={handleCancel}
                style={{ backgroundColor: "#f5222d", color: "#fff" }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageQuestion;
