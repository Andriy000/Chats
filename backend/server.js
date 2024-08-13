import express from "express"
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import chatRoutes from "./routes/chat.routes.js";
//import chatRoutes from "./routes/chat.routes.js"
import connectToMongoDB from "./db/conectToMongo.js";

const app = express();

const PORT =  5000;
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes)
app.use("/api/message", messageRoutes);
//app.use("/api/chat", chatRoutes);
//to parse data from JSON payloads like Auth from  req.body

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${PORT}`)
});