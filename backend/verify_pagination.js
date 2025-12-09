import axios from 'axios';

async function testPagination() {
    const baseURL = 'http://localhost:3001/api/productos';

    console.log('🧪 Testing Pagination Logic...');

    try {
        // Test 1: Reasonable limit
        console.log('\n1️⃣ Requesting limit=10...');
        const res1 = await axios.get(`${baseURL}?limit=10`);
        if (res1.data.data.length <= 10 && res1.data.limit === 10) {
            console.log('✅ Reasonable limit respected.');
        } else {
            console.error('❌ Failed reasonable limit test.', res1.data.limit);
        }

        // Test 2: Excessive limit
        console.log('\n2️⃣ Requesting limit=1000 (Should be capped at 100)...');
        const res2 = await axios.get(`${baseURL}?limit=1000`);
        if (res2.data.limit === 100 && res2.data.data.length <= 100) {
            console.log('✅ Excessive limit capped successfully at 100.');
        } else {
            console.error(`❌ Failed capping test. Got limit: ${res2.data.limit}`);
        }

        // Test 3: Metadata check
        if (res2.data.page && res2.data.pages && res2.data.total) {
            console.log('✅ Pagination metadata present.');
        } else {
            console.error('❌ Missing pagination metadata.');
        }

    } catch (error) {
        console.error('❌ Error during testing:', error.message);
    }
}

testPagination();
