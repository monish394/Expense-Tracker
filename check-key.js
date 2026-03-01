import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function checkKey() {
    const key = process.env.GEMINI_API_KEY;
    console.log('Checking with key:', key);
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const { data } = await axios.get(url);
        console.log('✅ Success! Found models:', data.models.length);
    } catch (err) {
        console.log('❌ Error! Details:');
        console.log(err.response?.data || err.message);
    }
}
checkKey();
