import winston from 'winston';
import 'winston-daily-rotate-file';

// Define log levels (optional, Winston has defaults but explicit is better)
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level (for console)
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

// Tell winston about colors
winston.addColors(colors);

// Custom format for console (colorful and simple)
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Custom format for files (JSON is better for parsing tools)
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const transports = [
    // 1. Console transport
    new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    }),

    // 2. Error log file (rotates daily)
    new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: fileFormat,
    }),

    // 3. Combined log file (all levels)
    new winston.transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
    }),
];

const logger = winston.createLogger({
    levels,
    transports,
});

export default logger;
