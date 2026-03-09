const { Queue } = require('bullmq');
const { getRedisOptions } = require('./redisConfig');

let reminderQueue;

// Asynchronously initialize queue
async function initQueue() {
    const redisOptions = await getRedisOptions();
    reminderQueue = new Queue('task-reminders', {
        connection: redisOptions
    });
}

/**
 * Schedule a reminder for a task
 * @param {Object} taskData - The task object from the database
 * @param {Number} delayMs - Milliseconds until the reminder should fire
 */
const scheduleReminder = async (taskData, delayMs) => {
    try {
        if (!reminderQueue) await initQueue();
        await reminderQueue.add(
            `reminder-${taskData._id}`,
            { taskId: taskData._id, title: taskData.title },
            {
                delay: delayMs,
                jobId: `job-${taskData._id}-${delayMs}` // Prevent duplicate jobs for the same time
            }
        );
        console.log(`[Queue] Scheduled reminder for task "${taskData.title}" in ${delayMs / 1000}s`);
    } catch (error) {
        console.error('[Queue] Failed to schedule reminder', error);
    }
};

/**
 * Cancel existing reminders if a task is rescheduled or deleted
 * @param {String} taskId 
 */
const cancelReminders = async (taskId) => {
    try {
        if (!reminderQueue) await initQueue();
        const jobs = await reminderQueue.getJobs(['delayed', 'waiting']);
        for (const job of jobs) {
            if (job.data.taskId === taskId) {
                await job.remove();
                console.log(`[Queue] Removed stale reminder job ${job.id}`);
            }
        }
    } catch (error) {
        console.error('[Queue] Failed to cancel reminders', error);
    }
};

module.exports = {
    initQueue,
    get queue() { return reminderQueue; }, // Export as getter so it resolves after initialization
    scheduleReminder,
    cancelReminders
};
