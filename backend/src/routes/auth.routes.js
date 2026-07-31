import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post(
    '/login',
    authRateLimiter,
    authController.login.bind(authController)
);

router.post(
    '/register',
    authRateLimiter,
    authController.register.bind(authController)
);

router.get(
    '/me',
    authenticate,
    authController.getProfile.bind(authController)
);

router.get(
    '/users',
    authenticate,
    isAdmin,
    authController.getUsers.bind(authController)
);

router.post(
    '/users',
    authenticate,
    isAdmin,
    authController.createUser.bind(authController)
);

router.delete(
    '/users/:id',
    authenticate,
    isAdmin,
    authController.deleteUser.bind(authController)
);

router.patch(
    '/users/:id/role',
    authenticate,
    isAdmin,
    authController.updateUserRole.bind(authController)
);

export default router;
