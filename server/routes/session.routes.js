import express from 'express';
import sessionController from '../controllers/session.controller.js';

const router = express.Router();

/**
 * @route   GET /api/sessions
 * @desc    Obtener todas las sesiones
 * @access  Public
 */
router.get('/', sessionController.getAll.bind(sessionController));

/**
 * @route   POST /api/sessions
 * @desc    Crear una nueva sesión
 * @access  Public
 */
router.post(
  '/',
  sessionController.validateCreate(),
  sessionController.create.bind(sessionController)
);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Actualizar una sesión
 * @access  Public
 */
router.put(
  '/:id',
  sessionController.validateUpdate(),
  sessionController.update.bind(sessionController)
);

/**
 * @route   POST /api/sessions/attendance
 * @desc    Actualizar asistencia de un estudiante
 * @access  Public
 */
router.post(
  '/attendance',
  sessionController.validateAttendance(),
  sessionController.updateAttendance.bind(sessionController)
);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Eliminar una sesión
 * @access  Public
 */
router.delete(
  '/:id',
  sessionController.validateId(),
  sessionController.delete.bind(sessionController)
);

export default router;
