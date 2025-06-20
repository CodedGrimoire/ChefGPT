const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/chef", (req, res) => {
  const { ingredients } = req.body;

  // Spawn Python process to run search_query.py with ingredients argument
  const py = spawn("python3", ["search_query.py", ingredients]);

  let result = "";

  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });

  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ response: "Error processing your request." });
    }
    try {
      const jsonResponse = JSON.parse(result);
      res.json(jsonResponse);
    } catch (e) {
      console.error("JSON parse error:", e);
      res.json({ response: "Could not parse search response." });
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ ChefGPT backend running on http://localhost:${PORT}`);
});
