import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.routes';

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mocked-uuid-token')
}));

// Mock database
jest.mock('../src/config/database', () => ({
    default: {
        query: jest.fn(),
    },
}));

jest.mock('../src/config/logger', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    },
    morganStream: {
        write: jest.fn(),
    },
}));

// Mock email service
jest.mock('../src/services/emailService', () => ({
    default: {
        sendVerificationEmail: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        sendWelcomeEmail: jest.fn(),
    },
}));

describe('Auth Routes', () => {
    let app: express.Application;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/auth', authRoutes);
    });

    describe('POST /api/auth/register', () => {
        it('should return 400 if validation fails', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'ab', // Too short
                    email: 'invalid-email',
                    password: '123', // Too weak
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
        });

        it('should return 400 if username is missing', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Password123',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if email format is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'not-an-email',
                    password: 'Password123',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if password is too weak', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'weak',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should return 400 if email is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'Password123',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if password is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 if email format is invalid', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'Password123',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });
});
