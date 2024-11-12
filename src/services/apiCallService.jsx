import { useNavigate } from 'react-router-dom';
import TokenService from "~/services/TokenService";

// Custom hook để gọi API
export const useApiCall = () => {
  const navigate = useNavigate();

  const apiCallGet = async (endpoint) => {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: TokenService.getToken(),
      },
    });
    
    console.log(response);
    
    if (!response.ok) {
      if (response.status === 401) {
        navigate('/login'); // Điều hướng tới login nếu token hết hạn
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  const apiCall = async (endpoint, method, body) => {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: TokenService.getToken(),
      },
      body: JSON.stringify(body),
    });
    
    console.log(response);
    
    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    }
    return response.json();
  };

  const apiUploadImage = async (endpoint, formData) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: TokenService.getToken(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Upload error response:", errorBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  };

  return { apiCallGet, apiCall, apiUploadImage };
};
