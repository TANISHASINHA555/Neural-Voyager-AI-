import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

export async function generateNeuralJourney(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure GEMINI_API_KEY is set in your environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: `User Command: ${prompt}` }],
      },
      config: {
        responseMimeType: "application/json",
        systemInstruction: `You are the Neural Voyager AI. You explore the human brain.
        For every prompt, you must provide a detailed explanation of the neural journey AND specific parameters for an interactive 3D simulation.
        
        Simulation Parameters:
        - focusRegion: The specific brain area (e.g., "Amygdala", "Prefrontal Cortex").
        - nearbyRegions: An array of 2-3 brain areas physically adjacent to the focusRegion.
        - activityType: "burst", "flow", "pulse", or "static".
        - intensity: 0.1 to 1.0.
        - primaryColor: A hex code for the neural glow.
        - cameraPosition: [x, y, z] coordinates to focus the 3D view.`,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            simulationParams: {
              type: Type.OBJECT,
              properties: {
                focusRegion: { type: Type.STRING },
                nearbyRegions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                activityType: { type: Type.STRING },
                intensity: { type: Type.NUMBER },
                primaryColor: { type: Type.STRING },
                cameraPosition: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER }
                }
              },
              required: ["focusRegion", "nearbyRegions", "activityType", "intensity", "primaryColor", "cameraPosition"]
            },
            stats: {
              type: Type.OBJECT,
              properties: {
                dopamine: { type: Type.NUMBER },
                serotonin: { type: Type.NUMBER },
                heartRate: { type: Type.NUMBER },
                synapticActivity: { type: Type.NUMBER },
                oxygenLevel: { type: Type.NUMBER }
              }
            }
          },
          required: ["explanation", "simulationParams", "stats"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    return { 
      text: data.explanation, 
      stats: data.stats,
      simulationParams: data.simulationParams 
    };
  } catch (error: any) {
    console.error("Gemini API Error Details:", error);
    throw error;
  }
}

