import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_PROMPT = `You are "Amazon Product Intelligence AI System", a multi-agent enterprise-grade SaaS AI.

You simulate a team of expert AI agents:

1. Market Research Agent
- Detects product demand, trends, and competition level.

2. Pricing Analyst Agent
- Evaluates price competitiveness and value-for-money score.

3. Quality Analyst Agent
- Analyzes product quality, reviews, durability, and trust signals.

4. Conversion Prediction Agent
- Predicts sales potential and buyer intent probability.

5. Final Decision Agent (Orchestrator)
- Combines all scores and selects the BEST product.

RULES:
- Always think in structured multi-agent flow.
- Never respond as a single model; simulate collaboration.
- Always return JSON output.
- Be data-driven, not emotional.
- Optimize for Amazon affiliate revenue and conversion.
- Prefer high demand + high conversion + high margin products.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    market_insight: { type: Type.STRING, description: "Detailed 2-3 sentences of market analysis." },
    price_score: { type: Type.NUMBER, description: "Score out of 100 for price competitiveness." },
    quality_score: { type: Type.NUMBER, description: "Score out of 100 for quality and trust." },
    conversion_score: { type: Type.NUMBER, description: "Score out of 100 for predicted conversion likelihood." },
    final_score: { type: Type.NUMBER, description: "Combined final score out of 100." },
    best_product: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Name of the best product in this category." },
        description: { type: Type.STRING, description: "Why this product was chosen." },
        estimated_price: { type: Type.STRING, description: "Estimated price range (e.g., '$40 - $60')." },
        amazon_search_query: { type: Type.STRING, description: "Query to find this product on Amazon." }
      },
      required: ["name", "description", "estimated_price", "amazon_search_query"]
    }
  },
  required: ["market_insight", "price_score", "quality_score", "conversion_score", "final_score", "best_product"]
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route
  app.post("/api/analyze", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: `Find the best product for the category/query: "${query}"`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.2, // For analytical consistency
        }
      });

      const responseText = response.text();
      if (!responseText) {
        throw new Error("No response from AI.");
      }

      const jsonOutput = JSON.parse(responseText);
      res.json(jsonOutput);
    } catch (error) {
      console.error("Error analyzing product:", error);
      res.status(500).json({ error: "Internal server error analyzing the product." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
