import { Router } from 'express';
import multer from 'multer';
import { incidentController } from '../controllers/incident.controller.js';
import { authenticate, optionalAuth, isAdmin } from '../middleware/auth.middleware.js';
import { incidentCreationLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    },
});

router.post(
    '/',
    incidentCreationLimiter,
    upload.single('media'),
    incidentController.createIncident.bind(incidentController)
);

router.get(
    '/stats',
    incidentController.getStats.bind(incidentController)
);

router.post(
    '/broadcast',
    authenticate,
    isAdmin,
    incidentController.broadcast.bind(incidentController)
);

router.get(
    '/',
    optionalAuth,
    incidentController.getIncidents.bind(incidentController)
);

router.get(
    '/:id',
    optionalAuth,
    incidentController.getIncidentById.bind(incidentController)
);

router.patch(
    '/:id/status',
    authenticate,
    isAdmin,
    incidentController.updateStatus.bind(incidentController)
);

router.post(
    '/:id/notes',
    authenticate,
    isAdmin,
    incidentController.addNote.bind(incidentController)
);

router.patch(
    '/:id/severity',
    authenticate,
    isAdmin,
    incidentController.updateSeverity.bind(incidentController)
);

router.post(
    '/:id/upvote',
    optionalAuth,
    incidentController.upvoteIncident.bind(incidentController)
);

router.delete(
    '/:id',
    authenticate,
    isAdmin,
    incidentController.deleteIncident.bind(incidentController)
);

export default router;
