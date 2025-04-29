// index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.GEMINI_API_KEY;

// --- Array of Prompt Templates ---
const promptTemplates = [
  // Heartfelt & Appreciative (1-10)
  "Generate a concise (3-4 sentences) heartfelt message for my best friend Abhilasha, celebrating __DAYS__ days of friendship (since Sep 16, 2024). Mention how much her support means.",
  "Write a warm note for Abhilasha for __DAYS__ days of friendship. Focus on gratitude for her presence in my life. Keep it short and sincere.",
  "Craft a message for Abhilasha appreciating __DAYS__ days of true friendship. Mention a specific quality you admire in her (e.g., kindness, strength, humor). Concise (3-4 sentences).",
  "__DAYS__ days with my amazing friend Abhilasha! Write a short message expressing how lucky I feel to have her. Keep it warm and genuine.",
  "Generate a message for Abhilasha celebrating __DAYS__ days. Focus on the comfort and ease of your friendship. Keep it concise and loving.",
  "Write a short appreciation message for Abhilasha (__DAYS__ days). Mention how she makes the world brighter or better.",
  "__DAYS__ days of friendship! Create a message for Abhilasha thanking her for always being there. Keep it heartfelt and brief (3-4 sentences).",
  "Generate a warm message for Abhilasha about __DAYS__ days of connection. Mention the value of your bond.",
  "Craft a concise note for Abhilasha celebrating __DAYS__ days. Express simple, genuine appreciation for who she is.",
  "Write a message for Abhilasha about __DAYS__ days of friendship. Mention how much you cherish the connection. (3-4 sentences).",
  // Poetic & Reflective (11-20)
  "Generate a short, slightly poetic message for Abhilasha about __DAYS__ days of friendship. Use a metaphor like sunshine, anchor, or music.",
  "Write a reflective note for Abhilasha on __DAYS__ days together. Mention the beauty of the journey so far. Concise (3-4 sentences).",
  "Craft a poetic message for Abhilasha celebrating __DAYS__ days. Focus on her inner beauty or spirit. Keep it brief and warm.",
  "__DAYS__ days of friendship! Write a message for Abhilasha comparing her laugh or smile to something beautiful (stars, melody). Keep it concise.",
  "Generate a message for Abhilasha about the 'color' she brings to life after __DAYS__ days of friendship. Keep it short and artistic.",
  "Write a concise (3-4 sentences) message for Abhilasha using nature imagery (seasons, ocean) to describe __DAYS__ days of friendship.",
  "Reflecting on __DAYS__ days with Abhilasha. Write a short message about the quiet magic of your bond.",
  "Craft a brief, poetic message for Abhilasha celebrating __DAYS__ days. Focus on the feeling of 'home' or belonging in the friendship.",
  "Generate a message for Abhilasha for __DAYS__ days, describing her with an appreciative, slightly poetic adjective (e.g., radiant, steadfast).",
  "Write a short, reflective message for Abhilasha about the shared story you're writing together over __DAYS__ days.",
  // Fun & Playful (21-30)
  "__DAYS__ days of fun with my bestie Abhilasha! Generate a lighthearted message celebrating our adventures. Keep it concise (3-4 sentences) and cheerful.",
  "Write a fun message for Abhilasha marking __DAYS__ days of friendship. Mention how she makes even boring moments fun.",
  "Craft a slightly cheeky but loving message for Abhilasha (__DAYS__ days). Maybe hint at an inside joke concept (without specifics). Keep it short.",
  "Happy __DAYS__ days to my partner-in-crime, Abhilasha! Write a fun, short message celebrating the mischief.",
  "Generate a playful message for Abhilasha about surviving __DAYS__ days of each other's weirdness. Keep it affectionate and brief.",
  "Write a message for Abhilasha celebrating __DAYS__ days and how much you laugh together. Keep it concise and happy.",
  "__DAYS__ days! Craft a message for Abhilasha telling her she's still your favorite person to be silly with. (3-4 sentences).",
  "Generate a fun message for Abhilasha celebrating __DAYS__ days. Mention a shared interest or quirky habit. Keep it light.",
  "Write a short, upbeat message for Abhilasha about __DAYS__ days of friendship. Mention looking forward to more laughs.",
  "Craft a fun appreciation note for Abhilasha (__DAYS__ days). Tell her she's awesome in a playful way. (3-4 sentences).",
  // Future-Focused & Encouraging (31-40)
  "Generate a concise message (3-4 sentences) for Abhilasha celebrating __DAYS__ days and looking forward to many more adventures together.",
  "Write a hopeful message for Abhilasha about __DAYS__ days of friendship and the amazing future ahead for her/both of you.",
  "__DAYS__ days down, a lifetime of friendship to go! Craft a short, excited message for Abhilasha about future plans or dreams.",
  "Generate a message for Abhilasha celebrating __DAYS__ days. Express excitement for seeing her achieve her goals.",
  "Write an encouraging note for Abhilasha (__DAYS__ days). Tell her you're always cheering her on. Keep it brief and supportive.",
  "Craft a message for Abhilasha about __DAYS__ days, focusing on growing together and supporting each other's journeys. (3-4 sentences).",
  "Generate a message for Abhilasha celebrating __DAYS__ days, saying you can't wait to see what the next chapter holds for your friendship.",
  "Write a forward-looking message for Abhilasha (__DAYS__ days). Mention a specific shared hope or goal.",
  "__DAYS__ days of friendship! Create a short message for Abhilasha about building more amazing memories together.",
  "Generate a concise, supportive message for Abhilasha (__DAYS__ days). Wish her success and happiness in her endeavors.",
  // Memory-Based & Simple (41-50)
  "Remember that time...? Generate a short message for Abhilasha referencing the fun of shared memories over __DAYS__ days.",
  "Write a simple message for Abhilasha: 'Happy __DAYS__ days of friendship! So glad we're friends.' Keep it direct and sweet.",
  "Craft a message for Abhilasha celebrating __DAYS__ days. Mention one small, everyday thing you appreciate about the friendship. (3-4 sentences).",
  "__DAYS__ days! Generate a simple, warm message for Abhilasha just saying hello and celebrating the milestone.",
  "Write a brief note for Abhilasha: '__DAYS__ days of knowing you - lucky me! Thinking of you.'",
  "Generate a concise message for Abhilasha celebrating __DAYS__ days. Focus on a feeling the friendship inspires (e.g., joy, comfort).",
  "Happy __DAYS__ days, Abhilasha! Write a super short message just celebrating this.",
  "Craft a simple message for Abhilasha (__DAYS__ days): 'Here's to our awesome friendship!'",
  "Generate a quick message for Abhilasha: '__DAYS__ days and counting! Cheers to us.'",
  "Write a very short message for Abhilasha celebrating __DAYS__ days: 'Amazing friend, amazing __DAYS__ days!'"
];
// --- End Prompt Templates ---


// --- Middleware ---
const allowedOrigins = [
  'http://localhost:5173', // For local development
  // Add your Vercel app's URL or other allowed origins here
  'https://<your-app-name>.vercel.app' // Placeholder - replace!
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy does not allow access from the specified Origin: ${origin}`;
      console.error(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());
// ------------------

// --- Initialize Gemini AI Client ---
let genAI;
let model;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or your preferred model
    console.log("Gemini AI Client Initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini AI Client:", error);
  }
} else {
    console.warn('Warning: GEMINI_API_KEY environment variable is not set. API calls will fail.');
}
// ------------------------------------

// --- *** UPDATED API Endpoint for Abhilasha *** ---
app.get('/api/generate-message', async (req, res) => {
  console.log(`--- Handling GET /api/generate-message --- Request origin: ${req.headers.origin}`);

  // Check if AI Client is ready
  if (!genAI || !model) {
    console.error("Gemini AI client not initialized.");
    return res.status(500).json({ error: "Backend AI service not configured." });
  }

  // --- Get 'days' from query parameter ---
  const daysTogether = req.query.days;
  if (daysTogether === undefined || isNaN(parseInt(daysTogether))) {
      console.error("Invalid or missing 'days' query parameter.");
      return res.status(400).json({ error: "Days parameter is required and must be a number." });
  }
  const daysNum = parseInt(daysTogether);
  console.log(`Received days of togetherness: ${daysNum}`);
  // --- End Get Days ---

  try {
    console.log("--- Entering Message Generation Try Block ---");

    // --- Randomly Select and Prepare Prompt ---
    const randomIndex = Math.floor(Math.random() * promptTemplates.length);
    const selectedTemplate = promptTemplates[randomIndex];
    // Replace the placeholder __DAYS__ with the actual number
    const prompt = selectedTemplate.replace(/__DAYS__/g, daysNum.toString());
    // --- End Select/Prepare Prompt ---


    // --- Define Generation Config for more uniqueness ---
    const generationConfig = {
      temperature: 0.9, // Higher value (0.0-1.0) for more creative/unique responses
    };
    // --- End Define Generation Config ---


    console.log("--- Sending Prompt to Gemini ---");
    console.log("Using Prompt:", prompt); // Log the final prompt being sent

    // --- Call Gemini ---
    // Pass the prompt (within contents object) and the generationConfig
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig, // Add the config here
    });
    // --- End Call Gemini ---

    console.log("--- Gemini Call Completed ---");
    const response = result.response;

     if (!response) {
        console.error("No response object received from generateContent result.");
        throw new Error("Empty response object from AI model generation.");
    }

    const candidate = response.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        let blockReason = "Blocked or empty content"; // Default reason
        let safetyRatings = null;
        if (response.promptFeedback?.blockReason) {
            blockReason = response.promptFeedback.blockReason;
        } else if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
             blockReason = `Generation stopped: ${candidate.finishReason}`;
             safetyRatings = candidate.safetyRatings;
        }
        console.error("Content generation blocked or failed:", blockReason, safetyRatings ? `Safety Ratings: ${JSON.stringify(safetyRatings)}` : '');
        return res.status(400).json({ error: `Message generation failed: ${blockReason}` });
    }

    const aiResponseText = response.text();
    console.log("Generated AI Response:", aiResponseText);


    // --- Send Response ---
    console.log("--- Sending Success JSON ---");
    res.status(200).json({ message: aiResponseText });
    // --- End Sending Response ---

  } catch (error) {
    console.error("--- Caught Error During API Handling ---");
    console.error("Error details:", error);
    let errorMessage = "Failed to process request due to an internal server error.";
    let statusCode = 500;

    // Add specific error handling if needed (e.g., Gemini API errors)
    if (error.message?.includes("GoogleGenerativeAI")) {
         errorMessage = error.message || "AI service request failed.";
         statusCode = error.status || (error.cause?.status) || 502;
    }

    console.error(`--- Sending Error JSON (Status: ${statusCode}) ---`);
    res.status(statusCode).json({ error: errorMessage });
  }
  console.log("--- Handler End ---");
});

// --- Start Server (for local testing) ---
app.listen(port, () => {
  console.log(`[dev:backend] Backend server listening locally on http://localhost:${port}`);
});
// --- End Start Server ---

// Export the app for Vercel (Essential for Vercel deployment!)
export default app;