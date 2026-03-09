const { Worker } = require('bullmq');
const Task = require('../models/Task');

const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
};

const setupWorker = () => {
    const worker = new Worker(
        'task-reminders',
        async (job) => {
            console.log(`[Worker] Processing job ${job.id} for task ${job.data.title}`);
            const { taskId } = job.data;

            // 1. Verify the task still exists and hasn't changed dramatically
            try {
                const task = await Task.findById(taskId);

                if (!task) {
                    console.log(`[Worker] Task ${taskId} no longer exists. Skipping reminder.`);
                    return;
                }

                if (task.status === 'Completed') {
                    console.log(`[Worker] Task ${taskId} is already completed. Skipping reminder.`);
                    return;
                }

                // 2. Here is where we would trigger the Push Notification to the user
                // e.g., using web-push to send to a service worker, or Firebase Cloud Messaging
                console.log(`[Worker] 🔔 ALERT: Task "${task.title}" is due soon!`);

            } catch (error) {
                console.error(`[Worker] Error processing job ${job.id}:`, error);
                throw error;
            }
        },
        { connection: redisOptions }
    );

    worker.on('completed', job => {
        console.log(`[Worker] Job ${job.id} has completed!`);
    });

    worker.on('failed', (job, err) => {
        console.log(`[Worker] Job ${job.id} has failed with ${err.message}`);
    });

    return worker;
};

module.exports = setupWorker;
