import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowHeaders: ["*"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ================= JOIN CALL =================
    socket.on("join-call", (path) => {
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      // Notify all users in room
      for (let i = 0; i < connections[path].length; i++) {
        io.to(connections[path][i]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }
    });

    // ================= SIGNAL (WebRTC) =================
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    // ================= CHAT =================
    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }
          return [room, isFound];
        },
        ["", false]
      );

      if (found === true) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id
        });

        console.log("message", matchingRoom, ":", sender, data);

        connections[matchingRoom].forEach((ele) => {
          io.to(ele).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    // ================= DISCONNECT =================
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      let diffTime = Math.abs(
        new Date() - (timeOnline[socket.id] || new Date())
      );

      let key;

      for (const [k, v] of Object.entries(connections)) {
        for (let i = 0; i < v.length; i++) {
          if (v[i] === socket.id) {
            key = k;

            // Notify others
            for (let j = 0; j < connections[key].length; j++) {
              io.to(connections[key][j]).emit("user-left", socket.id);
            }

            // Remove user
            const index = connections[key].indexOf(socket.id);
            if (index !== -1) {
              connections[key].splice(index, 1);
            }

            // Delete room if empty
            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }

      delete timeOnline[socket.id];
    });
  });

  return io;
};