const express = require('express');
const multer = require('multer');
const { processVoiceCommand } = require('../controllers/voiceController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/command', upload.single('audio'), processVoiceCommand);

module.exports = router;
