const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini
// Note: Requires GEMINI_API_KEY in backend/.env
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

router.post("/detect", async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: "No image provided" });
        }

        // The frontend sends image as a Data URL (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
        // We need to strip the prefix to get just the raw base64 string and the mime type
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            throw new Error("Invalid base64 image format");
        }

        const mimeType = matches[1];
        const base64Data = matches[2];

        // Construct the prompt for strict categorization
        const prompt = `
            Analyze this image of waste.
            Categorize the primary object strictly into ONE of these types: "plastic", "food", "paper", "glass", "metal", "e-waste", or "other".
            Provide a detailed, practical 1-2 sentence instruction on exactly how to prepare and dispose of or recycle this specific item.
            You MUST return ONLY a raw JSON object with no markdown formatting or backticks.
            Example format: {"type": "plastic", "suggestion": "Rinse the bottle out to remove any residue, crush it to save space, and place it in your local blue recycling bin."}
        `;

        // Call Gemini 2.5 Flash API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ],
            config: {
                temperature: 0.2, // Lower temp for more deterministic categorization
            }
        });

        const textOutput = response.text;

        // Ensure no markdown remnants exist (sometimes AI adds ```json)
        const cleanJsonStr = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiResult = JSON.parse(cleanJsonStr);

        res.json({
            type: aiResult.type.toLowerCase(),
            suggestion: aiResult.suggestion
        });

    } catch (error) {
        console.error("AI Detection Error:", error.message);

        // Fallback to dummy generation if API key is missing or fails, to keep app functional
        console.log("Falling back to random classification due to error.");
        const types = ["plastic", "food", "paper", "metal", "glass"];
        const random = types[Math.floor(Math.random() * types.length)];

        res.json({
            type: random,
            suggestion: `(Fallback) Please recycle this ${random} responsibly.`
        });
    }
});

const Waste = require("../models/Waste");
const { protect } = require("../middleware/authMiddleware");

router.get("/suggestions", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch user's recent waste logs to provide context to the AI
        const recentLogs = await Waste.find({ userId: userId }).sort({ date: -1 }).limit(10);

        let contextPrompt = "The user has no recent waste logs. Give them 3 general tips for getting started with zero waste.";

        if (recentLogs.length > 0) {
            const logSummary = recentLogs.map(log => `${log.quantity}kg of ${log.type}`).join(", ");
            contextPrompt = `The user recently recycled/disposed of the following: ${logSummary}. Based on this specific data, provide 3 highly relevant and personalized suggestions.`;
        }

        const prompt = `
            You are an expert environmentalist AI. ${contextPrompt}
            Generate exactly 3 waste reduction or recycling suggestions. 
            Ensure these suggestions are completely novel and unique compared to standard generic advice.
            Random Seed: ${Math.random() * 10000} (Use this to introduce extreme variance in the tips you choose).
            Return a pure JSON array of objects. Do NOT use markdown code blocks (\`\`\`).
            Each object MUST have these exactly these keys:
            - "title" (string, max 50 chars)
            - "description" (string, 1-2 sentences explaining why and how)
            - "icon" (string, choose one exactly from this list: "Recycle", "Leaf", "Zap", "Target", "Lightbulb")
            - "color" (string, choose one exactly from this list: "blue", "green", "yellow", "purple", "indigo")
            - "impact" (string, short badge text like "High Impact", "Medium Impact", "Easy Win", "Action Required")
            
            Example Format:
            [
                {"title": "Switch to Reusable Bags", "description": "You generate high plastic waste. Cloth bags help.", "icon": "Recycle", "color": "blue", "impact": "High Impact"}
            ]
        `;

        if (!ai) {
            throw new Error("No AI initialized. API Key missing.");
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.9, // Higher temp for more variety
            }
        });

        const textOutput = response.text;

        // Clean markdown backticks if AI accidentally adds them
        const cleanJsonStr = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiResult = JSON.parse(cleanJsonStr);

        res.json(aiResult);

    } catch (error) {
        console.error("AI Suggestions Error:", error.message);

        // Fallback suggestions if AI fails
        const allFallbacks = [
            { id: 1, title: "Start Composting Food", description: "Your organic waste has increased. A small home compost bin can turn this into fertilizer.", icon: "Leaf", color: "green", impact: "Medium Impact" },
            { id: 2, title: "Bulk Buying Dry Goods", description: "Purchasing from bulk bins using your own jars eliminates packaging waste.", icon: "Target", color: "blue", impact: "High Impact" },
            { id: 3, title: "Ditch Single-Use Cups", description: "Bringing your own thermos saves an average of 23 lbs of waste per year.", icon: "Lightbulb", color: "yellow", impact: "Easy Win" },
            { id: 4, title: "Switch to LED Bulbs", description: "LED bulbs use up to 90% less energy and last much longer than incandescent bulbs.", icon: "Zap", color: "yellow", impact: "Easy Win" },
            { id: 5, title: "Unplug Idle Devices", description: "Standby power accounts for 5-10% of residential energy use. Unplug chargers when not in use.", icon: "Zap", color: "purple", impact: "Medium Impact" },
            { id: 6, title: "Repurpose Glass Jars", description: "Instead of throwing away glass jars, use them for storing leftovers or organizing small items.", icon: "Recycle", color: "blue", impact: "Easy Win" },
            { id: 7, title: "Try Meatless Mondays", description: "Reducing meat consumption one day a week significantly lowers your carbon footprint.", icon: "Leaf", color: "green", impact: "Medium Impact" },
            { id: 8, title: "Go Paperless", description: "Switch your bank statements and bills to digital versions to save trees and reduce clutter.", icon: "Target", color: "indigo", impact: "Easy Win" },
            { id: 9, title: "Donate Used Electronics", description: "E-waste contains toxic chemicals. Donating items keeps them out of landfills and gives them a second life.", icon: "Recycle", color: "purple", impact: "High Impact" },
            { id: 10, title: "Mend Broken Items", description: "Before tossing a ripped shirt or broken chair, try fixing it to extend its lifespan and reduce waste.", icon: "Target", color: "yellow", impact: "High Impact" },
            { id: 11, title: "Use Cloth Napkins", description: "Switching from paper to cloth napkins is an easy way to reduce daily paper waste.", icon: "Leaf", color: "green", impact: "Easy Win" },
            { id: 12, title: "Buy Second-Hand", description: "Purchasing thrifted clothing or furniture extends product life and reduces manufacturing emissions.", icon: "Recycle", color: "blue", impact: "High Impact" }
        ];

        // Randomly select 3 fallbacks
        const shuffled = allFallbacks.sort(() => 0.5 - Math.random());
        res.json(shuffled.slice(0, 3));
    }
});

module.exports = router;
