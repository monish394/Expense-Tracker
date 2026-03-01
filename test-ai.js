import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in .env');
        return;
    }

    console.log('🔑 Using API Key starting with:', apiKey.substring(0, 8) + '...');
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log('📡 Fetching available models...');
        // The listModels method is on the genAI instance
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error('❌ API Error:', data.error.message);
            return;
        }

        console.log('\n✅ Available Models for your key:');
        data.models.forEach(m => {
            console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
        });

    } catch (err) {
        console.error('❌ Failed to fetch models:', err.message);
    }
}

listModels();
