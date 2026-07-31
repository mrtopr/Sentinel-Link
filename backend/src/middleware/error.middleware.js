import { ZodError } from 'zod';
import { env } from '../config/env.js';

export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export function notFoundHandler(req, res, _next) {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`,
    });
}

export function errorHandler(err, _req, res, _next) {
    if (env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    if (err instanceof ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));

        res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: 'Validation failed',
            details: formattedErrors,
        });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
            message: err.message,
        });
        return;
    }

    if (err.name === 'PrismaClientKnownRequestError') {
        if (err.code === 'P2002') {
            const target = err.meta?.target?.join(', ') || 'field';
            res.status(409).json({
                success: false,
                error: `A record with this ${target} already exists`,
            });
            return;
        }

        if (err.code === 'P2025') {
            res.status(404).json({
                success: false,
                error: 'Record not found',
            });
            return;
        }
    }

    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: 'Invalid token',
            message: 'Invalid token',
        });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: 'Token has expired',
            message: 'Token has expired',
        });
        return;
    }

    const statusCode = 500;
    const message = env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        error: message,
        message: message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
