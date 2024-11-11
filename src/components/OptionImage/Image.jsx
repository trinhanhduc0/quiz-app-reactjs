import React from "react";
import {
  DownloadOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { Image, Space } from "antd";

const onDownload = (imgUrl) => {
  fetch(imgUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "image.png";
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
    });
};

const ImageComponent = ({ src, width }) => (
  <Image
    style={{ borderRadius: "10%" }}
    width={width}
    height={"100%"}
    src={src}
    preview={{
      toolbarRender: (
        _,
        {
          image: { url },
          transform: { scale },
          actions: {
            onFlipY,
            onFlipX,
            onRotateLeft,
            onRotateRight,
            onZoomOut,
            onZoomIn,
            onReset,
          },
        }
      ) => (
        <Space size={12} className="toolbar-wrapper">
          <DownloadOutlined onClick={() => onDownload(url)} />
          <SwapOutlined rotate={90} onClick={onFlipY} />
          <SwapOutlined onClick={onFlipX} />
          <RotateLeftOutlined onClick={onRotateLeft} />
          <RotateRightOutlined onClick={onRotateRight} />
          <ZoomOutOutlined disabled={scale <= 0.5} onClick={onZoomOut} />
          <ZoomInOutlined disabled={scale >= 5} onClick={onZoomIn} />
          <UndoOutlined onClick={onReset} />
        </Space>
      ),
    }}
  />
);

export default ImageComponent;
