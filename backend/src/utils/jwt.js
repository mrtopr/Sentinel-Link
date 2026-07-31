import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generateToken(payload) {
    const options = {
        expiresIn: env.JWT_EXPIRES_IN,
        issuer: 'anginat-api',
        audience: 'anginat-client',
    };
    return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET, {
            issuer: 'anginat-api',
            audience: 'anginat-client',
        });

        return decoded;
    } catch {
        return null;
    }
}

export function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch {
        return null;
    }
}
