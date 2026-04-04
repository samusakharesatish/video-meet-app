import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: "http://localhost:8080/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // REGISTER
  const handleRegister = async (name, username, password) => {
    try {
      const request = await client.post("/register", {
        name: name,
        username: username,
        password: password,
      });

      if (request.status === 201) {
        return request.data.message;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // LOGIN
  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username: username,
        password: password,
      });

      if (request.status === 200) {
        const user = request.data;

        // store user data
        setUserData(user);

        // optional: save token in localStorage
        if (user.token) {
          localStorage.setItem("token", user.token);
        }

        // redirect to home
        navigate("/home");

        return user;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
  };

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};