// app/page.js
"use client";

import { useState } from "react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:3001/api/chef", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });

    const data = await res.json();
    setResult(data.response);
  };

  return (
    <main className="min-h-screen p-10 flex flex-col items-center justify-center bg-white text-black">
      <h1 className="text-3xl font-bold mb-6">👨‍🍳 ChefGPT</h1>
      <input
        type="text"
        placeholder="Enter ingredients (e.g., rice, egg, spinach)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        className="w-full max-w-lg p-3 border rounded shadow mb-4"
      />
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Get Recipe
      </button>

      {result && (
        <div className="mt-8 w-full max-w-2xl p-4 border rounded bg-gray-50 shadow">
          <h2 className="text-xl font-semibold mb-2">🍽 Suggested Recipe:</h2>
          <p>{result}</p>
        </div>
      )}
    </main>
  );
}
