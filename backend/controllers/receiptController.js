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

        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            console.warn('AI Scanning called without a valid GEMINI_API_KEY');
            return res.status(200).json({
                imageUrl,
                detectedData: {
                    title: 'Detected Receipt',
                    amount: '0.00',
                    category: 'Other',
                    date: new Date().toISOString().split('T')[0],
                    note: 'AI scanning is disabled. Add GEMINI_API_KEY to enable it.'
                }
            });
        }

        // Initialize Gemini with standard SDK
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Fetch image and convert to base64
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(response.data).toString('base64');
        const mimeType = req.file.mimetype;

        const prompt = `Analyze this receipt image and extract:
1. Store name or short description (as "title")
2. Total amount as a number (as "amount")
3. Category (must be one of: Food, Transport, Entertainment, Shopping, Bills, Health, Education, Other)
4. Date in YYYY-MM-DD format (as "date")

Return ONLY a raw JSON object like this:
{
  "title": "Starbucks",
  "amount": 450,
  "category": "Food",
  "date": "2024-03-24"
}`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBase64,
                    mimeType
                }
            }
        ]);

        const textResponse = result.response.text();
        // Clean up any markdown code blocks if the AI includes them
        const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error('AI Response was not valid JSON:', textResponse);
            throw new Error('AI could not parse the receipt structure');
        }

        const detectedData = JSON.parse(jsonMatch[0]);
        console.log('AI detected data:', detectedData);

        res.status(200).json({ imageUrl, detectedData });

    } catch (error) {
        console.error('Receipt analysis error details:', error);
        res.status(500).json({
            message: 'AI scanning failed. Please enter details manually.',
            error: error.message
        });
    }
};
