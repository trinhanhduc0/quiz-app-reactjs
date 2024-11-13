import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
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
  Divider,
  Tooltip,
  Typography,
} from "antd";
import {
  PlusSquareTwoTone,
  EditTwoTone,
  DeleteOutlined,
  TagsTwoTone,
  RollbackOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  fetchClasses,
  createClass,
  saveClass,
  deleteClass,
  createCode,
} from "~/redux/class/classSlice";
import { apiCallGet } from "~/services/apiCallService";
import {
  getCookieValue,
  setCookieWithExpiry,
  isCookieExpired,
} from "~/services/cookieHelper";
import API_ENDPOINTS from "~/config/config";
import "./ManageClass.scss";
const { Option } = Select;
const { Text } = Typography;

const ClassCodeComponent = ({ _id, test_id, createCode }) => {
  const [cookies, setCookie] = useCookies(["classIds"]);
  const [classCode, setClassCode] = useState(null);
  const [expiryMinutes, setExpiryMinutes] = useState(5); // Default 5 minutes
  const [expiresAt, setExpiresAt] = useState(null); // State for expiresAt

  const handleGenerateCode = useCallback(
    async (classID) => {
      try {
        const response = await createCode(classID, expiryMinutes, test_id);
        const code = response.payload;
        message.success(`Class code generated: ${code}`);
        setClassCode(code);
        const expirationTime = new Date(
          new Date().getTime() + expiryMinutes * 60000
        );
        setExpiresAt(expirationTime);
        return code;
      } catch (error) {
        console.error("Error generating class code:", error);
        message.error("Failed to generate class code.");
        return null;
      }
    },
    [cookies, createCode, expiryMinutes]
  );

  useEffect(() => {
    const classIds = getCookieValue(cookies, "classIds") || [];
    const currentClassEntry = classIds.find(
      (item) => Object.keys(item)[0] === _id
    );

    if (currentClassEntry) {
      const { code, expiresAt } = currentClassEntry[_id];
      if (isCookieExpired(new Date(expiresAt))) {
        message.warning("Class code has expired. Please generate a new one.");
        const updatedClassIds = classIds.filter(
          (item) => Object.keys(item)[0] !== _id
        );
        setCookieWithExpiry(setCookie, "classIds", updatedClassIds);
      } else {
        setClassCode(code);
        setExpiresAt(new Date(expiresAt));
      }
    }
  }, [_id, cookies, setCookie]);

  const generateCodeAndSaveToCookie = useCallback(async () => {
    const code = await handleGenerateCode(_id);
    if (code) {
      const newCodeEntry = {
        [_id]: {
          code,
          expiresAt: new Date(new Date().getTime() + expiryMinutes * 60000),
        },
      };
      let updatedClassIds = getCookieValue(cookies, "classIds") || [];
      const existingIndex = updatedClassIds.findIndex(
        (item) => Object.keys(item)[0] === _id
      );

      if (existingIndex > -1) {
        updatedClassIds[existingIndex] = newCodeEntry;
      } else {
        updatedClassIds.push(newCodeEntry);
      }

      setCookieWithExpiry(setCookie, "classIds", updatedClassIds);
    }
  }, [_id, cookies, handleGenerateCode, setCookie, expiryMinutes]);

  return (
    <div className="container">
      <div className="header">Class Code</div>
      {classCode ? (
        <>
          <div className="input-container">
            <Input readOnly value={classCode || "No code generated"} />
          </div>
          {expiresAt && (
            <div className="expiry-info">
              Expires at: {expiresAt.toLocaleString()}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="select-container">
            <Select
              defaultValue={expiryMinutes}
              style={{ width: "70%" }}
              onChange={(value) => setExpiryMinutes(value)}
            >
              <Option value={1}>1 minute</Option>
              <Option value={5}>5 minutes</Option>
              <Option value={10}>10 minutes</Option>
            </Select>
            <Button className="button" onClick={generateCodeAndSaveToCookie}>
              Generate
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

function ManageClass() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [, forceUpdate] = useState({});
  const { allClass, status, error } = useSelector((state) => state.classes);
  const [newStudent, setNewStudent] = useState("");
  const [allTest, setAllTest] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchClasses());
    fetchTests();
  }, []);

  const tagValidator = (_, value) => {
    if (value && value.length > 5) {
      return Promise.reject(new Error("You can only add up to 5 tags"));
    }
    return Promise.resolve();
  };

  const fetchTests = useCallback(async () => {
    try {
      const res = await apiCallGet(API_ENDPOINTS.TESTS, navigate);
      setAllTest(res || res.data);
    } catch (err) {
      console.error("Failed to fetch tests:", err);
    }
  }, []);

  const handleCreateCode = useCallback(async (_id, minute, test_id) => {
    return await dispatch(createCode({ _id, minute, test_id }));
  }, []);

  const handleAddClass = useCallback(() => {
    setIsEditing(false);
    form.resetFields();
    setIsModalOpen(true);
  }, []);

  const handleEditClass = useCallback((classData) => {
    setIsEditing(true);
    form.setFieldsValue({
      ...classData,
      test_id: classData.test_id || [],
      students_accept: classData.students_accept || [],
      students_wait: classData.students_wait || [],
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    async (values) => {
      try {
        const action = isEditing ? saveClass : createClass;
        const messageText = isEditing
          ? "Class updated successfully!"
          : "Class created successfully!";

        await dispatch(action({ values }));
        message.success(messageText);

        setIsModalOpen(false);
      } catch (error) {
        console.error("Error saving class:", error);
        message.error("Error saving class");
      }
    },
    [isEditing]
  );

  const handleDelete = useCallback((values) => {
    Modal.confirm({
      title: "Are you sure you want to delete this class?",
      content: "This action cannot be undone.",
      okText: "Delete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await dispatch(deleteClass(values));
          message.success("Class deleted successfully!");
        } catch (error) {
          message.error("Error deleting class!");
        } finally {
          setIsModalOpen(false);
        }
      },
    });
  }, []);

  const updateStudentList = useCallback((email, fromList, toList) => {
    const prevValues = form.getFieldsValue();
    const updatedFrom = (prevValues[fromList] || []).filter((e) => e !== email);
    const updatedTo = [...(prevValues[toList] || []), email].filter(
      (e, i, arr) => arr.indexOf(e) === i
    );

    form.setFieldsValue({
      ...prevValues,
      [fromList]: updatedFrom,
      [toList]: updatedTo,
    });
    forceUpdate({});
  }, []);

  const handleApproveStudent = useCallback((email) => {
    updateStudentList(email, "students_wait", "students_accept");
  }, []);

  const handleRemoveAcceptedStudent = useCallback((email) => {
    updateStudentList(email, "students_accept", "students_wait");
  }, []);

  const handleAddStudent = useCallback(() => {
    const email = newStudent.trim();
    if (email) {
      const prevValues = form.getFieldsValue();
      const currentAccept = prevValues.students_accept || [];

      if (!currentAccept.includes(email)) {
        form.setFieldsValue({
          ...prevValues,
          students_accept: [...currentAccept, email],
        });
        setNewStudent("");
      } else {
        message.warning("Student already exists in the accepted list.");
      }
    }
  }, [newStudent]);

  const columns = useMemo(
    () => [
      {
        title: "Class Name",
        dataIndex: "class_name",
        key: "class_name",
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
          tags.map((tag) => <Text className="tag-badge">{tag}</Text>),
      },
      {
        title: (
          <span>
            <EditTwoTone /> Actions
          </span>
        ),
        key: "actions",
        render: (_, record) => (
          <>
            <Button
              shape="circle"
              icon={<EditTwoTone />}
              onClick={() => handleEditClass(record)}
            />
          </>
        ),
      },
    ],
    [handleEditClass]
  );

  if (status === "loading") return <p>Loading...</p>;
  if (status === "failed") return <p>Error: {error}</p>;

  return (
    <div className="manage-class-container">
      <h2 className="text-2xl font-semibold text-gray-800 text-center border-b-2 border-indigo-500 pb-2">
        Manage Class
      </h2>
      <Row>
        <Col>
          <Button
            size={"large"}
            shape="default"
            icon={<PlusSquareTwoTone />}
            onClick={() => handleAddClass()}
          />
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={allClass}
        rowKey={(cls) => cls._id}
        pagination={false}
        scroll={{ x: true }}
      />
      <Modal
        title={
          <div
            style={{
              backgroundColor: "#f0f2f5",
              padding: "10px",
              borderRadius: "5px",
              marginTop: "20px",
            }}
          >
            {isEditing ? "Edit Class" : "Add Class"}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            <RollbackOutlined />
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            <CheckOutlined />
          </Button>,
          isEditing && (
            <Tooltip title="Delete">
              <Button
                danger
                shape="round"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete({ _id: form.getFieldValue("_id") })}
              />
            </Tooltip>
          ),
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {isEditing && (
            <>
              <Form.Item name="_id" className="hidden">
                <Input />
              </Form.Item>
              <ClassCodeComponent
                _id={form.getFieldValue("_id")}
                createCode={handleCreateCode}
                test_id={form.getFieldValue("test_id")}
              />
            </>
          )}

          <Divider orientation="left">Class Details</Divider>
          <Form.Item
            name="class_name"
            label="Class Name"
            rules={[{ required: true }, { max: 30 }]}
          >
            <Input placeholder="Enter class name" style={{ height: "40px" }} />
          </Form.Item>

          <Form.Item name="is_public" label="Public">
            <Switch />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            rules={[
              { required: true, message: "Please enter at least one tag" },
              { validator: tagValidator }, // Use the defined validator here
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="e.g., math, science"
              maxTagCount={5}
              onChange={(value) => {
                if (value.length > 5) {
                  // Limit tags if user adds more than 5
                  value = value.slice(0, 5);
                }
              }}
            />
          </Form.Item>
          <Divider orientation="left">Tests</Divider>
          <Form.Item name="test_id" label="List Test">
            <Select
              mode="multiple"
              placeholder="Select tests"
              options={allTest.map((test) => ({
                label: test.test_name,
                value: test._id,
              }))}
            />
          </Form.Item>
          <Divider orientation="left">Students</Divider>

          <Form.Item name="students_accept" label="Accepted Students">
            <List
              dataSource={form.getFieldValue("students_accept")}
              renderItem={(email) => (
                <List.Item>
                  {email}
                  <Button
                    type="link"
                    onClick={() => handleRemoveAcceptedStudent(email)}
                  >
                    Remove
                  </Button>
                </List.Item>
              )}
            />
            <Input.Group compact>
              <Input
                placeholder="Enter email"
                value={newStudent}
                onChange={(e) => setNewStudent(e.target.value)}
                style={{ width: "70%" }}
              />
              <Button
                type="primary"
                onClick={handleAddStudent}
                disabled={!newStudent}
              >
                Add
              </Button>
            </Input.Group>
          </Form.Item>

          <Form.Item name="students_wait" label="Waiting Students">
            <List
              dataSource={form.getFieldValue("students_wait")}
              renderItem={(email) => (
                <List.Item>
                  {email}
                  <Button
                    type="link"
                    onClick={() => handleApproveStudent(email)}
                  >
                    Approve
                  </Button>
                </List.Item>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageClass;
