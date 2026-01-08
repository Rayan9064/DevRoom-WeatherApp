"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitize_1 = require("../src/middleware/sanitize");
describe('Sanitization Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    beforeEach(() => {
        mockReq = {
            body: {},
            query: {},
            params: {},
        };
        mockRes = {};
        mockNext = jest.fn();
    });
    describe('xssProtection', () => {
        it('should sanitize script tags from body', () => {
            mockReq.body = {
                comment: '<script>alert("xss")</script>Hello World',
            };
            (0, sanitize_1.xssProtection)(mockReq, mockRes, mockNext);
            expect(mockReq.body.comment).not.toContain('<script>');
            expect(mockReq.body.comment).toContain('Hello World');
            expect(mockNext).toHaveBeenCalled();
        });
        it('should sanitize javascript: protocol', () => {
            mockReq.body = {
                link: 'javascript:alert("xss")',
            };
            (0, sanitize_1.xssProtection)(mockReq, mockRes, mockNext);
            expect(mockReq.body.link).not.toContain('javascript:');
            expect(mockNext).toHaveBeenCalled();
        });
        it('should sanitize event handlers', () => {
            mockReq.body = {
                html: '<img src="x" onerror="alert(1)">',
            };
            (0, sanitize_1.xssProtection)(mockReq, mockRes, mockNext);
            expect(mockReq.body.html).not.toContain('onerror=');
            expect(mockNext).toHaveBeenCalled();
        });
        it('should handle nested objects', () => {
            mockReq.body = {
                user: {
                    name: '<script>alert("xss")</script>John',
                    bio: 'Normal text',
                },
            };
            (0, sanitize_1.xssProtection)(mockReq, mockRes, mockNext);
            expect(mockReq.body.user.name).not.toContain('<script>');
            expect(mockReq.body.user.name).toContain('John');
            expect(mockReq.body.user.bio).toBe('Normal text');
            expect(mockNext).toHaveBeenCalled();
        });
        it('should handle arrays', () => {
            mockReq.body = {
                items: ['<script>test</script>', 'safe text', '<iframe>bad</iframe>'],
            };
            (0, sanitize_1.xssProtection)(mockReq, mockRes, mockNext);
            expect(mockReq.body.items[0]).not.toContain('<script>');
            expect(mockReq.body.items[1]).toBe('safe text');
            expect(mockReq.body.items[2]).not.toContain('<iframe>');
            expect(mockNext).toHaveBeenCalled();
        });
        it('should not modify safe strings', () => {
            mockReq.body = {
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
            };
            (0, sanitize_1.xssProtection)(mockReq, mockRes, mockNext);
            expect(mockReq.body.name).toBe('John Doe');
            expect(mockReq.body.email).toBe('john@example.com');
            expect(mockReq.body.age).toBe(30);
            expect(mockNext).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=sanitize.test.js.map