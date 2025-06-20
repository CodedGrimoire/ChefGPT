import sys
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load FAISS index and recipe texts
index = faiss.read_index("recipe_index.faiss")
with open("recipe_texts.json", "r") as f:
    texts = json.load(f)

# Load embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

def search(query, k=5):
    query_vec = model.encode([query])
    faiss.normalize_L2(query_vec)
    D, I = index.search(query_vec, k)
    results = [texts[i] for i in I[0] if i < len(texts)]
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"results": []}))
        sys.exit(1)
    query = sys.argv[1]
    results = search(query)
    print(json.dumps({"results": results}))
