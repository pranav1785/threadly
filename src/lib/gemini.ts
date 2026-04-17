/**
 * Google Gemini AI integration for Threadly
 * Powers: semantic search, trend analysis, product recommendations, query expansion
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Expands a user search query to improve semantic search results
 */
export async function expandSearchQuery(query: string): Promise<{
  expandedQuery: string;
  categories: string[];
  priceRange?: { min: number; max: number };
  intent: string;
}> {
  try {
    const prompt = `You are a universal e-commerce search assistant. Given this search query: "${query}"
    
    Return a JSON object with:
    - expandedQuery: enhanced search query with synonyms and related terms
    - categories: array of relevant product categories (e.g., ["Electronics", "Phones"])
    - priceRange: optional price range { min, max } if implied by query
    - intent: user intent ("buy", "browse", "compare", "gift")
    
    Return only valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      expandedQuery: query,
      categories: ["All"],
      intent: "browse",
    };
  }
}

/**
 * Generate AI-powered product recommendations
 */
export async function getAIRecommendations(
  userPreferences: string[],
  searchHistory: string[]
): Promise<string[]> {
  try {
    const prompt = `Based on these user preferences: ${userPreferences.join(", ")}
    And search history: ${searchHistory.join(", ")}
    
    Suggest 5 product search queries they might be interested in for a universal e-commerce platform.
    Return as JSON array of strings only, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return ["trending electronics", "fashion deals", "home essentials", "sports gear", "beauty products"];
  }
}

/**
 * Analyze trending topics for retailer insights
 */
export async function analyzeTrends(category: string): Promise<{
  trending: string[];
  insights: string;
  demandScore: number;
}> {
  try {
    const prompt = `Analyze current market trends for the "${category}" product category in e-commerce.
    
    Return JSON with:
    - trending: array of 5 trending product types or features
    - insights: 2-3 sentence actionable insight for retailers
    - demandScore: demand score 1-100
    
    Return only valid JSON, no markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      trending: ["Popular items", "New arrivals", "Sale items"],
      insights: "Strong demand observed in this category. Consider stocking popular items.",
      demandScore: 75,
    };
  }
}

/**
 * Generate contextual product description
 */
export async function generateProductContext(
  productName: string,
  category: string
): Promise<string> {
  try {
    const prompt = `Write a 2-sentence compelling product description for "${productName}" in the ${category} category. Be specific and highlight key benefits. No quotes.`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `${productName} - A quality product in the ${category} category. Available from multiple platforms at competitive prices.`;
  }
}

/**
 * Find similar products using AI reasoning
 */
export async function findSimilarProducts(
  productName: string,
  features: string[]
): Promise<string[]> {
  try {
    const prompt = `For the product "${productName}" with features: ${features.join(", ")}
    Suggest 4 similar alternative product names/types a shopper might want.
    Return as JSON array of strings only, no markdown.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return ["Similar Item 1", "Alternative Option", "Budget Pick", "Premium Version"];
  }
}

export { model, genAI };
