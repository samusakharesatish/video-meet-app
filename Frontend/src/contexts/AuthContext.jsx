import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

// ✅ Base URL
const BASE_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1/users`,
  headers: {
    "Content-Type": "application/json"
  }
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ================= REGISTER =================
  const handleRegister = async (name, username, password) => {
    try {
      const res = await client.post("/register", {
        name,
        username,
        password
      });

      if (res.status === 201) {
        return res.data.message;
      }
    } catch (err) {
      console.error("Register Error:", err?.response?.data || err.message);
      throw new Error(err?.response?.data?.message || "Registration failed");
    }
  };

  // ================= LOGIN =================
  const handleLogin = async (username, password) => {
    try {
      const res = await client.post("/login", {
        username,
        password
      });

      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        navigate("/home");
      }
    } catch (err) {
      console.error("Login Error:", err?.response?.data || err.message);
      throw new Error(err?.response?.data?.message || "Login failed");
    }
  };

  // ================= GET HISTORY =================
  const getHistoryOfUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await client.get("/get_all_activity", {
        params: { token }, // ✅ keep existing
        headers: {
          Authorization: `Bearer ${token}` // ✅ added (important fix)
        }
      });

      return res.data;
    } catch (err) {
      console.error("❌ History Error:", err?.response?.data || err.message);
      throw new Error("Failed to fetch history");
    }
  };

  // ================= ADD HISTORY =================
  const addToUserHistory = async (meetingCode) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await client.post(
        "/add_to_activity",
        {
          token,
          meeting_code: meetingCode
        },
        {
          headers: {
            Authorization: `Bearer ${token}` // ✅ added
          }
        }
      );

      return res.data;
    } catch (err) {
      console.error("Add History Error:", err?.response?.data || err.message);
      throw new Error("Failed to add history");
    }
  };

  const value = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUser,
    addToUserHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};