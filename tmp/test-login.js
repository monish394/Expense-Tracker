
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './backend/models/userModel.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'test@example.com';
        const password = 'password123';

        // Find or create test user
        let user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('Creating test user...');
            user = await User.create({
                name: 'Test User',
                email,
                password
            });
            console.log('User created');
        }

        console.log('User details:', {
            id: user._id,
            email: user.email,
            hasPassword: !!user.password,
            monthlyIncome: user.monthlyIncome
        });

        const isMatch = await user.matchPassword(password);
        console.log('Password match:', isMatch);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Test Failed:', err);
    }
}

test();
