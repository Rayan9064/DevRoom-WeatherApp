"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("../src/routes/auth.routes"));
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
describe('Auth Routes', () => {
    let app;
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use('/api/auth', auth_routes_1.default);
    });
    describe('POST /api/auth/register', () => {
        it('should return 400 if validation fails', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({
                email: 'test@example.com',
                password: 'Password123',
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('should return 400 if email format is invalid', async () => {
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
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
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                password: 'Password123',
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('should return 400 if password is missing', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('should return 400 if email format is invalid', async () => {
            const response = await (0, supertest_1.default)(app)
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
//# sourceMappingURL=auth.test.js.map