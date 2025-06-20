"use client";

import { useState } from "react";
import { ChefHat, Utensils, Heart, Sparkles, Clock, Users, X, Eye } from "lucide-react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch("http://localhost:3001/api/chef", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });

      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      setResults(["❌ Error fetching recipes. Try again."]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const openRecipeModal = (recipe, index) => {
    setSelectedRecipe({ content: recipe, index });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  const parseRecipeTitle = (recipeText) => {
    // Extract just the title for card display
    const titleMatch = recipeText.match(/Title:\s*([^.]+)/i);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Fallback: use first sentence
    const firstLine = recipeText.split(/[.\n]/)[0].trim();
    if (firstLine.length > 0 && firstLine.length < 80) {
      return firstLine;
    }
    
    return `Delicious Recipe`;
  };

  const parseRecipe = (recipeText) => {
    // Handle the specific format: "Title: X. Ingredients: Y. Instructions: Z"
    let title = parseRecipeTitle(recipeText);
    let ingredients = [];
    let instructions = [];
    
    // Extract ingredients - improved regex to handle the format better
    const ingredientsMatch = recipeText.match(/Ingredients:\s*([^.]*?)(?:\.\s*Instructions:|$)/i);
    if (ingredientsMatch) {
      const ingredientText = ingredientsMatch[1].trim();
      // Split by commas and clean up
      ingredients = ingredientText
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0 && item.toLowerCase() !== 'instructions')
        .map(item => item.replace(/^and\s+/i, '').trim())
        .map(item => item.charAt(0).toUpperCase() + item.slice(1));
    }
    
    // Extract instructions - improved to capture everything after "Instructions:"
    const instructionsMatch = recipeText.match(/Instructions:\s*(.+?)(?:\s*$)/is);
    if (instructionsMatch) {
      const instructionText = instructionsMatch[1].trim();
      // Split by periods for individual steps, but be smarter about it
      instructions = instructionText
        .split(/\.\s+(?=[A-Z])/) // Split on periods followed by capital letters
        .map(step => step.trim())
        .filter(step => step.length > 10) // Filter out very short fragments
        .map(step => step.replace(/^\d+\.?\s*/, '').trim()) // Remove numbering
        .map(step => {
          // Ensure proper capitalization and punctuation
          step = step.charAt(0).toUpperCase() + step.slice(1);
          if (!step.endsWith('.') && !step.endsWith('!') && !step.endsWith('?')) {
            step += '.';
          }
          return step;
        });
    }
    
    // Fallback for when format is not as expected
    if (ingredients.length === 0 || instructions.length === 0) {
      // Try to extract from a more free-form text
      const sentences = recipeText.split(/[.!?]+/).filter(s => s.trim().length > 5);
      
      if (ingredients.length === 0) {
        // Look for sentences that mention common ingredients or quantities
        const commonIngredients = ['rice', 'tomato', 'onion', 'garlic', 'oil', 'salt', 'pepper', 'water', 'egg', 'cheese', 'flour', 'sugar'];
        const ingredientSentences = sentences.filter(sentence => {
          const lowerSentence = sentence.toLowerCase();
          return commonIngredients.some(ingredient => lowerSentence.includes(ingredient)) ||
                 /\b\d+\s*(cup|tablespoon|teaspoon|pound|ounce|gram|ml|liter)/.test(lowerSentence);
        });
        
        if (ingredientSentences.length > 0) {
          ingredients = ingredientSentences.map(s => s.trim());
        } else {
          ingredients = ['Rice', 'Tomatoes', 'Onion', 'Garlic', 'Oil', 'Salt', 'Pepper'];
        }
      }
      
      if (instructions.length === 0) {
        // Use remaining sentences as instructions
        const actionWords = ['heat', 'cook', 'add', 'stir', 'mix', 'chop', 'slice', 'pour', 'serve'];
        const instructionSentences = sentences.filter(sentence => {
          const lowerSentence = sentence.toLowerCase();
          return actionWords.some(action => lowerSentence.includes(action));
        });
        
        if (instructionSentences.length > 0) {
          instructions = instructionSentences.map(s => s.trim() + (s.trim().endsWith('.') ? '' : '.'));
        } else {
          instructions = ['Follow the cooking steps carefully for best results.'];
        }
      }
    }
    
    return { title, ingredients, instructions };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-pink-100 relative overflow-hidden">
      {/* Floating cooking elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-pink-300 text-4xl animate-bounce">🥄</div>
        <div className="absolute top-40 right-20 text-blue-300 text-3xl animate-pulse">🍳</div>
        <div className="absolute bottom-32 left-20 text-pink-300 text-3xl animate-bounce delay-1000">🥚</div>
        <div className="absolute bottom-20 right-32 text-blue-300 text-4xl animate-pulse delay-500">🧄</div>
        <div className="absolute top-32 left-1/2 text-pink-300 text-2xl animate-bounce delay-700">🥕</div>
        <div className="absolute bottom-40 right-10 text-blue-300 text-2xl animate-pulse delay-300">🌿</div>
      </div>

      <main className="relative z-10 min-h-screen p-6 flex flex-col items-center justify-center">
        {/* Header Section */}
        <div className="text-center mb-8 opacity-100 transition-all duration-1000 ease-out">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="text-pink-400 text-5xl animate-bounce" size={48} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
              ChefGPT
            </h1>
            <Sparkles className="text-blue-400 text-4xl animate-pulse" size={40} />
          </div>
          <p className="text-gray-600 text-lg font-medium">
            ✨ Turn your ingredients into magical recipes! ✨
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-lg mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="🥬 Enter ingredients (e.g., rice, egg, spinach)"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-4 pl-12 pr-4 text-lg border-2 border-pink-200 rounded-full shadow-lg 
                         focus:border-pink-300 focus:ring-4 focus:ring-pink-100 focus:outline-none
                         bg-white/80 backdrop-blur-sm transition-all duration-300
                         hover:shadow-xl hover:border-blue-200 text-pink-800 placeholder-pink-400
                         font-medium"
            />
            <Utensils className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400" size={20} />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading || !ingredients.trim()}
            className="w-full mt-4 py-4 px-8 text-lg font-semibold text-white rounded-full
                       bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500
                       disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                       transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                       active:scale-95 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Cooking up something delicious...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <ChefHat size={20} />
                Cook Magic Recipe!
                <Heart size={18} />
              </div>
            )}
          </button>
        </div>

        {/* Recipe Results */}
        {results.length > 0 && (
          <div className="w-full max-w-4xl opacity-100 transition-all duration-700 ease-out">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                <span className="text-pink-400">🍽️</span>
                Your Magical Recipes
                <span className="text-blue-400">✨</span>
              </h2>
              <p className="text-gray-600">Fresh from our digital kitchen!</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((recipe, idx) => {
                const title = parseRecipeTitle(recipe);
                
                return (
                  <div
                    key={idx}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg 
                             border border-pink-200 hover:shadow-2xl hover:border-pink-300
                             transform transition-all duration-500 hover:-translate-y-2 hover:scale-105
                             opacity-100 cursor-pointer"
                    onClick={() => openRecipeModal(recipe, idx)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-pink-300 to-blue-300 rounded-full
                                    group-hover:from-pink-400 group-hover:to-blue-400 transition-all duration-300
                                    shadow-md">
                        <ChefHat className="text-white" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 flex-1 leading-tight">
                        {title.length > 40 ? title.substring(0, 40) + "..." : title}
                      </h3>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-xl p-4
                                  border border-pink-200 group-hover:border-pink-300 transition-all duration-300
                                  text-center min-h-[100px] flex flex-col justify-center">
                      <div className="text-pink-500 mb-2">
                        <Sparkles size={24} className="mx-auto" />
                      </div>
                      <p className="text-gray-600 text-sm mb-3 font-medium">
                        A delicious recipe ready to cook!
                      </p>
                      <div className="flex items-center justify-center gap-2 text-pink-600 font-semibold">
                        <Eye size={18} />
                        <span>View Full Recipe</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-pink-200">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-pink-200 text-pink-700 rounded-full text-xs font-medium">
                          🌟 AI Generated
                        </span>
                        <span className="px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-xs font-medium">
                          🎯 Quick & Easy
                        </span>
                      </div>
                      <Heart 
                        className="text-pink-400 cursor-pointer hover:text-pink-500 
                                   transition-colors duration-200 hover:scale-110 transform" 
                        size={20}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="text-pink-400" size={16} /> for food lovers everywhere
          </p>
        </div>
      </main>

      {/* Recipe Modal */}
      {isModalOpen && selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl
                        transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-pink-400 to-blue-400 p-6 text-white relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3">
                <ChefHat size={32} />
                <h2 className="text-2xl font-bold">
                  {parseRecipe(selectedRecipe.content).title}
                </h2>
              </div>
              <p className="text-pink-100 mt-2 text-sm">Fresh from our AI kitchen!</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const { ingredients, instructions } = parseRecipe(selectedRecipe.content);
                return (
                  <div className="space-y-6">
                    {/* Ingredients Section */}
                    <div className="bg-gradient-to-r from-pink-50 to-blue-50 rounded-2xl p-5 border border-pink-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        🥘 Ingredients
                      </h3>
                      <ul className="space-y-2">
                        {ingredients.map((ingredient, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700">
                            <span className="text-pink-400 font-bold">•</span>
                            <span className="font-medium">{ingredient}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-2xl p-5 border border-blue-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        👩‍🍳 Instructions
                      </h3>
                      <ol className="space-y-3">
                        {instructions.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-4 text-gray-700">
                            <span className="bg-gradient-to-r from-pink-400 to-blue-400 text-white 
                                           rounded-full w-8 h-8 flex items-center justify-center 
                                           text-sm font-bold flex-shrink-0 mt-1">
                              {idx + 1}
                            </span>
                            <span className="font-medium leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Recipe Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <span className="px-4 py-2 bg-pink-200 text-pink-700 rounded-full text-sm font-medium">
                          🌟 Fresh Recipe
                        </span>
                        <span className="px-4 py-2 bg-blue-200 text-blue-700 rounded-full text-sm font-medium">
                          🎯 Easy to Follow
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="text-gray-400" size={18} />
                        <span className="text-gray-600 text-sm">Ready to cook!</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}