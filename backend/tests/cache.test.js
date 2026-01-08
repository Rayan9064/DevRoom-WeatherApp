"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../src/middleware/cache");
describe('Cache Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    beforeEach(() => {
        cache_1.weatherCache.clear();
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
            cache_1.weatherCache.set('test-key', testData);
            const retrieved = cache_1.weatherCache.get('test-key');
            expect(retrieved).toEqual(testData);
        });
        it('should return null for non-existent keys', () => {
            const result = cache_1.weatherCache.get('non-existent');
            expect(result).toBeNull();
        });
        it('should check if key exists', () => {
            cache_1.weatherCache.set('test-key', { data: 'test' });
            expect(cache_1.weatherCache.has('test-key')).toBe(true);
            expect(cache_1.weatherCache.has('non-existent')).toBe(false);
        });
        it('should delete entries', () => {
            cache_1.weatherCache.set('test-key', { data: 'test' });
            expect(cache_1.weatherCache.has('test-key')).toBe(true);
            cache_1.weatherCache.delete('test-key');
            expect(cache_1.weatherCache.has('test-key')).toBe(false);
        });
        it('should clear all entries', () => {
            cache_1.weatherCache.set('key1', { data: 'test1' });
            cache_1.weatherCache.set('key2', { data: 'test2' });
            cache_1.weatherCache.clear();
            expect(cache_1.weatherCache.has('key1')).toBe(false);
            expect(cache_1.weatherCache.has('key2')).toBe(false);
        });
        it('should provide stats', () => {
            cache_1.weatherCache.set('key1', { data: 'test1' });
            cache_1.weatherCache.set('key2', { data: 'test2' });
            const stats = cache_1.weatherCache.getStats();
            expect(stats.size).toBe(2);
            expect(stats.ttl).toBeGreaterThan(0);
        });
    });
    describe('cacheMiddleware', () => {
        it('should skip caching for non-GET requests', () => {
            mockReq.method = 'POST';
            (0, cache_1.cacheMiddleware)(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
        it('should return cached data if available', () => {
            const cachedData = { city: 'London', temp: 20 };
            cache_1.weatherCache.set('cache:/api/weather/city/London', cachedData);
            mockRes.status = jest.fn().mockReturnValue(mockRes);
            mockRes.json = jest.fn();
            (0, cache_1.cacheMiddleware)(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                ...cachedData,
                cached: true,
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
        it('should cache successful responses', () => {
            const responseData = { city: 'London', temp: 20 };
            let jsonCallback;
            mockRes.json = jest.fn((data) => {
                jsonCallback = data;
                return mockRes;
            });
            (0, cache_1.cacheMiddleware)(mockReq, mockRes, mockNext);
            // Simulate successful response
            mockRes.json(responseData);
            expect(mockNext).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=cache.test.js.map