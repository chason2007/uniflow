const express = require('express');
const multer = require('multer');
const { uploadSyllabus } = require('../controllers/syllabusController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('syllabus'), uploadSyllabus);

module.exports = router;
