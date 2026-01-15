import { body, param, validationResult } from 'express-validator';
import sessionService from '../services/session.service.js';

/**
 * Controlador para gestionar sesiones de clase
 */
class SessionController {
  /**
   * Obtener todas las sesiones
   */
  async getAll(req, res) {
    try {
      const sessions = await sessionService.getAllSessions();
      
      // Formatear respuesta para el frontend
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        date: session.date.toISOString().split('T')[0],
        startTime: session.startTime,
        endTime: session.endTime,
        students: session.sessionStudents.map(ss => ss.studentName),
        attendanceConfirmed: session.sessionStudents
          .filter(ss => ss.attendanceStatus === 'present')
          .map(ss => ss.studentName),
        attendanceAbsent: session.sessionStudents
          .filter(ss => ss.attendanceStatus === 'absent')
          .map(ss => ss.studentName)
      }));

      res.json(formattedSessions);
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      res.status(500).json({ 
        error: 'Error al obtener sesiones',
        message: error.message 
      });
    }
  }

  /**
   * Crear una nueva sesión
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = {
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        students: req.body.students || []
      };

      const session = await sessionService.createSession(data);

      res.status(201).json({ 
        id: session.id,
        date: session.date.toISOString().split('T')[0],
        startTime: session.startTime,
        endTime: session.endTime,
        students: session.sessionStudents.map(ss => ss.studentName),
        attendanceConfirmed: [],
        attendanceAbsent: []
      });
    } catch (error) {
      console.error('Error al crear sesión:', error);
      res.status(500).json({ 
        error: 'Error al crear sesión',
        message: error.message 
      });
    }
  }

  /**
   * Actualizar una sesión
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const data = {
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        students: req.body.students
      };

      const session = await sessionService.updateSession(id, data);

      res.json({ 
        id: session.id,
        date: session.date.toISOString().split('T')[0],
        startTime: session.startTime,
        endTime: session.endTime,
        students: session.sessionStudents.map(ss => ss.studentName),
        attendanceConfirmed: session.sessionStudents
          .filter(ss => ss.attendanceStatus === 'present')
          .map(ss => ss.studentName),
        attendanceAbsent: session.sessionStudents
          .filter(ss => ss.attendanceStatus === 'absent')
          .map(ss => ss.studentName)
      });
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      res.status(500).json({ 
        error: 'Error al actualizar sesión',
        message: error.message 
      });
    }
  }

  /**
   * Actualizar asistencia
   */
  async updateAttendance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { sessionId, studentName, status } = req.body;

      const session = await sessionService.updateAttendance(sessionId, studentName, status);

      res.json({ 
        success: true,
        session: {
          id: session.id,
          date: session.date.toISOString().split('T')[0],
          startTime: session.startTime,
          endTime: session.endTime,
          students: session.sessionStudents.map(ss => ss.studentName),
          attendanceConfirmed: session.sessionStudents
            .filter(ss => ss.attendanceStatus === 'present')
            .map(ss => ss.studentName),
          attendanceAbsent: session.sessionStudents
            .filter(ss => ss.attendanceStatus === 'absent')
            .map(ss => ss.studentName)
        }
      });
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      res.status(500).json({ 
        error: 'Error al actualizar asistencia',
        message: error.message 
      });
    }
  }

  /**
   * Eliminar una sesión
   */
  async delete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      await sessionService.deleteSession(id);

      res.json({ success: true, message: 'Sesión eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
      res.status(500).json({ 
        error: 'Error al eliminar sesión',
        message: error.message 
      });
    }
  }

  /**
   * Validaciones para crear sesión
   */
  validateCreate() {
    return [
      body('date').notEmpty().isISO8601().withMessage('Fecha inválida'),
      body('startTime').notEmpty().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio inválida'),
      body('endTime').notEmpty().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin inválida'),
      body('students').optional().isArray().withMessage('Los estudiantes deben ser un array')
    ];
  }

  /**
   * Validaciones para actualizar sesión
   */
  validateUpdate() {
    return [
      param('id').isUUID().withMessage('ID inválido'),
      body('date').optional().isISO8601().withMessage('Fecha inválida'),
      body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio inválida'),
      body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin inválida'),
      body('students').optional().isArray().withMessage('Los estudiantes deben ser un array')
    ];
  }

  /**
   * Validaciones para actualizar asistencia
   */
  validateAttendance() {
    return [
      body('sessionId').notEmpty().isUUID().withMessage('ID de sesión inválido'),
      body('studentName').notEmpty().withMessage('Nombre de estudiante requerido'),
      body('status').isIn(['present', 'absent', 'none']).withMessage('Estado inválido')
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

export default new SessionController();
