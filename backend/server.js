import express from "express"
import cors from "cors"
import productRoutes from "./routes/product.routes.js";
import commentRoutes from "./routes/comment.routes.js"
import connectToMongoDB from "./db/conectToMongo.js";

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST'],
  credentials: false,
}));

const PORT =  8000;
app.use(express.json());
app.use("/api/product", commentRoutes)
app.use("/api/product", productRoutes);

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server is running on port ${PORT}`)
});