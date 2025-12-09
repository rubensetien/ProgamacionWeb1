import morgan from 'morgan';
import logger from '../config/logger.js';

// Override the stream method to tell Morgan to use our custom logger instead of console.log
const stream = {
    write: (message) => logger.http(message.trim()),
};

// Skip logs for specific routes if needed (e.g. health checks to reduce noise)
const skip = () => {
    const env = process.env.NODE_ENV || 'development';
    return env !== 'development'; // Log everything in dev, skip nothing? Or logic to skip
    // For now, let's log everything.
    return false;
};

// Build the morgan middleware
const httpLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream, skip }
);

export default httpLogger;
