import express from 'express';
import studentController from '../controllers/student.controller.js';

const router = express.Router();

/**
 * @route   GET /api/students
 * @desc    Obtener todos los estudiantes
 * @access  Public
 */
router.get('/', studentController.getAll.bind(studentController));

/**
 * @route   GET /api/students/:id
 * @desc    Obtener un estudiante por ID
 * @access  Public
 */
router.get(
  '/:id',
  studentController.validateId(),
  studentController.getById.bind(studentController)
);

/**
 * @route   POST /api/students
 * @desc    Crear un nuevo estudiante
 * @access  Public
 */
router.post(
  '/',
  studentController.validateCreate(),
  studentController.create.bind(studentController)
);

/**
 * @route   PUT /api/students/:id
 * @desc    Actualizar un estudiante
 * @access  Public
 */
router.put(
  '/:id',
  studentController.validateUpdate(),
  studentController.update.bind(studentController)
);

/**
 * @route   DELETE /api/students/:id
 * @desc    Eliminar un estudiante
 * @access  Public
 */
router.delete(
  '/:id',
  studentController.validateId(),
  studentController.delete.bind(studentController)
);

/**
 * @route   POST /api/students/:id/renew
 * @desc    Renovar bono de un estudiante
 * @access  Public
 */
router.post(
  '/:id/renew',
  studentController.validateRenew(),
  studentController.renew.bind(studentController)
);

export default router;
