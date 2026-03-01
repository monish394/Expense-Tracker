import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
//made changesss
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/receipts', receiptRoutes);

// Serve frontend
const buildPath = path.resolve(__dirname, '../dist');
const indexFile = path.join(buildPath, 'index.html');

// Serve static assets first
app.use(express.static(buildPath));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is running perfectly!' });
});

// For any other route, serve index.html if it exists, otherwise return 404
app.get('*', (req, res) => {
    if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(404).json({
            message: 'No frontend build found. Please run "npm run build" and check your paths.',
            currentDir: __dirname,
            lookedAt: indexFile,
            mode: process.env.NODE_ENV
        });
    }
});

// Start Serverrrr
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Serving frontend from: ${buildPath}`);
});
