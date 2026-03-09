const Task = require('../models/Task');
const { scheduleReminder, cancelReminders } = require('../services/queueService');

exports.parseVoiceToTask = async (req, res) => {
    try {
        const { text, userTimezone } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        console.log(`[AI Engine] Parsing request: "${text}" with TZ: ${userTimezone}`);

        const lowerText = text.toLowerCase();

        // Simulate AI Intent Detection
        let intent = 'CREATE';
        if (lowerText.includes('change') || lowerText.includes('move') || lowerText.includes('update') || lowerText.includes('delay')) {
            intent = 'UPDATE';
        } else if (lowerText.includes('delete') || lowerText.includes('remove') || lowerText.includes('cancel')) {
            intent = 'DELETE';
        }

        // Simulate Parsing logic
        let mockExtractedData = {};

        if (intent === 'CREATE') {
            const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
            mockExtractedData = {
                _id: 'mock-id-' + Date.now(), // Simulated DB ID needed for Queue
                title: "Generated from: " + text.substring(0, 20) + "...",
                currentDueDate: dueDate.toISOString(),
                category: lowerText.includes('quiz') ? 'Quiz' : (lowerText.includes('project') ? 'Project' : 'Assignment')
            };

            // Schedule reminder to fire 2 hours before the due date
            const delayMs = dueDate.getTime() - Date.now() - (2 * 60 * 60 * 1000);
            if (delayMs > 0) {
                await scheduleReminder(mockExtractedData, delayMs);
            }

        } else if (intent === 'UPDATE') {
            // Mocking target entity extraction ("the quiz", "history paper")
            mockExtractedData = {
                targetEntity: lowerText.replace(/(change|move|update|delay|to)/gi, '').trim(),
                newDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Move out 3 days
            };
            // In a real DB scenario, we would `await cancelReminders(taskId)` here
            // and then reschedule it with the new date.

        } else if (intent === 'DELETE') {
            mockExtractedData = {
                targetEntity: lowerText.replace(/(delete|remove|cancel)/gi, '').trim()
            };
            // In a real DB scenario, we would `await cancelReminders(taskId)` here
        }

        return res.status(200).json({
            success: true,
            action: intent,
            data: mockExtractedData
        });

    } catch (error) {
        console.error("AI Parsing Error", error);
        res.status(500).json({ error: 'Failed to process AI task' });
    }
};
