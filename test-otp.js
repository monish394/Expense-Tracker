import axios from 'axios';
async function testOTP() {
    try {
        const url = 'http://localhost:5000/api/auth/send-otp';
        console.log('Sending OTP request to:', url);
        const { data } = await axios.post(url, { email: 'test@example.com' });
        console.log('✅ Success:', data);
    } catch (err) {
        console.log('❌ Error:', err.response?.data || err.message);
    }
}
testOTP();
