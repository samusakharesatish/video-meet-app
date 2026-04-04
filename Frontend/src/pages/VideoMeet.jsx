import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SERVER_URL = "http://localhost:8080";

export default function VideoMeet() {

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [stream, setStream] = useState(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  const [permissionError, setPermissionError] = useState("");

  // ✅ CHECK PERMISSIONS
  const checkPermissions = async () => {
    try {
      const cam = await navigator.permissions.query({ name: "camera" });
      const mic = await navigator.permissions.query({ name: "microphone" });

      if (cam.state === "denied" || mic.state === "denied") {
        setPermissionError("Camera/Microphone permission denied");
        return false;
      }

      return true;
    } catch {
      return true; // fallback (some browsers don’t support permissions API)
    }
  };

  // ✅ JOIN MEETING
  const joinMeeting = async () => {
    setPermissionError("");

    const hasPermission = await checkPermissions();

    if (!hasPermission) return;

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setStream(localStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      socketRef.current = io(SERVER_URL);

      socketRef.current.emit("join-room", roomId);

      socketRef.current.on("chat-message", msg => {
        setChat(prev => [...prev, msg]);
      });

      setJoined(true);

    } catch (err) {
      console.error(err);
      setPermissionError("Please allow camera & microphone access");
    }
  };

  // ✅ TOGGLE CAMERA
  const toggleCamera = () => {
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  };

  // ✅ TOGGLE MIC
  const toggleMic = () => {
    if (!stream) return;

    const track = stream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  // ✅ SCREEN SHARE
  const shareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      const screenTrack = screenStream.getTracks()[0];

      const sender = socketRef.current?.peerConnection
        ?.getSenders()
        ?.find(s => s.track.kind === "video");

      if (sender) sender.replaceTrack(screenTrack);

    } catch (err) {
      console.log("Screen share cancelled");
    }
  };

  // ✅ CHAT
  const sendMessage = () => {
    if (!message.trim()) return;

    const msg = {
      text: message,
      time: new Date().toLocaleTimeString()
    };

    socketRef.current.emit("chat-message", msg);

    setChat(prev => [...prev, msg]);
    setMessage("");
  };

  // ✅ LEAVE
  const leaveMeeting = () => {
    stream?.getTracks().forEach(track => track.stop());
    socketRef.current?.disconnect();

    setJoined(false);
    setStream(null);
  };

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
    };
  }, [stream]);

  // 🔵 LOBBY
  if (!joined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">

        <div className="bg-white shadow-xl rounded-xl p-8 w-96">

          <h2 className="text-2xl font-semibold text-center mb-4">
            Join Meeting
          </h2>

          {permissionError && (
            <p className="text-red-500 text-sm mb-3 text-center">
              {permissionError}
            </p>
          )}

          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 mb-4"
          />

          <button
            onClick={joinMeeting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Join Meeting
          </button>

        </div>
      </div>
    );
  }

  // 🟢 MAIN UI
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">

      {/* HEADER */}
      <div className="p-4 flex justify-between bg-gray-800">
        <h1>Room: {roomId}</h1>
        <button onClick={leaveMeeting} className="bg-red-600 px-4 py-2 rounded">
          Leave
        </button>
      </div>

      {/* VIDEO */}
      <div className="flex-1 p-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full rounded bg-black"
        />
      </div>

      {/* CONTROLS */}
      <div className="p-4 flex justify-center gap-4 bg-gray-800">

        <button onClick={toggleCamera} className="bg-gray-700 px-4 py-2 rounded">
          {cameraOn ? "Camera Off" : "Camera On"}
        </button>

        <button onClick={toggleMic} className="bg-gray-700 px-4 py-2 rounded">
          {micOn ? "Mic Off" : "Mic On"}
        </button>

        <button onClick={shareScreen} className="bg-indigo-600 px-4 py-2 rounded">
          Share Screen
        </button>

      </div>
    </div>
  );
}