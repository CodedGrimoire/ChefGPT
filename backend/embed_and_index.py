import json
import faiss
from sentence_transformers import SentenceTransformer

# Load recipes
with open("recipes.json", "r") as f:
    recipes = json.load(f)

# Initialize model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Prepare texts to embed
texts = []
for r in recipes:
    text = f"Title: {r['title']}. Ingredients: {', '.join(r['ingredients'])}. Instructions: {r['instructions']}"
    texts.append(text)

# Create embeddings
embeddings = model.encode(texts, convert_to_numpy=True)

# Build FAISS index (cosine similarity)
dimension = embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity

# Normalize embeddings for cosine similarity
faiss.normalize_L2(embeddings)

index.add(embeddings)
print(f"Indexed {index.ntotal} recipes")

# Save index and texts for retrieval later
faiss.write_index(index, "recipe_index.faiss")
with open("recipe_texts.json", "w") as f:
    json.dump(texts, f)

print("FAISS index and recipe texts saved!")
