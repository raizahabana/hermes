const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Main Routes
const mainRoutes = require("./routes/main");
app.use("/api", mainRoutes);

// Service Routes
const openClaudeRoutes = require("./routes/services/openClaude");
const openfangRoutes = require("./routes/services/openfang");
const pentagiRoutes = require("./routes/services/pentagi");

app.use("/api/openclaude", openClaudeRoutes);
app.use("/api/openfang", openfangRoutes);
app.use("/api/pentagi", pentagiRoutes);

module.exports = app;
