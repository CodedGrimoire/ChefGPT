import sys
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load FAISS index and recipe texts once
index = faiss.read_index("recipe_index.faiss")
with open("recipe_texts.json", "r") as f:
    texts = json.load(f)

model = SentenceTransformer('all-MiniLM-L6-v2')

def search(query, k=3):
    query_vec = model.encode([query])
    faiss.normalize_L2(query_vec)
    D, I = index.search(query_vec, k)
    results = [texts[i] for i in I[0]]
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"response": "No query provided"}))
        sys.exit(1)
    query = sys.argv[1]
    results = search(query)
    response = {"response": results[0]}  # Return top result
    print(json.dumps(response))
