import { weatherCache, cacheMiddleware } from '../src/middleware/cache';
import { Request, Response, NextFunction } from 'express';

describe('Cache Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        weatherCache.clear();
        mockReq = {
            method: 'GET',
            originalUrl: '/api/weather/city/London',
        };
        mockRes = {
            statusCode: 200,
            json: jest.fn(),
        };
        mockNext = jest.fn();
    });

    describe('WeatherCache', () => {
        it('should store and retrieve data', () => {
            const testData = { city: 'London', temp: 20 };
            weatherCache.set('test-key', testData);
            
            const retrieved = weatherCache.get('test-key');
            expect(retrieved).toEqual(testData);
        });

        it('should return null for non-existent keys', () => {
            const result = weatherCache.get('non-existent');
            expect(result).toBeNull();
        });

        it('should check if key exists', () => {
            weatherCache.set('test-key', { data: 'test' });
            
            expect(weatherCache.has('test-key')).toBe(true);
            expect(weatherCache.has('non-existent')).toBe(false);
        });

        it('should delete entries', () => {
            weatherCache.set('test-key', { data: 'test' });
            expect(weatherCache.has('test-key')).toBe(true);
            
            weatherCache.delete('test-key');
            expect(weatherCache.has('test-key')).toBe(false);
        });

        it('should clear all entries', () => {
            weatherCache.set('key1', { data: 'test1' });
            weatherCache.set('key2', { data: 'test2' });
            
            weatherCache.clear();
            
            expect(weatherCache.has('key1')).toBe(false);
            expect(weatherCache.has('key2')).toBe(false);
        });

        it('should provide stats', () => {
            weatherCache.set('key1', { data: 'test1' });
            weatherCache.set('key2', { data: 'test2' });
            
            const stats = weatherCache.getStats();
            expect(stats.size).toBe(2);
            expect(stats.ttl).toBeGreaterThan(0);
        });
    });

    describe('cacheMiddleware', () => {
        it('should skip caching for non-GET requests', () => {
            mockReq.method = 'POST';
            
            cacheMiddleware(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockNext).toHaveBeenCalled();
        });

        it('should return cached data if available', () => {
            const cachedData = { city: 'London', temp: 20 };
            weatherCache.set('cache:/api/weather/city/London', cachedData);
            
            mockRes.status = jest.fn().mockReturnValue(mockRes);
            mockRes.json = jest.fn();
            
            cacheMiddleware(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                ...cachedData,
                cached: true,
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should cache successful responses', () => {
            const responseData = { city: 'London', temp: 20 };
            let jsonCallback: any;
            
            mockRes.json = jest.fn((data) => {
                jsonCallback = data;
                return mockRes as Response;
            });
            
            cacheMiddleware(mockReq as Request, mockRes as Response, mockNext);
            
            // Simulate successful response
            (mockRes.json as jest.Mock)(responseData);
            
            expect(mockNext).toHaveBeenCalled();
        });
    });
});
