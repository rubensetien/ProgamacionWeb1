export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);

  if (err.name === 'CastError') {
    return res.status(400).json({
      ok: false,
      mensaje: 'ID no válido',
      error: 'CastError',
      statusCode: 400,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ok: false,
      mensaje: err.message,
      error: 'ValidationError',
      statusCode: 400,
    });
  }

  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({
      ok: false,
      mensaje: 'Error de conexión con la base de datos',
      error: 'MongoNetworkError',
      statusCode: 503,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor',
    error: err.name || 'InternalServerError',
    statusCode,
  });
};