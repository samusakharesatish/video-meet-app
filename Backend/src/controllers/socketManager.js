
import { connections } from "mongoose"
import { Server } from "socket.io"

let connection = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => { 
    const io = new Server(server, {
        cors: {                         //cors but this thing not do in production level
            origin: "*",
            methods: ["GET", "POST"],
            allowHeaders: ["*"],
            credentials: true
        }       
    });

    io.on("connection", (Socket) => {

        socket.on("join-cal", (path) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a])
                  .emit("user-joined", socket.id, connections[path]);
            }
        });

        socket.on("single", (toId, message) => {
            io.to(toId).emit("single", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {

                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({
                    sender: sender,
                    data: data,
                    "socket-id-sender": socket.id
                });
                console.log("message", key, ":", sender, data)

                connections[matchingRoom]. forEach((ele) => {
                    io.to(ele).emit("chat-messages", data, sender, socket.id)
                })
            }
        });

        socket.on("disconnect", (socket) => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Data())

            var key

            for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){

                for(let a=0; a<v.length; ++a) {
                    if(v[a] === socket.id)
                        key = k

                        for ( let a=0; a< connecton[key].length; ++a){
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }
                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        if(connections[key].length == 0)[
                            delete connections[key]
                        ]
                }
            }

        });

    });

    return io;
};
