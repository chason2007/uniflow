const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function extractSyllabusData(text) {
    const prompt = `
    Extract all deadlines, quizzes, assignments, and exams from the following text into a valid JSON array.
    Each item in the array should have:
    - "title": string (Name of the task)
    - "date": string (ISO 8601 format YYYY-MM-DD, or best guess)
    - "category": string ("Exam", "Quiz", "Project", "Assignment")
    - "description": string (Optional details)

    Text:
    ${text}
    
    Return ONLY the JSON array. No markdown formatting.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up potential markdown code blocks
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error parsing syllabus with Gemini:", error);
        throw new Error("Failed to process syllabus");
    }
}

async function parseVoiceIntent(transcript) {
    const prompt = `
    Analyze the following voice command regarding a student's schedule:
    "${transcript}"
    
    Return a JSON object with:
    - "intent": "create" | "update" | "delete" | "query"
    - "task_name": string (Target task name, if applicable)
    - "new_date": string (ISO 8601 date, if applicable)
    - "new_title": string (If renaming)
    - "category": string (If creating a new task)
    
    Return ONLY the JSON object.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error parsing voice intent:", error);
        throw new Error("Failed to process voice command");
    }
}

module.exports = { extractSyllabusData, parseVoiceIntent };
