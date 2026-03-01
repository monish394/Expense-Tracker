import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// @desc    Analyze receipt image using AI
// @route   POST /api/receipts/analyze
// @access  Private
export const analyzeReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = req.file.path; // Cloudinary URL
        const apiKey = process.env.GEMINI_API_KEY;

        console.log('--- AI Scan Process Start ---');
        console.log('Image URL:', imageUrl);

        if (!apiKey) {
            console.error('ERROR: GEMINI_API_KEY is not set in environment.');
            throw new Error('AI component not configured correctly on server.');
        }

        // Initialize Gemini with stable v1 API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });

        // Fetch image and convert to base64
        const resp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(resp.data).toString('base64');
        const mimeType = req.file.mimetype;

        const prompt = `Analyze this receipt image and extract:
1. Store name (as "title")
2. Total amount as a number (as "amount")
3. Category (one of: Food, Transport, Entertainment, Shopping, Bills, Health, Education, Other)
4. Date in YYYY-MM-DD format (as "date")

Return ONLY a raw JSON object. No markdown.`;

        console.log('Sending to Gemini...');
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType } }
        ]);

        const textResponse = result.response.text();
        console.log('AI Raw Output:', textResponse);

        // Clean up markdown wrapping if present
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error('FAILED: AI response was not valid JSON.');
            throw new Error('AI could not identify receipt details clearly.');
        }

        const detectedData = JSON.parse(jsonMatch[0]);
        console.log('Parsed Data:', detectedData);

        res.status(200).json({ imageUrl, detectedData });

    } catch (error) {
        console.error('CRITICAL SCAN ERROR:', error);

        // Extract the most useful error message
        let details = error.message;
        if (error.response?.data?.error?.message) {
            details = error.response.data.error.message;
        }

        res.status(500).json({
            message: 'AI scanning failed',
            details: details
        });
    }
};
