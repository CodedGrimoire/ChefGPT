// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { spawn } = require("child_process");
const { GROQ_API_KEY } = process.env;
const axios = require("axios");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/api/chef", async (req, res) => {
  const { ingredients } = req.body;

  // Call Python script to get up to 5 recipes
  const py = spawn("python3", ["search_query.py", ingredients]);

  let result = "";

  py.stdout.on("data", (data) => {
    result += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("Python error:", data.toString());
  });

  py.on("close", async (code) => {
    if (code !== 0) {
      return res.status(500).json({ response: "Error processing request" });
    }

    try {
      const jsonResponse = JSON.parse(result);
      if (jsonResponse.results && jsonResponse.results.length > 0) {
        return res.json({ results: jsonResponse.results });
      } else {
        // No results, call Groq
        const groqRes = await axios.post(
          "https://api.groq.com/v1/chat/completions",
          {
            model: "llama3-8b-8192",
            messages: [
              {
                role: "user",
                content: `Suggest a recipe using the following ingredients: ${ingredients}. Provide ingredients and cooking steps.`
              }
            ],
            temperature: 0.7
          },
          {
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );

        const recipeText = groqRes.data.choices[0].message.content;

        // Save to recipes.json
        const newRecipe = {
          title: `Generated Recipe for ${ingredients}`,
          ingredients: ingredients.split(",").map(i => i.trim()),
          instructions: recipeText
        };

        const filePath = "recipes.json";
        const data = fs.readFileSync(filePath);
        const existing = JSON.parse(data);
        existing.push(newRecipe);
        fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

        return res.json({ results: [recipeText] });
      }
    } catch (e) {
      console.error("Error parsing response:", e);
      return res.status(500).json({ response: "Server error during search" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ ChefGPT backend running on http://localhost:${PORT}`);
});