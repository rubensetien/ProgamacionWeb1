import axios from 'axios';

async function testExtendedPagination() {
    const baseURL = 'http://localhost:3001/api';
    console.log('🧪 Testing Extended Pagination protection...');

    try {
        // 1. Login to get token
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            email: 'testadmin@regma.es',
            password: 'testadmin123'
        }, { validateStatus: false });

        if (loginRes.status !== 200) {
            console.log('⚠️ Could not login as admin. Skipping protected routes verification.');
            console.log('Login Status:', loginRes.status);
            return;
        }

        const token = loginRes.data.accessToken;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Auth successful. Token received.');

        const endpoints = [
            { name: 'Usuarios', url: '/usuarios?limit=1000' },
            { name: 'Inventario', url: '/inventario?limit=1000' },
            { name: 'Ubicaciones', url: '/ubicaciones?limit=1000' },
            { name: 'Mis Pedidos', url: '/pedidos/mis-pedidos?limit=1000' }
        ];

        for (const ep of endpoints) {
            console.log(`\nTesting ${ep.name}...`);
            try {
                const res = await axios.get(`${baseURL}${ep.url}`, config);
                const limitReturned = res.data.limit;
                const dataLength = res.data.data ? res.data.data.length : (res.data.usuarios ? res.data.usuarios.length : 0);

                if (limitReturned === 100 && dataLength <= 100) {
                    console.log(`✅ ${ep.name}: Capped at 100.`);
                } else {
                    console.error(`❌ ${ep.name}: Failed. Limit: ${limitReturned}, Data: ${dataLength}`);
                }
            } catch (err) {
                console.error(`❌ ${ep.name} Error: ${err.message}`, err.response?.data);
            }
        }

    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    }
}

testExtendedPagination();
