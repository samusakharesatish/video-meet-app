// SAME IMPORTS
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import server from "../environment";

const server_url = server;

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

var connections = {};

export default function VideoMeet() {
  const socketRef = useRef();
  const socketIdRef = useRef();

  const localVideoRef = useRef();
  const previewVideoRef = useRef();

  const [username, setUsername] = useState("");
  const [askUsername, setAskUsername] = useState(true);

  const [videos, setVideos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);

  // ================= PERMISSIONS =================
  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      window.localStream = stream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log(err);
    }
  };

  // attach after join
  useEffect(() => {
    if (!askUsername && window.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, [askUsername]);

  // ================= SOCKET =================
  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url);

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", (data, sender) => {
        setMessages((prev) => [...prev, { sender, data }]);
      });

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((v) => v.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (connections[socketListId]) return;

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          connections[socketListId].ontrack = (event) => {
            let stream = event.streams[0];

            setVideos((prev) => {
              const exists = prev.find((v) => v.socketId === socketListId);
              if (exists) {
                return prev.map((v) =>
                  v.socketId === socketListId ? { ...v, stream } : v
                );
              } else {
                return [...prev, { socketId: socketListId, stream }];
              }
            });
          };

          if (window.localStream) {
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription })
                );
              });
            });
          }
        }
      });
    });
  };

  // cleanup (🔥 important)
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      connections = {};
    };
  }, []);

  const gotMessageFromServer = (fromId, message) => {
    let signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId].createAnswer().then((description) => {
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({
                        sdp: connections[fromId].localDescription,
                      })
                    );
                  });
              });
            }
          });
      }

      if (signal.ice) {
        connections[fromId]?.addIceCandidate(
          new RTCIceCandidate(signal.ice)
        );
      }
    }
  };

  // ================= CONTROLS =================
  const handleVideo = () => {
    window.localStream.getVideoTracks()[0].enabled = !video;
    setVideo(!video);
  };

  const handleAudio = () => {
    window.localStream.getAudioTracks()[0].enabled = !audio;
    setAudio(!audio);
  };

  const handleScreen = async () => {
    if (!screen) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      let screenTrack = stream.getTracks()[0];

      for (let id in connections) {
        let sender = connections[id]
          .getSenders()
          .find((s) => s.track.kind === "video");

        sender?.replaceTrack(screenTrack);
      }

      screenTrack.onended = () => setScreen(false);
      setScreen(true);
    }
  };

  const handleEndCall = () => {
    window.location.href = "/";
  };

  const sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  const connect = () => {
    setAskUsername(false);
    connectToSocketServer();
  };

  // ================= UI =================
  if (askUsername) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4 px-4">
        <h2 className="text-2xl font-semibold">Join Meeting</h2>

        <input
          className="px-4 py-2 rounded bg-gray-800 border border-gray-600 w-full max-w-sm"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button onClick={connect} className="bg-red-500 px-6 py-2 rounded w-full max-w-sm">
          Join
        </button>

        <video
          ref={previewVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full max-w-sm rounded mt-4 bg-black"
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* HEADER */}
      <div className="p-4 flex justify-between bg-gray-800">
        <h1>{username}</h1>
        <button onClick={handleEndCall} className="bg-red-600 px-4 py-2 rounded">
          Leave
        </button>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        
        {/* VIDEO */}
        <div className="flex-1 p-2 md:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 overflow-auto">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full bg-black rounded"
          />

          {videos.map((v) => (
            <video
              key={v.socketId}
              autoPlay
              playsInline
              ref={(ref) => {
                if (ref && v.stream) ref.srcObject = v.stream;
              }}
              className="w-full bg-black rounded"
            />
          ))}
        </div>

        {/* CHAT */}
        <div className="w-full md:w-80 bg-gray-800 flex flex-col border-t md:border-l md:border-t-0 border-gray-700">
          <div className="p-3 font-semibold border-b border-gray-700">Chat</div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-40 md:max-h-full">
            {messages.map((m, i) => (
              <div key={i}>
                <strong>{m.sender}:</strong> {m.data}
              </div>
            ))}
          </div>

          <div className="p-3 flex gap-2 border-t border-gray-700">
            <input
              className="flex-1 px-3 py-2 rounded bg-gray-700"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage} className="bg-blue-600 px-4 rounded">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="p-4 flex flex-wrap justify-center gap-2 md:gap-4 bg-gray-800">
        <button onClick={handleVideo} className="bg-gray-700 px-4 py-2 rounded">
          {video ? "Camera Off" : "Camera On"}
        </button>

        <button onClick={handleAudio} className="bg-gray-700 px-4 py-2 rounded">
          {audio ? "Mic Off" : "Mic On"}
        </button>

        <button onClick={handleScreen} className="bg-indigo-600 px-4 py-2 rounded">
          Share Screen
        </button>
      </div>
    </div>
  );
}