import React, { useState, useContext, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function Authentication() {
  const { handleRegister, handleLogin } = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formSet, setFormset] = useState(0); // 0 = login, 1 = register

  // ✅ Sync form with URL
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const type = query.get("type");

    if (type === "register") {
      setFormset(1);
    } else {
      setFormset(0);
    }
  }, [location.search]);

  const handleAuth = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      // ✅ LOGIN
      if (formSet === 0) {
        await handleLogin(username, password);
        setMessage("Login successful");
      }

      // ✅ REGISTER (FIX APPLIED HERE 🔥)
      if (formSet === 1) {
        await handleRegister(name, username, password);

        // ✅ Show success message
        setMessage("✅ Registration successful! Please login to continue.");

        // ✅ Switch to login
        setFormset(0);

        // ✅ Update URL
        navigate("/auth?type=login");

        // ✅ Clear password
        setPassword("");
      }

    } catch (err) {
      setError(
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Toggle login/register
  const handleToggle = () => {
    const nextType = formSet === 0 ? "register" : "login";
    navigate(`/auth?type=${nextType}`);
  };

  // ✅ CLOSE BUTTON
  const handleClose = () => {
    navigate("/");
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #141e30, #243b55)",
      }}
    >

      {/* ❌ CLOSE ICON */}
      <Button
        onClick={handleClose}
        sx={{
          position: "fixed",
          top: "20px",
          right: "30px",
          minWidth: "auto",
          color: "white",
          zIndex: 1000,
        }}
      >
        <CloseIcon />
      </Button>

      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: 360,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" textAlign="center" mb={2}>
          {formSet === 0 ? "Sign In" : "Sign Up"}
        </Typography>

        <form onSubmit={handleAuth}>
          <Stack spacing={2}>
            
            {/* Register only */}
            {formSet === 1 && (
              <TextField
                label="Full Name"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                padding: "10px",
                fontWeight: "bold",
              }}
            >
              {loading
                ? "Please wait..."
                : formSet === 0
                ? "Sign In"
                : "Sign Up"}
            </Button>

            {/* Toggle */}
            <Button type="button" onClick={handleToggle}>
              {formSet === 0
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>
          </Stack>
        </form>

        {/* Success */}
        {message && (
          <Typography mt={2} textAlign="center" color="green">
            {message}
          </Typography>
        )}

        {/* Error */}
        {error && (
          <Typography mt={2} textAlign="center" color="error">
            {error}
          </Typography>
        )}
      </Paper>
    </Stack>
  );
}