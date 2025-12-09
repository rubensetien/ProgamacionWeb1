import axios from 'axios';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testRateLimit() {
    const url = 'http://localhost:3001/api/auth/login';
    console.log('Testing Rate Limit on Login...');

    for (let i = 1; i <= 7; i++) {
        try {
            const response = await axios.post(url, {
                email: 'test@rate.limit',
                password: 'wrongpassword'
            }, { validateStatus: false });

            console.log(`Request ${i}: Status ${response.status}`);
            if (response.status === 429) {
                console.log('✅ Rate limit triggered successfully!');
                return;
            }
        } catch (error) {
            console.error(`Request ${i} error:`, error.message);
        }
    }
    console.log('❌ Rate limit NOT triggered after 7 requests.');
}

testRateLimit();
