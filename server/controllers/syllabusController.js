const fs = require('fs');
const pdf = require('pdf-parse'); // Need to install this
const { extractSyllabusData } = require('../utils/gemini');

// Placeholder for Supabase integration
// const supabase = require('../utils/supabase'); 

const uploadSyllabus = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdf(dataBuffer);
        const text = data.text;

        if (!text) {
            return res.status(400).json({ error: "Could not extract text from PDF" });
        }

        const tasks = await extractSyllabusData(text);

        // TODO: Save tasks to Supabase
        // const { error } = await supabase.from('tasks').insert(tasks);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ message: "Syllabus processed successfully", tasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process syllabus" });
    }
};

module.exports = { uploadSyllabus };
