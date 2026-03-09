require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unipilot';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected successfully');

        // Initialize BullMQ Worker Engine
        const setupWorker = require('./services/reminderWorker');
        const worker = setupWorker();
        console.log('BullMQ Background Worker Daemon started');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
