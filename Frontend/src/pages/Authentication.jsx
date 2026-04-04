import React, { useState, useContext } from "react";
import { TextField, Button, Paper, Typography, Stack } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

export default function Authentication() {

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [formSet, setFormset] = useState(0);

  const handleAuth = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {

      // LOGIN
      if (formSet === 0) {
        await handleLogin(username, password);
        setMessage("Login successful");
      }

      // REGISTER
      if (formSet === 1) {
        const result = await handleRegister(name, username, password);
        setMessage(result);
      }

    } catch (err) {

      setError(
        err?.response?.data?.message || "Something went wrong"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}
    >
      <Paper elevation={4} sx={{ padding: 4, width: 360 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          {formSet === 0 ? "Sign In" : "Sign Up"}
        </Typography>

        <form onSubmit={handleAuth}>
          <Stack spacing={2}>

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
            >
              {loading
                ? "Please wait..."
                : formSet === 0
                ? "Sign In"
                : "Sign Up"}
            </Button>

            <Button
              type="button"
              onClick={() => setFormset(formSet === 0 ? 1 : 0)}
            >
              {formSet === 0
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </Button>

          </Stack>
        </form>

        {message && (
          <Typography mt={2} textAlign="center" color="green">
            {message}
          </Typography>
        )}

        {error && (
          <Typography mt={2} textAlign="center" color="error">
            {error}
          </Typography>
        )}

      </Paper>
    </Stack>
  );
}