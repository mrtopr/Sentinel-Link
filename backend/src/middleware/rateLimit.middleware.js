import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const generalRateLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS * 10,
    message: {
        success: false,
        error: 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.ip
            || 'unknown';
    },
});

export const incidentCreationLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: {
        success: false,
        error: 'Too many incident reports. Please wait before submitting another.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.ip
            || 'unknown';
    },
});

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        error: 'Too many login attempts. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.ip
            || 'unknown';
    },
});
