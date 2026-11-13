const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// CORS - sirf ek baar, sabse upar
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/Events");

app.use("/api/auth", authRoutes);
app.use("/api/Events", eventRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/eventbase")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));