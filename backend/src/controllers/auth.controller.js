import bcrypt from 'bcrypt';
import { loginSchema, registerSchema } from '../validations/auth.schema.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middleware/error.middleware.js';
import prisma from '../prisma.js';

export class AuthController {
    async login(req, res, next) {
        try {
            const validatedData = loginSchema.parse(req.body);

            const user = await prisma.user.findUnique({
                where: { email: validatedData.email },
            });

            if (!user) {
                throw new AppError('Invalid email or password', 401);
            }

            const isPasswordValid = await bcrypt.compare(
                validatedData.password,
                user.passwordHash
            );

            if (!isPasswordValid) {
                throw new AppError('Invalid email or password', 401);
            }

            const token = generateToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            res.status(200).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const validatedData = registerSchema.parse(req.body);

            const existingUser = await prisma.user.findUnique({
                where: { email: validatedData.email },
            });

            if (existingUser) {
                throw new AppError('User with this email already exists', 409);
            }

            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

            const user = await prisma.user.create({
                data: {
                    name: validatedData.name,
                    email: validatedData.email,
                    passwordHash,
                    role: validatedData.role,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });

            const token = generateToken({
                userId: user.id,
                email: user.email,
                role: user.role,
            });

            res.status(201).json({
                success: true,
                data: {
                    token,
                    user,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: { votes: true },
                    },
                },
            });

            if (!user) {
                throw new AppError('User not found', 404);
            }

            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req, res, next) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            });

            res.status(200).json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;

            await prisma.user.delete({
                where: { id },
            });

            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUserRole(req, res, next) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!['ADMIN', 'CITIZEN'].includes(role)) {
                throw new AppError('Invalid role', 400);
            }

            const user = await prisma.user.update({
                where: { id },
                data: { role },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });

            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async createUser(req, res, next) {
        try {
            const validatedData = registerSchema.parse(req.body);

            const existingUser = await prisma.user.findUnique({
                where: { email: validatedData.email },
            });

            if (existingUser) {
                throw new AppError('User with this email already exists', 409);
            }

            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

            const user = await prisma.user.create({
                data: {
                    name: validatedData.name,
                    email: validatedData.email,
                    passwordHash,
                    role: validatedData.role || 'CITIZEN',
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });

            res.status(201).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
