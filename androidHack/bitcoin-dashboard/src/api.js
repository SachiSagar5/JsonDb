const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Telegram Bot Configurations
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';

// Set up file upload storage
const upload = multer({ dest: 'uploads/' });
const app = express();
const PORT = 4000;

// Trigger URL to sync files
app.post('/sync', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // Send file to Telegram
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
            chat_id: CHAT_ID,
            document: fs.createReadStream(filePath),
        }, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Cleanup uploaded file after sending
        fs.unlinkSync(filePath);
        res.status(200).json({ message: 'File synced to Telegram!', data: response.data });
    } catch (error) {
        console.error('Error syncing file:', error);
        res.status(500).json({ message: 'Failed to sync file.', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
