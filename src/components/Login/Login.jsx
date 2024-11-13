import React, { useState, useEffect } from "react";
import { auth, googleProvider } from "~/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import "./Login.scss";
import TokenService from "~/services/TokenService";
import API_ENDPOINTS from "~/config/config";
import { useTranslation } from "react-i18next";
import { FcGoogle } from "react-icons/fc"; // Import Google icon

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in with email and password", error);
    }
  };

  const SignInWithGoogle = () => {
    const signInWithGoogle = async () => {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const idToken = await user.getIdToken();
        const response = await fetch(
          API_ENDPOINTS.GOOGLE_LOGIN,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: idToken }),
          },
          navigate
        );
        const data = await response.json();
        await TokenService.saveToken(data.token);
        navigate("/dashboard");
        window.location.reload();
      } catch (error) {
        console.error("Error:", error);
      }
    };

    return (
      <button className="google-btn btn-login" onClick={signInWithGoogle}>
        <FcGoogle size={24} style={{ marginRight: "8px" }} />
        {t("login.googleLoginButton")}
      </button>
    );
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleEmailLogin}>
        <input
          className="input-login"
          type="email"
          placeholder={t("login.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-login"
          type="password"
          placeholder={t("login.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn-login" type="submit">
          {t("login.loginButton")}
        </button>
      </form>
      <SignInWithGoogle />
    </div>
  );
};

export default Login;
