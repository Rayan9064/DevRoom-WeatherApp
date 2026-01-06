import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
    message: string;
    stack?: string;
}

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', err);

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    const response: ErrorResponse = {
        message: err.message || 'Internal Server Error'
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};
