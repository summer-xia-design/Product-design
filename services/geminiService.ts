import { GoogleGenAI } from "@google/genai";
import { DesignStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a realistic render from a sketch using Gemini.
 * @param base64Image The raw base64 string of the sketch (without data URI prefix ideally, but we handle cleaning).
 * @param userPrompt Specific details from the user.
 * @param style The selected design style.
 */
export const generateRenderFromSketch = async (
  base64Image: string,
  userPrompt: string,
  style: DesignStyle
): Promise<string> => {
  try {
    // Ensure we strip the data:image/xxx;base64, part if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const systemPrompt = `
      You are an expert Industrial Design visualizer. 
      Your task is to take the provided rough sketch and transform it into a high-fidelity, photorealistic product rendering.
      
      Input Image: A product sketch.
      Goal: A professional portfolio-quality render.
      
      Follow these strict rules:
      1. Respect the form factor and perspective of the original sketch.
      2. Apply realistic materials (plastic, metal, glass, fabric) as implied by the prompt or typical for this object.
      3. Use professional studio lighting (soft box, rim lighting) to define the curves.
      4. The background should be neutral or complementary to the product, keeping the focus on the design.
      
      Style details: ${style}
      Specific user requirements: ${userPrompt}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Standardizing on JPEG for upload context
              data: cleanBase64,
            },
          },
          {
            text: systemPrompt,
          },
        ],
      },
      // We don't use responseMimeType here as we want the text/image response structure from the model
      // to extract the image.
    });

    // Check for inline data (image) in the response
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate render.");
  }
};
