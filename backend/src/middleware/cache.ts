import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
    data: any;
    timestamp: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry>;
    private readonly ttl: number; // Time to live in milliseconds

    constructor(ttlMinutes: number = 10) {
        this.cache = new Map();
        this.ttl = ttlMinutes * 60 * 1000;
        
        // Clean expired entries every minute
        setInterval(() => this.cleanExpired(), 60000);
    }

    set(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);
        
        if (!entry) return null;
        
        // Check if expired
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return entry.data;
    }

    has(key: string): boolean {
        const data = this.get(key);
        return data !== null;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    private cleanExpired(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }

    getStats(): { size: number; ttl: number } {
        return {
            size: this.cache.size,
            ttl: this.ttl
        };
    }
}

// Create cache instance (10 minutes TTL for weather data)
export const weatherCache = new SimpleCache(10);

/**
 * Middleware to cache API responses
 * Use this on GET endpoints that fetch external data
 */
export const cacheMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cachedData = weatherCache.get(key);

    if (cachedData) {
        res.status(200).json({
            ...cachedData,
            cached: true
        });
        return;
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = function (data: any) {
        if (res.statusCode === 200) {
            weatherCache.set(key, data);
        }
        return originalJson(data);
    };

    next();
};
