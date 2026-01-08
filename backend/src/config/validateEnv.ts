import Joi from 'joi';
import logger from './logger';

const envSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
    PORT: Joi.number().default(5000),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRES_IN: Joi.string().default('7d'),
    OPENWEATHER_API_KEY: Joi.string().required(),
    OPENWEATHER_BASE_URL: Joi.string().default('https://api.openweathermap.org/data/2.5'),
    CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
    LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'http', 'debug')
        .default('info')
}).unknown(true); // Allow other env variables

export const validateEnv = (): void => {
    const { error, value } = envSchema.validate(process.env, {
        abortEarly: false,
        stripUnknown: false
    });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        logger.error(`Environment validation error: ${errorMessages}`);
        throw new Error(`Environment validation failed: ${errorMessages}`);
    }

    // Validate JWT_SECRET strength in production
    if (value.NODE_ENV === 'production' && value.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters in production');
    }

    logger.info('✅ Environment variables validated successfully');
};
