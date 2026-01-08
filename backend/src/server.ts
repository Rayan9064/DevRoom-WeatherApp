import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import responseTime from 'response-time';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import weatherRoutes from './routes/weather.routes';
import favoritesRoutes from './routes/favorites.routes';
import { errorHandler } from './middleware/errorHandler';
import { sanitizeInput, xssProtection } from './middleware/sanitize';
import logger, { morganStream } from './config/logger';
import { validateEnv } from './config/validateEnv';
import OTPModel from './models/OTP';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnv();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://openweathermap.org"],
        }
    },
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting - prevent brute force and DDoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again later.'
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN || 'http://localhost:5173']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Response time header
app.use(responseTime());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined', { stream: morganStream }));
} else {
    app.use(morgan('dev', { stream: morganStream }));
}

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware
app.use(sanitizeInput);
app.use(xssProtection);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/favorites', favoritesRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.json({ 
        status: 'OK', 
        message: 'Weather Dashboard API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API info endpoint
app.get('/api', (_req: Request, res: Response) => {
    res.json({
        name: 'Weather Dashboard API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            weather: '/api/weather',
            favorites: '/api/favorites'
        }
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const initDb = async () => {
    try {
        const pool = (await import('./config/database')).default;

        // Create users table with email_verified column
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                email_verified BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Add email_verified column if it doesn't exist (for existing databases)
        await pool.query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
                EXCEPTION
                    WHEN duplicate_column THEN 
                    -- Column already exists, do nothing
                END;
            END $$;
        `);

        // Rename password to password_hash if needed
        await pool.query(`
            DO $$ 
            BEGIN 
                BEGIN
                    ALTER TABLE users RENAME COLUMN password TO password_hash;
                EXCEPTION
                    WHEN undefined_column THEN 
                    -- Column doesn't exist or already renamed
                END;
            END $$;
        `);

        // Create favorite_cities table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS favorite_cities (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                city_name VARCHAR(255) NOT NULL,
                country_code VARCHAR(10),
                latitude DECIMAL,
                longitude DECIMAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, city_name)
            );
        `);

        // Create refresh_tokens table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
            CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
        `);
        
        logger.info('✅ Database tables initialized');

        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server is running on port ${PORT}`);
            logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔒 Security middleware enabled`);
        });

        // Schedule periodic cleanup of expired OTPs (every 10 minutes)
        const otpCleanupInterval = setInterval(async () => {
            try {
                await OTPModel.deleteExpired();
            } catch (error) {
                logger.error('Error cleaning up expired OTPs:', error);
            }
        }, 10 * 60 * 1000);
        
        logger.info('⏰ OTP cleanup scheduled to run every 10 minutes');

        // Graceful shutdown handler
        const gracefulShutdown = async (signal: string) => {
            logger.info(`\n${signal} received. Starting graceful shutdown...`);
            
            // Stop accepting new connections
            server.close(async () => {
                logger.info('HTTP server closed');
                
                // Clear intervals
                clearInterval(otpCleanupInterval);
                logger.info('Background tasks stopped');
                
                // Close database connections
                try {
                    await pool.end();
                    logger.info('Database connections closed');
                } catch (error) {
                    logger.error('Error closing database connections:', error);
                }
                
                logger.info('✅ Graceful shutdown completed');
                process.exit(0);
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger.error('❌ Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error: Error) => {
            logger.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
            logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });

    } catch (err) {
        logger.error('❌ Failed to initialize database:', err);
        process.exit(1);
    }
};

initDb();

export default app;
