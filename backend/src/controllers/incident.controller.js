import { getSocketService } from '../services/socket.service.js';
import { incidentService } from '../services/incident.service.js';
import {
    createIncidentSchema,
    updateStatusSchema,
    incidentQuerySchema,
} from '../validations/incident.schema.js';
import { AppError } from '../middleware/error.middleware.js';

export class IncidentController {
    async createIncident(req, res, next) {
        try {
            const bodyData = req.body.data
                ? JSON.parse(req.body.data)
                : req.body;

            const validatedData = createIncidentSchema.parse(bodyData);
            const mediaBuffer = req.file?.buffer;

            const incident = await incidentService.createIncident(
                validatedData,
                mediaBuffer
            );

            res.status(201).json({
                success: true,
                data: incident,
                message: incident.status === 'FLAGGED'
                    ? 'Incident reported and flagged as potential duplicate'
                    : 'Incident reported successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getIncidents(req, res, next) {
        try {
            const validatedQuery = incidentQuerySchema.parse(req.query);
            const result = await incidentService.getIncidents(validatedQuery);

            res.status(200).json({
                success: true,
                data: result.incidents,
                meta: {
                    total: result.total,
                    page: result.page,
                    totalPages: result.totalPages,
                    limit: validatedQuery.limit,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getIncidentById(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new AppError('Incident ID is required', 400);
            }

            const incident = await incidentService.getIncidentById(id);

            if (!incident) {
                throw new AppError('Incident not found', 404);
            }

            res.status(200).json({
                success: true,
                data: incident,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new AppError('Incident ID is required', 400);
            }

            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const validatedData = updateStatusSchema.parse(req.body);

            const incident = await incidentService.updateIncidentStatus(
                id,
                validatedData.status,
                req.user.id,
                validatedData.note
            );

            res.status(200).json({
                success: true,
                data: incident,
                message: `Incident status updated to ${validatedData.status}`,
            });
        } catch (error) {
            next(error);
        }
    }

    async addNote(req, res, next) {
        try {
            const { id } = req.params;
            const { note } = req.body;

            if (!id || !note) {
                throw new AppError('Incident ID and note are required', 400);
            }

            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const incident = await incidentService.addAdminNote(id, req.user.id, note);

            res.status(200).json({
                success: true,
                data: incident,
                message: 'Note added successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateSeverity(req, res, next) {
        try {
            const { id } = req.params;
            const { severity } = req.body;

            if (!id || !severity) {
                throw new AppError('Incident ID and severity are required', 400);
            }

            if (!['LOW', 'MEDIUM', 'HIGH'].includes(severity)) {
                throw new AppError('Invalid severity level', 400);
            }

            const incident = await incidentService.updateSeverity(id, severity);

            res.status(200).json({
                success: true,
                data: incident,
                message: `Severity updated to ${severity}`,
            });
        } catch (error) {
            next(error);
        }
    }

    async upvoteIncident(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new AppError('Incident ID is required', 400);
            }

            const userId = req.user?.id || 'anonymous';
            const { incident, alreadyVoted } = await incidentService.upvoteIncident(
                id,
                userId
            );

            if (alreadyVoted) {
                res.status(200).json({
                    success: true,
                    data: incident,
                    message: 'You have already upvoted this incident',
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: incident,
                message: incident.status === 'VERIFIED'
                    ? 'Upvote recorded. Incident is now verified!'
                    : 'Upvote recorded successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req, res, next) {
        try {
            const stats = await incidentService.getStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteIncident(req, res, next) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new AppError('Incident ID is required', 400);
            }

            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            await incidentService.deleteIncident(id);

            res.status(200).json({
                success: true,
                message: 'Incident deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async broadcast(req, res, next) {
        try {
            const { message } = req.body;
            console.log(`[BROADCAST] ${message}`);

            const socketService = getSocketService();
            if (socketService) {
                socketService.emitBroadcast(message);
            }

            res.status(200).json({
                success: true,
                message: 'Broadcast initiated successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const incidentController = new IncidentController();
