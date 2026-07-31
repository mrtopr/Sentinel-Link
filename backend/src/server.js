import 'dotenv/config';
import { createServer } from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { initializeSocketService } from './services/socket.service.js';
import prisma from './prisma.js';

async function main() {
    try {
        console.log('[Database] Connecting to PostgreSQL...');
        await prisma.$connect();
        console.log('[Database] Connected successfully');

        const app = createApp();
        const httpServer = createServer(app);

        initializeSocketService(httpServer);
        console.log('[Socket.IO] Initialized');

        httpServer.listen(env.PORT, () => {
            console.log('═══════════════════════════════════════════════');
            console.log(`   🚀 Anginat API Server`);
            console.log('═══════════════════════════════════════════════');
            console.log(`   Environment: ${env.NODE_ENV}`);
            console.log(`   Port: ${env.PORT}`);
            console.log(`   Health: http://localhost:${env.PORT}/health`);
            console.log('═══════════════════════════════════════════════');
        });

        const shutdown = async (signal) => {
            console.log(`\n[${signal}] Shutting down gracefully...`);

            httpServer.close(() => {
                console.log('[HTTP] Server closed');
            });

            await prisma.$disconnect();
            console.log('[Database] Disconnected');

            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        process.on('uncaughtException', (error) => {
            console.error('[FATAL] Uncaught Exception:', error);
            shutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
            shutdown('UNHANDLED_REJECTION');
        });
    } catch (error) {
        console.error('[FATAL] Failed to start server:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
