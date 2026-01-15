import { body, param, validationResult } from 'express-validator';
import pieceService from '../services/piece.service.js';

/**
 * Controlador para gestionar piezas cerámicas
 */
class PieceController {
  /**
   * Obtener todas las piezas
   */
  async getAll(req, res) {
    try {
      const pieces = await pieceService.getAllPieces();
      
      // Formatear respuesta para el frontend
      const formattedPieces = pieces.map(piece => ({
        id: piece.id,
        alumnoId: piece.alumnoId,
        owner: piece.owner,
        description: piece.description,
        status: pieceService.convertStatusFromPrisma(piece.status),
        fechaCreacion: piece.fechaCreacion.toISOString().split('T')[0],
        fechaConclusion: piece.fechaConclusion ? piece.fechaConclusion.toISOString().split('T')[0] : null,
        glazeType: piece.glazeType,
        deliveryDate: piece.deliveryDate ? piece.deliveryDate.toISOString().split('T')[0] : null,
        notes: piece.notes,
        extraCommentary: piece.extraCommentary,
        tecnica: piece.tecnica,
        hornoId: piece.hornoId,
        lote: piece.lote,
        foto: piece.foto
      }));

      res.json(formattedPieces);
    } catch (error) {
      console.error('Error al obtener piezas:', error);
      res.status(500).json({ 
        error: 'Error al obtener piezas',
        message: error.message 
      });
    }
  }

  /**
   * Obtener una pieza por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const piece = await pieceService.getPieceById(id);

      if (!piece) {
        return res.status(404).json({ error: 'Pieza no encontrada' });
      }

      res.json({
        id: piece.id,
        alumnoId: piece.alumnoId,
        owner: piece.owner,
        description: piece.description,
        status: pieceService.convertStatusFromPrisma(piece.status),
        fechaCreacion: piece.fechaCreacion.toISOString().split('T')[0],
        fechaConclusion: piece.fechaConclusion ? piece.fechaConclusion.toISOString().split('T')[0] : null,
        glazeType: piece.glazeType,
        deliveryDate: piece.deliveryDate ? piece.deliveryDate.toISOString().split('T')[0] : null,
        notes: piece.notes,
        extraCommentary: piece.extraCommentary,
        tecnica: piece.tecnica,
        hornoId: piece.hornoId,
        lote: piece.lote,
        foto: piece.foto
      });
    } catch (error) {
      console.error('Error al obtener pieza:', error);
      res.status(500).json({ 
        error: 'Error al obtener pieza',
        message: error.message 
      });
    }
  }

  /**
   * Crear una nueva pieza
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const piece = await pieceService.createPiece(req.body);

      res.status(201).json({
        id: piece.id,
        alumnoId: piece.alumnoId,
        owner: piece.owner,
        description: piece.description,
        status: pieceService.convertStatusFromPrisma(piece.status),
        fechaCreacion: piece.fechaCreacion.toISOString().split('T')[0],
        fechaConclusion: piece.fechaConclusion ? piece.fechaConclusion.toISOString().split('T')[0] : null,
        glazeType: piece.glazeType,
        deliveryDate: piece.deliveryDate ? piece.deliveryDate.toISOString().split('T')[0] : null,
        notes: piece.notes,
        extraCommentary: piece.extraCommentary,
        tecnica: piece.tecnica,
        hornoId: piece.hornoId,
        lote: piece.lote,
        foto: piece.foto
      });
    } catch (error) {
      console.error('Error al crear pieza:', error);
      res.status(500).json({ 
        error: 'Error al crear pieza',
        message: error.message 
      });
    }
  }

  /**
   * Actualizar una pieza
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const piece = await pieceService.updatePiece(id, req.body);

      res.json({
        id: piece.id,
        alumnoId: piece.alumnoId,
        owner: piece.owner,
        description: piece.description,
        status: pieceService.convertStatusFromPrisma(piece.status),
        fechaCreacion: piece.fechaCreacion.toISOString().split('T')[0],
        fechaConclusion: piece.fechaConclusion ? piece.fechaConclusion.toISOString().split('T')[0] : null,
        glazeType: piece.glazeType,
        deliveryDate: piece.deliveryDate ? piece.deliveryDate.toISOString().split('T')[0] : null,
        notes: piece.notes,
        extraCommentary: piece.extraCommentary,
        tecnica: piece.tecnica,
        hornoId: piece.hornoId,
        lote: piece.lote,
        foto: piece.foto
      });
    } catch (error) {
      console.error('Error al actualizar pieza:', error);
      res.status(500).json({ 
        error: 'Error al actualizar pieza',
        message: error.message 
      });
    }
  }

  /**
   * Eliminar una pieza
   */
  async delete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      await pieceService.deletePiece(id);

      res.json({ success: true, message: 'Pieza eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar pieza:', error);
      res.status(500).json({ 
        error: 'Error al eliminar pieza',
        message: error.message 
      });
    }
  }

  /**
   * Validaciones para crear pieza
   */
  validateCreate() {
    return [
      body('owner').notEmpty().withMessage('El propietario es requerido'),
      body('status').optional().isIn(['creada', 'en secado', 'bizcochada', 'esmaltada', 'cocida final', 'concluida']).withMessage('Estado inválido'),
      body('alumnoId').optional().isUUID().withMessage('ID de alumno inválido'),
      body('deliveryDate').optional().isISO8601().withMessage('Fecha de entrega inválida'),
      body('fechaCreacion').optional().isISO8601().withMessage('Fecha de creación inválida')
    ];
  }

  /**
   * Validaciones para actualizar pieza
   */
  validateUpdate() {
    return [
      param('id').isUUID().withMessage('ID inválido'),
      body('owner').optional().notEmpty().withMessage('El propietario no puede estar vacío'),
      body('status').optional().isIn(['creada', 'en secado', 'bizcochada', 'esmaltada', 'cocida final', 'concluida']).withMessage('Estado inválido'),
      body('alumnoId').optional().isUUID().withMessage('ID de alumno inválido'),
      body('deliveryDate').optional().isISO8601().withMessage('Fecha de entrega inválida')
    ];
  }

  /**
   * Validaciones para ID
   */
  validateId() {
    return [
      param('id').isUUID().withMessage('ID inválido')
    ];
  }
}

export default new PieceController();
