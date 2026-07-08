const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Database connection inside Next.js environment
  const dbUrl = process.env.DATABASE_URL || "mongodb+srv://admin:admin@cluster0.xqa99.mongodb.net/matrimony?retryWrites=true&w=majority&appName=Cluster0";
  mongoose.connect(dbUrl)
    .then(() => console.log("> Connected to MongoDB from custom WebSocket server"))
    .catch(err => console.error("> MongoDB connection error:", err));

  // Define Message schema for server-side persistence
  let Message;
  try {
    Message = mongoose.model("Message");
  } catch {
    const MessageSchema = new mongoose.Schema({
      room: { type: String, required: true, index: true },
      sender: { type: String, required: true },
      text: { type: String },
      fileUrl: { type: String },
      fileType: { type: String, enum: ["text", "image", "video", "audio"], default: "text" },
      createdAt: { type: Date, default: Date.now }
    });
    Message = mongoose.model("Message", MessageSchema);
  }

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Client socket connected:", socket.id);
    
    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on("send-message", async (msg) => {
      console.log("Received send-message event:", msg);
      try {
        const newMessage = new Message({
          room: msg.room,
          sender: msg.sender,
          text: msg.text,
          fileType: msg.fileType || "text",
          fileUrl: msg.fileUrl,
          createdAt: new Date()
        });
        await newMessage.save();

        // Format for frontend receive-message event
        const formatted = {
          room: msg.room,
          sender: msg.sender,
          text: msg.text,
          type: msg.fileType === "audio" ? "voice" : msg.fileType,
          imageSrc: msg.fileType === "image" ? msg.fileUrl : undefined,
          videoSrc: msg.fileType === "video" ? msg.fileUrl : undefined,
          fileUrl: msg.fileUrl,
          voiceDuration: msg.fileType === "audio" ? "Play" : undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Broadcast to room
        io.to(msg.room).emit("receive-message", formatted);
      } catch (err) {
        console.error("Failed to save and broadcast message:", err);
      }
    });

    socket.on("call-user", ({ to, room, offer, type, callerName, callerAvatar }) => {
      console.log(`[CALL] call-user signal to personal email room: ${to}, type: ${type}`);
      socket.to(to).emit("incoming-call", { room, offer, type, callerName, callerAvatar });
    });

    socket.on("accept-call", ({ room, answer }) => {
      console.log(`[CALL] accept-call signal in room: ${room}`);
      socket.to(room).emit("call-accepted", { answer });
    });

    socket.on("reject-call", ({ room }) => {
      console.log(`[CALL] reject-call signal in room: ${room}`);
      socket.to(room).emit("call-rejected");
    });

    socket.on("ice-candidate", ({ room, candidate }) => {
      socket.to(room).emit("ice-candidate", { candidate });
    });

    socket.on("hangup-call", ({ room }) => {
      console.log(`[CALL] hangup-call signal in room: ${room}`);
      socket.to(room).emit("call-hungup");
    });

    socket.on("disconnect", () => {
      console.log("Client socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
