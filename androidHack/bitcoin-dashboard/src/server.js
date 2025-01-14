const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const BOT_TOKEN = '7061190898:AAFGtWTHb79WjAWBmFPGfLRINxbnwg_TMmo';

app.post('/send-message', async (req, res) => {
    const { chat_id, text } = req.body;
    try {
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id,
            text,
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error sending message:', error.response.data);
        res.status(500).json(error.response.data);
    }
});

app.listen(4000, () => console.log('Proxy server running on port 4000'));
