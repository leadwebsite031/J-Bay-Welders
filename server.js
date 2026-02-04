const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛠️ FINAL CONFIGURATION 
const TELEGRAM_TOKEN = "8501162859:AAElIZjG9BnuXxBL9Lx2vP2k_pYA62Wb_v0"; 
const CHAT_ID = "8187670531";
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CEO TEST: This runs the moment you start the server to verify your Bot
const verifyBot = async () => {
    try {
        const res = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`);
        console.log(`✅ BOT CONNECTED: @${res.data.result.username}`);
        
        // Send a test message to your phone immediately to confirm Chat ID
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: "🛠️ J-Bay Welders System: BOT ONLINE & CONNECTED"
        });
        console.log(`✅ TEST MESSAGE SENT TO CHAT ID: ${CHAT_ID}`);
    } catch (err) {
        console.error("❌ CRITICAL ERROR: Your Token or Chat ID is invalid!");
        console.error(err.response ? err.response.data.description : err.message);
    }
};
verifyBot();

app.post('/api/lead', upload.single('image'), async (req, res) => {
    const { name, phone, service, description } = req.body;
    const image = req.file;

    const caption = `🚀 *NEW LEAD* \n👤 Name: ${name}\n📞 Phone: ${phone}\n🛠 Service: ${service}\n📝 Details: ${description}`;

    try {
        if (image) {
            const form = new FormData();
            form.append('chat_id', CHAT_ID);
            form.append('photo', image.buffer, { filename: 'job.jpg' });
            form.append('caption', caption);
            form.append('parse_mode', 'Markdown');
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, form, { headers: form.getHeaders() });
        } else {
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                chat_id: CHAT_ID, text: caption, parse_mode: 'Markdown'
            });
        }
        console.log("✅ Lead Forwarded to Telegram");
        res.status(200).send({ success: true });
    } catch (err) {
        console.error("❌ Send Error:", err.response ? err.response.data : err.message);
        res.status(500).send({ error: 'Failed' });
    }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

app.listen(10000, () => console.log("🚀 Server running on http://localhost:10000"));