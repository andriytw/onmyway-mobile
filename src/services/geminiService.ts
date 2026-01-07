
import { GoogleGenAI } from "@google/genai";

// Standardized initialization of GoogleGenAI using environment API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestDestination = async (query: string): Promise<string> => {
  // Use ai.models.generateContent directly with model and prompt as per guidelines
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `User wants to go to: "${query}" in Kyiv. Suggest ONE specific real address or place name. Return ONLY the address/name, nothing else.`,
  });
  // Accessing text as a property of GenerateContentResponse
  return response.text?.trim() || "Центр міста";
};

export const getDriverResponse = async (driverName: string, userMessage: string, history: string[]): Promise<string> => {
  // Configured with temperature and topP for conversational feel
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a friendly ride-sharing driver named ${driverName} in Kyiv. 
    User said: "${userMessage}". 
    Previous conversation: ${history.join(' | ')}. 
    Keep it short, professional, and helpful (max 15 words). Reply in Ukrainian.`,
    config: {
      temperature: 0.7,
      topP: 0.8,
    }
  });
  // Accessing text as a property of GenerateContentResponse
  return response.text?.trim() || "Зрозумів, буду скоро!";
};
