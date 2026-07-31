import { verifyToken } from '../utils/jwt.js';
import prisma from '../prisma.js';

export async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Authentication required. Please provide a valid token.',
            });
            return;
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        if (!payload) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token.',
            });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, role: true, name: true },
        });

        if (!user) {
            res.status(401).json({
                success: false,
                error: 'User no longer exists.',
            });
            return;
        }

        req.user = {
            id: user.id,
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Authentication failed.',
        });
    }
}

export async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = verifyToken(token);

            if (payload) {
                const user = await prisma.user.findUnique({
                    where: { id: payload.userId },
                    select: { id: true, email: true, role: true },
                });

                if (user) {
                    req.user = {
                        id: user.id,
                        userId: user.id,
                        email: user.email,
                        role: user.role,
                    };
                }
            }
        }

        next();
    } catch {
        next();
    }
}

export function isAdmin(req, res, next) {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required.',
        });
        return;
    }

    if (req.user.role !== 'ADMIN') {
        res.status(403).json({
            success: false,
            error: 'Access denied. Admin privileges required.',
        });
        return;
    }

    next();
}
