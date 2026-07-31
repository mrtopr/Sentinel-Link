import { isWithinDistance } from './distance.js';
import { env } from '../config/env.js';
import prisma from '../prisma.js';

export async function checkForDuplicate(incidentType, latitude, longitude) {
    const timeWindowStart = new Date(
        Date.now() - env.DUPLICATE_TIME_MINUTES * 60 * 1000
    );

    const latDelta = env.DUPLICATE_DISTANCE_METERS / 111000;
    const lonDelta = latDelta / Math.cos((latitude * Math.PI) / 180);

    const recentIncidents = await prisma.incident.findMany({
        where: {
            incidentType: {
                equals: incidentType,
                mode: 'insensitive',
            },
            createdAt: {
                gte: timeWindowStart,
            },
            latitude: {
                gte: latitude - latDelta,
                lte: latitude + latDelta,
            },
            longitude: {
                gte: longitude - lonDelta,
                lte: longitude + lonDelta,
            },
            status: {
                notIn: ['RESOLVED', 'FLAGGED'],
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 20,
    });

    for (const incident of recentIncidents) {
        if (
            isWithinDistance(
                latitude,
                longitude,
                incident.latitude,
                incident.longitude,
                env.DUPLICATE_DISTANCE_METERS
            )
        ) {
            return {
                isDuplicate: true,
                duplicateOf: incident.id,
                reason: `Similar incident reported within ${env.DUPLICATE_DISTANCE_METERS}m and ${env.DUPLICATE_TIME_MINUTES} minutes`,
            };
        }
    }

    return { isDuplicate: false };
}

export async function flagAsDuplicate(incidentId, duplicateOf) {
    const existing = await prisma.incident.findUnique({ where: { id: incidentId } });
    return prisma.incident.update({
        where: { id: incidentId },
        data: {
            status: 'FLAGGED',
            description: `[POTENTIAL DUPLICATE of ${duplicateOf}] ${existing?.description || ''}`,
        },
    });
}
