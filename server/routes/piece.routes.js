import express from 'express';
import pieceController from '../controllers/piece.controller.js';

const router = express.Router();

/**
 * @route   GET /api/pieces
 * @desc    Obtener todas las piezas
 * @access  Public
 */
router.get('/', pieceController.getAll.bind(pieceController));

/**
 * @route   GET /api/pieces/:id
 * @desc    Obtener una pieza por ID
 * @access  Public
 */
router.get(
  '/:id',
  pieceController.validateId(),
  pieceController.getById.bind(pieceController)
);

/**
 * @route   POST /api/pieces
 * @desc    Crear una nueva pieza
 * @access  Public
 */
router.post(
  '/',
  pieceController.validateCreate(),
  pieceController.create.bind(pieceController)
);

/**
 * @route   PUT /api/pieces/:id
 * @desc    Actualizar una pieza
 * @access  Public
 */
router.put(
  '/:id',
  pieceController.validateUpdate(),
  pieceController.update.bind(pieceController)
);

/**
 * @route   DELETE /api/pieces/:id
 * @desc    Eliminar una pieza
 * @access  Public
 */
router.delete(
  '/:id',
  pieceController.validateId(),
  pieceController.delete.bind(pieceController)
);

export default router;
