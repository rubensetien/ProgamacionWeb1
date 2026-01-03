import { server } from './server.js';

// Node 18+ has built-in fetch, if not we might need to rely on http or just assume it works
// Checking if fetch is available
const fetch = global.fetch || (await import('node-fetch')).default;

const PORT = process.env.PORT || 3001;

async function test() {
    console.log('Waiting for server to initialize...');
    // Allow some time for connection to DB and Apollo start
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Testing GraphQL Endpoint...');
    try {
        const query = `
            query {
                productos(limit: 1) {
                    id
                    nombre
                }
            }
        `;

        const response = await fetch(`http://localhost:${PORT}/graphql`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (response.status !== 200) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error('Response body:', text);
        } else {
            const result = await response.json();
            console.log('Response:', JSON.stringify(result, null, 2));

            if (result.data && result.data.productos) {
                console.log('✅ GraphQL Query Successful');
            } else {
                console.error('❌ GraphQL Verification Failed: Invalid response structure');
            }
        }

    } catch (error) {
        console.error('❌ Network/Script Error:', error);
    } finally {
        console.log('Closing server...');
        server.close();
        process.exit(0);
    }
}

test();
