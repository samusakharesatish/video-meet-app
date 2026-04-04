import express from "express";
import { createServer} from "node:http";
import userRoutes from "./routes/users.routes.js";


import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8080))
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://satishsamu26_db_user:videoDbUser@learningcluster.xmlyirn.mongodb.net/")
    console.log(`MONGO Connected to DB Host ${connectionDb.connection.host}`)
    server.listen(app.get("port"), () =>{
        console.log("listen to port 8080")
    });
}

start();