import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

// @desc    Analyze receipt image using AI
// @route   POST /api/receipts/analyze
// @access  Private
export const analyzeReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = req.file.path;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(200).json({
                imageUrl,
                detectedData: {
                    title: 'Detected Receipt',
                    amount: '0.00',
                    category: 'Other',
                    date: new Date().toISOString().split('T')[0],
                    note: 'Please provide a valid GEMINI_API_KEY in .env to enable AI scanning.'
                }
            });
        }

        // Use the new @google/genai SDK
        const ai = new GoogleGenAI({ apiKey });

        // Fetch image and convert to base64
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(response.data).toString('base64');
        const mimeType = req.file.mimetype;

        const prompt = `Analyze this receipt image and extract the following information in JSON format only:
{
  "title": "short description or store name",
  "amount": "total amount as a number string",
  "category": "one of: Food, Transport, Entertainment, Shopping, Bills, Health, Education, Other",
  "date": "transaction date in YYYY-MM-DD format"
}
Only return the raw JSON object. No markdown, no explanation.`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType,
                                data: imageBase64
                            }
                        }
                    ]
                }
            ]
        });

        const textResponse = result.text;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('AI failed to parse receipt data');
        }

        const detectedData = JSON.parse(jsonMatch[0]);

        res.status(200).json({ imageUrl, detectedData });

    } catch (error) {
        console.error('Receipt analysis error:', error);
        res.status(500).json({ message: 'Failed to analyze receipt', error: error.message });
    }
};
