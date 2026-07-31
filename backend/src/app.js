import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import incidentRoutes from './routes/incident.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { generalRateLimiter } from './middleware/rateLimit.middleware.js';

export function createApp() {
    const app = express();

    app.set('trust proxy', 1);

    const corsOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }

                const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
                const isAllowed = corsOrigins.includes(origin) ||
                    corsOrigins.includes('*') ||
                    (env.NODE_ENV === 'development' && isLocalhost);

                if (isAllowed) {
                    callback(null, true);
                } else {
                    console.warn(`CORS: Origin ${origin} not allowed. Allowed: ${corsOrigins.join(', ')}`);
                    callback(null, false);
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use(generalRateLimiter);

    app.get('/', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'SentinelLink Backend is live 🚀',
            status: 'OK',
        });
    });

    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Anginat API is running',
            timestamp: new Date().toISOString(),
            environment: env.NODE_ENV,
        });
    });

    const API_PREFIX = '/api';

    app.use(`${API_PREFIX}/auth`, authRoutes);
    app.use(`${API_PREFIX}/incidents`, incidentRoutes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
