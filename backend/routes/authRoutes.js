import express from 'express';
const router = express.Router();
import { registerUser, loginUser, getUserProfile, sendOTP, verifyOTP, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

import User from '../models/userModel.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/profile', protect, getUserProfile);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        console.log('--- Profile Avatar Upload ---');
        console.log('User ID:', req.user._id);
        console.log('Cloudinary URL:', req.file.path);

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage: req.file.path },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Avatar updated successfully',
            profileImage: updatedUser.profileImage
        });
    } catch (err) {
        console.error('Avatar Upload Error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

export default router;
