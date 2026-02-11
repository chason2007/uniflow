const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Student Productivity App API is running');
});

app.use('/api/syllabus', require('./routes/syllabus'));
app.use('/api/voice', require('./routes/voice'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
