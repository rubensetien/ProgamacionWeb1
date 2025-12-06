import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        // Reintentar conexión máx 5 veces, luego esperar 5 segundos entre intentos
        reconnectStrategy: (retries) => {
            // Si lleva 5 intentos fallidos, avisar una sola vez
            if (retries === 5) {
                console.log('⚠️ Redis no detectado. Modo fallback activado (sin caché).');
            }

            // Si falla mucho, reintentar cada 10 segundos silenciosamente
            if (retries >= 5) {
                return 10000;
            }

            return Math.min(retries * 100, 1000);
        }
    }
});

// Manejo de errores silencioso para no ensuciar la consola
redisClient.on('error', (err) => {
    // Silenciar errores comunes de conexión cuando Redis no está disponible
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'EAI_AGAIN' || err.name === 'ConnectionTimeoutError' || err.message?.includes('timeout') || err.syscall === 'getaddrinfo') {
        return;
    }
    console.error('❌ Redis Client Error:', err);
});
redisClient.on('connect', () => console.log('🔌 Redis Client Connected'));
redisClient.on('ready', () => console.log('✅ Redis Client Ready'));

// Conectar inmediatamente
(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Error connecting to Redis:', error);
    }
})();

export default redisClient;
