
import axios from 'axios';

const testApi = async () => {
    try {
        console.log('Testing Registration...');
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Agent',
            email: `test_${Date.now()}@example.com`,
            password: 'password123'
        });
        console.log('✅ Registration SUCCESS:', regRes.data);

        console.log('\nTesting Login...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: regRes.data.email,
            password: 'password123'
        });
        console.log('✅ Login SUCCESS:', loginRes.data);
    } catch (err) {
        console.error('❌ API Test FAILED:');
        console.error(err.response?.data || err.message);
    }
};

testApi();
