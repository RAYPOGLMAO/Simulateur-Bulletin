const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const authRoutes = require("./routes/auth");
const simulationRoutes = require("./routes/simulations");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Simulateur Bulletin API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/simulations", simulationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
