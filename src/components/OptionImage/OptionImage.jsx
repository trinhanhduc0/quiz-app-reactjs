import React, { useState, useEffect } from "react";
import API_ENDPOINTS from "~/config/config";
import TokenService from "~/services/TokenService";
import Image from "./Image";
import { useNavigate } from "react-router-dom";
const OptionImage = ({ imageUrl, email, width = 200, height = "auto" }) => {
  const [imageSrc, setImageSrc] = useState();
  const navigate = useNavigate();

  const fetchImage = async () => {
    try {
      // Kiểm tra nếu hình ảnh đã được lưu trữ trong sessionStorage
      const cachedImage = sessionStorage.getItem(imageUrl);
      if (cachedImage) {
        setImageSrc(cachedImage);
        return;
      }

      // Nếu chưa có trong cache, thực hiện yêu cầu lấy hình ảnh từ server
      const response = await fetch(API_ENDPOINTS.IMAGE, {
        method: "POST",
        headers: {
          Authorization: TokenService.getToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          filename: imageUrl,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 && navigate) {
          navigate("/login");
        }
        throw new Error("Failed to fetch image");
      }

      const blob = await response.blob();

      // Convert the blob to a base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        // Store the base64 string in sessionStorage
        sessionStorage.setItem(imageUrl, base64data);
        setImageSrc(base64data);
      };
      reader.readAsDataURL(blob); // Start reading the blob as data URL
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  // Ensure fetchImage is called within a useEffect hook if it's within a component
  useEffect(() => {
    if (imageUrl && email) {
      fetchImage();
    }
  }, [imageUrl, email]);

  useEffect(() => {
    if (imageUrl && email) {
      fetchImage();
    }
  }, [imageUrl, email]);

  return imageSrc ? (
    <Image src={imageSrc} width={width} height={height} />
  ) : (
    <p>Loading image...</p>
  );
};

export default OptionImage;
