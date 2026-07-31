import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { checkForDuplicate } from '../utils/duplicateDetector.js';
import { env } from '../config/env.js';
import { getSocketService } from './socket.service.js';
import prisma from '../prisma.js';

export class IncidentService {
    async createIncident(data, mediaBuffer) {
        const id = uuidv4();
        let mediaUrl = null;

        if (mediaBuffer) {
            const uploadResult = await uploadToCloudinary(mediaBuffer, 'incidents');
            mediaUrl = uploadResult.secure_url;
        }

        const duplicateCheck = await checkForDuplicate(
            data.incidentType,
            data.latitude,
            data.longitude
        );

        const incident = await prisma.incident.create({
            data: {
                id,
                incidentType: data.incidentType.toUpperCase(),
                description: duplicateCheck.isDuplicate
                    ? `[POTENTIAL DUPLICATE] ${data.description}`
                    : data.description,
                latitude: data.latitude,
                longitude: data.longitude,
                severity: data.severity,
                status: duplicateCheck.isDuplicate ? 'FLAGGED' : 'REPORTED',
                mediaUrl,
            },
        });

        const socketService = getSocketService();
        if (socketService) {
            socketService.emitNewIncident(incident);
        }

        return incident;
    }

    async getIncidents(query) {
        const { page, limit, status, incidentType, severity, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        const where = {};

        if (status) {
            where.status = status;
        }

        if (incidentType) {
            where.incidentType = {
                equals: incidentType.toUpperCase(),
            };
        }

        if (severity) {
            where.severity = severity;
        }

        if (query.minLat !== undefined && query.maxLat !== undefined) {
            where.latitude = {
                gte: query.minLat,
                lte: query.maxLat,
            };
        }

        if (query.minLng !== undefined && query.maxLng !== undefined) {
            where.longitude = {
                gte: query.minLng,
                lte: query.maxLng,
            };
        }

        const [incidents, total] = await Promise.all([
            prisma.incident.findMany({
                where,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { votes: true, adminNotes: true },
                    },
                },
            }),
            prisma.incident.count({ where }),
        ]);

        return {
            incidents,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getIncidentById(id) {
        return prisma.incident.findUnique({
            where: { id },
            include: {
                votes: {
                    select: {
                        id: true,
                        userId: true,
                        createdAt: true,
                    },
                },
                adminNotes: {
                    include: {
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: { votes: true },
                },
            },
        });
    }

    async updateIncidentStatus(id, status, adminId, note) {
        const incident = await prisma.incident.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date(),
            },
        });

        if (note) {
            await prisma.adminNote.create({
                data: {
                    incidentId: id,
                    userId: adminId,
                    note: `Status changed to ${status}: ${note}`,
                },
            });
        }

        const socketService = getSocketService();
        if (socketService) {
            socketService.emitIncidentUpdate(incident);
        }

        return incident;
    }

    async addAdminNote(incidentId, adminId, note) {
        await prisma.adminNote.create({
            data: {
                incidentId,
                userId: adminId,
                note,
            },
        });

        const incident = await this.getIncidentById(incidentId);
        if (!incident) {
            throw new Error('Incident not found after adding note');
        }
        return incident;
    }

    async updateSeverity(incidentId, severity) {
        const incident = await prisma.incident.update({
            where: { id: incidentId },
            data: {
                severity,
                updatedAt: new Date(),
            },
        });

        const socketService = getSocketService();
        if (socketService) {
            socketService.emitIncidentUpdate(incident);
        }

        return incident;
    }

    async deleteIncident(id) {
        const incident = await prisma.incident.findUnique({ where: { id } });
        if (!incident) throw new Error('Incident not found');

        await prisma.incident.delete({ where: { id } });
    }

    async upvoteIncident(incidentId, userId) {
        let incident;

        if (userId === 'anonymous') {
            incident = await prisma.incident.update({
                where: { id: incidentId },
                data: {
                    upvoteCount: { increment: 1 },
                },
            });
        } else {
            const existingVote = await prisma.vote.findUnique({
                where: {
                    userId_incidentId: {
                        userId,
                        incidentId,
                    },
                },
            });

            if (existingVote) {
                const fetchedIncident = await prisma.incident.findUnique({
                    where: { id: incidentId },
                });
                return { incident: fetchedIncident, alreadyVoted: true };
            }

            const result = await prisma.$transaction([
                prisma.vote.create({
                    data: {
                        userId,
                        incidentId,
                    },
                }),
                prisma.incident.update({
                    where: { id: incidentId },
                    data: {
                        upvoteCount: { increment: 1 },
                    },
                }),
            ]);
            incident = result[1];
        }

        if (
            incident.status === 'REPORTED' &&
            incident.upvoteCount >= env.VERIFICATION_THRESHOLD
        ) {
            const verifiedIncident = await prisma.incident.update({
                where: { id: incidentId },
                data: { status: 'VERIFIED' },
            });

            const socketService = getSocketService();
            if (socketService) {
                socketService.emitIncidentUpdate(verifiedIncident);
            }

            return { incident: verifiedIncident, alreadyVoted: false };
        }

        return { incident, alreadyVoted: false };
    }

    async getStats() {
        const [total, pending, active, resolved] = await Promise.all([
            prisma.incident.count(),
            prisma.incident.count({ where: { status: 'REPORTED' } }),
            prisma.incident.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.incident.count({ where: { status: 'RESOLVED' } }),
        ]);

        return {
            total,
            pending,
            active,
            resolved
        };
    }
}

export const incidentService = new IncidentService();
