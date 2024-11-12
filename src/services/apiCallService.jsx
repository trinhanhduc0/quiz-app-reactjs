import TokenService from "~/services/TokenService";

// Utility function for GET API calls
export const apiCallGet = async (endpoint, navigate) => {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: TokenService.getToken(),
    },
  });
  if (!response.ok) {
    if (response.status === 401 && navigate) {
      navigate("/login"); // Redirect to login if unauthorized
    }
  }
  return response.json();
};

// Utility function for general API calls
export const apiCall = async (endpoint, method, body, navigate) => {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: TokenService.getToken(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401 && navigate) {
      navigate("/login");
    }
    return response;
  }
  console.log(response);

  return response.json();
};

// Utility function for uploading images
export const apiUploadImage = async (endpoint, formData, navigate) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: TokenService.getToken(),
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401 && navigate) {
      navigate("/login");
    }
    const errorBody = await response.text();
    console.error("Upload error response:", errorBody);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};
