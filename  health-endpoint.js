// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
// Añadir a backend/server.js

// Health check endpoint (antes de las rutas de la API)
app.get('/health', (req, res) => {
  // Verificar conexión a MongoDB
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  const healthCheck = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoStatus,
    port: process.env.PORT || 3001
  };

  if (mongoStatus === 'disconnected') {
    return res.status(503).json({
      ...healthCheck,
      status: 'ERROR',
      message: 'Database connection failed'
    });
  }

  res.status(200).json(healthCheck);
});

// Ejemplo de salida:
// {
//   "uptime": 123.45,
//   "status": "OK",
//   "timestamp": "2025-11-09T21:45:00.000Z",
//   "environment": "development",
//   "mongodb": "connected",
//   "port": 3001
// }