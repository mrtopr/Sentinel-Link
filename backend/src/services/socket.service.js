import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env.js';

class SocketService {
    constructor(httpServer) {
        const corsOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());

        this.io = new SocketServer(httpServer, {
            cors: {
                origin: corsOrigins,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`[Socket.IO] Client connected: ${socket.id}`);

            socket.on('join:incidents', () => {
                socket.join('incidents');
                console.log(`[Socket.IO] Client ${socket.id} joined incidents room`);
            });

            socket.on('subscribe:incident', (incidentId) => {
                socket.join(`incident:${incidentId}`);
                console.log(`[Socket.IO] Client ${socket.id} subscribed to incident ${incidentId}`);
            });

            socket.on('unsubscribe:incident', (incidentId) => {
                socket.leave(`incident:${incidentId}`);
            });

            socket.on('disconnect', (reason) => {
                console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`);
            });

            socket.on('error', (error) => {
                console.error(`[Socket.IO] Socket error for ${socket.id}:`, error);
            });
        });

        console.log('[Socket.IO] Event handlers initialized');
    }

    emitNewIncident(incident) {
        this.io.emit('incident:new', {
            type: 'incident:new',
            data: incident,
            timestamp: new Date().toISOString(),
        });
        console.log(`[Socket.IO] Emitted incident:new for ${incident.id}`);
    }

    emitBroadcast(message) {
        this.io.emit('emergency:broadcast', {
            type: 'emergency:broadcast',
            message,
            timestamp: new Date().toISOString(),
        });
        console.log(`[Socket.IO] Emitted emergency:broadcast: ${message}`);
    }

    emitIncidentUpdate(incident) {
        this.io.emit('incident:update', {
            type: 'incident:update',
            data: incident,
            timestamp: new Date().toISOString(),
        });

        this.io.to(`incident:${incident.id}`).emit('incident:updated', {
            type: 'incident:updated',
            data: incident,
            timestamp: new Date().toISOString(),
        });

        console.log(`[Socket.IO] Emitted incident:update for ${incident.id}`);
    }

    getIO() {
        return this.io;
    }

    async getConnectedClientsCount() {
        const sockets = await this.io.fetchSockets();
        return sockets.length;
    }
}

let socketServiceInstance = null;

export function initializeSocketService(httpServer) {
    if (!socketServiceInstance) {
        socketServiceInstance = new SocketService(httpServer);
    }
    return socketServiceInstance;
}

export function getSocketService() {
    return socketServiceInstance;
}
