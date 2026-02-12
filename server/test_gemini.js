const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
    try {
        const prompt = "Hello, are you working?";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success:", text);
    } catch (error) {
        console.error("Error details:", JSON.stringify(error, null, 2));
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", await error.response.text());
        }
    }
}

run();
