import express from 'express';
const router = express.Router();
import { registerUser, loginUser, getUserProfile, sendOTP, verifyOTP, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/profile', protect, getUserProfile);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        const User = (await import('../models/userModel.js')).default;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profileImage: req.file.path },
            { new: true }
        );
        res.json({ profileImage: user.profileImage });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

export default router;
