import React, { useEffect, useState } from "react";
import { Modal, List, Button, message, Upload } from "antd";
import { apiCallGet, apiUploadImage } from "~/services/apiCallService";

import API_ENDPOINTS from "~/config/config";
import ComponentImage from "~/components/OptionImage/ComponentImage";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
function ImageManage({ isOpen, onClose, onSelectImage }) {
  const [listImage, setListImage] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    if (isOpen) {
      fetchListImage();
    }
  }, [isOpen]);

  const fetchListImage = async () => {
    try {
      setLoading(true);
      const res = await apiCallGet(API_ENDPOINTS.GETIMAGEFILES, navigate);
      setListImage(res || []);
    } catch (error) {
      message.error("Failed to fetch images.");
    } finally {
      setLoading(false);
    }
  };
  const handleUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiUploadImage(
        API_ENDPOINTS.UPLOAD_IMAGE,
        formData,
        navigate
      );
      if (res.ok) {
        const responseText = await res.text();
        message.success(responseText || "Image uploaded successfully");
        await fetchListImage();
        onSuccess(responseText);
      } else {
        const errorText = await res.text();
        throw new Error(errorText || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      message.error(error.message || "Failed to upload image");
      onError(error);
    }
  };

  const handleImageSelect = (imageUrl) => {
    onSelectImage(imageUrl);
    onClose();
  };

  return (
    <Modal title="Manage Images" open={isOpen} onCancel={onClose} footer={null}>
      <Upload
        name="file"
        customRequest={handleUpload}
        showUploadList={false}
        onChange={(info) => {
          if (info.file.status === "done") {
            message.success(`${info.file.name} file uploaded successfully`);
          } else if (info.file.status === "error") {
            message.error(`${info.file.name} file upload failed.`);
          }
        }}
      >
        <Button icon={<UploadOutlined />}>Upload Image</Button>
      </Upload>
      {loading ? (
        <p>Loading images...</p>
      ) : (
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={listImage}
          renderItem={(item) => (
            <List.Item>
              <div
                onClick={() => handleImageSelect(item.filename)}
                style={{ textAlign: "center", cursor: "pointer" }}
              >
                <ComponentImage width={80} content={item.content} />
              </div>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}

export default ImageManage;
