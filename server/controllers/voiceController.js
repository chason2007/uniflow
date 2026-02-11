const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

const processVoiceCommand = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
    }

    try {
        const audioPart = fileToGenerativePart(req.file.path, req.file.mimetype || "audio/mp3");

        const prompt = `
      Listen to this voice command from a student.
      Extract the intent and structured data.
      Return a JSON object with:
      - "intent": "create" | "update" | "delete" | "query"
      - "task_name": string (Target task name, if applicable)
      - "new_date": string (ISO 8601 date, if applicable)
      - "new_title": string (If renaming)
      - "category": string (If creating a new task, e.g. "Exam", "Project")
      
      Return ONLY the JSON object.
    `;

        const result = await model.generateContent([prompt, audioPart]);
        const response = await result.response;
        const text = response.text();

        // Clean up
        fs.unlinkSync(req.file.path);

        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const intentData = JSON.parse(jsonString);

        res.json({ message: "Voice command processed", data: intentData });
    } catch (error) {
        console.error("Voice processing error:", error);
        res.status(500).json({ error: "Failed to process voice command" });
    }
};

module.exports = { processVoiceCommand };
