import { sanitizeInput, xssProtection } from '../src/middleware/sanitize';
import { Request, Response, NextFunction } from 'express';

describe('Sanitization Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

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

            xssProtection(mockReq as Request, mockRes as Response, mockNext);

            expect(mockReq.body.comment).not.toContain('<script>');
            expect(mockReq.body.comment).toContain('Hello World');
            expect(mockNext).toHaveBeenCalled();
        });

        it('should sanitize javascript: protocol', () => {
            mockReq.body = {
                link: 'javascript:alert("xss")',
            };

            xssProtection(mockReq as Request, mockRes as Response, mockNext);

            expect(mockReq.body.link).not.toContain('javascript:');
            expect(mockNext).toHaveBeenCalled();
        });

        it('should sanitize event handlers', () => {
            mockReq.body = {
                html: '<img src="x" onerror="alert(1)">',
            };

            xssProtection(mockReq as Request, mockRes as Response, mockNext);

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

            xssProtection(mockReq as Request, mockRes as Response, mockNext);

            expect(mockReq.body.user.name).not.toContain('<script>');
            expect(mockReq.body.user.name).toContain('John');
            expect(mockReq.body.user.bio).toBe('Normal text');
            expect(mockNext).toHaveBeenCalled();
        });

        it('should handle arrays', () => {
            mockReq.body = {
                items: ['<script>test</script>', 'safe text', '<iframe>bad</iframe>'],
            };

            xssProtection(mockReq as Request, mockRes as Response, mockNext);

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

            xssProtection(mockReq as Request, mockRes as Response, mockNext);

            expect(mockReq.body.name).toBe('John Doe');
            expect(mockReq.body.email).toBe('john@example.com');
            expect(mockReq.body.age).toBe(30);
            expect(mockNext).toHaveBeenCalled();
        });
    });
});
