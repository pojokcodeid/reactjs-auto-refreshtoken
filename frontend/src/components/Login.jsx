// src/components/Login.js
import { useState } from "react";
import api from "../axiosConfig";
import secureStorage from "react-secure-storage";

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/login", credentials);
      const { accessToken, refreshToken } = response.data;
      secureStorage.setItem("accessToken", accessToken);
      secureStorage.setItem("refreshToken", refreshToken);
      onLogin();
    } catch (err) {
      setError("Login failed. Please check your credentials.", err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

Login.propTypes = {
  onLogin: () => {},
};

export default Login;
