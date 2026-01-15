import { body, param, validationResult } from 'express-validator';
import studentService from '../services/student.service.js';

/**
 * Controlador para gestionar estudiantes
 */
class StudentController {
  /**
   * Obtener todos los estudiantes
   */
  async getAll(req, res) {
    try {
      const students = await studentService.getAllStudents();
      
      // Formatear respuesta para el frontend
      const formattedStudents = students.map(student => ({
        id: student.id,
        name: student.name,
        phone: student.phone,
        classesRemaining: student.classesRemaining,
        status: student.status,
        paymentMethod: student.paymentMethod,
        notes: student.notes,
        price: student.price ? parseFloat(student.price) : null,
        classType: student.classType,
        expiryDate: student.expiryDate ? student.expiryDate.toISOString().split('T')[0] : null,
        assignedClasses: student.assignedClasses.map(ac => ({
          date: ac.date.toISOString().split('T')[0],
          startTime: ac.startTime,
          endTime: ac.endTime
        })),
        attendanceHistory: student.attendanceRecords.map(ar => ({
          sessionId: ar.sessionId,
          date: ar.date.toISOString().split('T')[0],
          status: ar.status
        }))
      }));

      res.json(formattedStudents);
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      res.status(500).json({ 
        error: 'Error al obtener estudiantes',
        message: error.message 
      });
    }
  }

  /**
   * Obtener un estudiante por ID
   */
  async getById(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const student = await studentService.getStudentById(id);

      if (!student) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      // Formatear respuesta
      const formattedStudent = {
        id: student.id,
        name: student.name,
        phone: student.phone,
        classesRemaining: student.classesRemaining,
        status: student.status,
        paymentMethod: student.paymentMethod,
        notes: student.notes,
        price: student.price ? parseFloat(student.price) : null,
        classType: student.classType,
        expiryDate: student.expiryDate ? student.expiryDate.toISOString().split('T')[0] : null,
        assignedClasses: student.assignedClasses.map(ac => ({
          date: ac.date.toISOString().split('T')[0],
          startTime: ac.startTime,
          endTime: ac.endTime
        })),
        attendanceHistory: student.attendanceRecords.map(ar => ({
          sessionId: ar.sessionId,
          date: ar.date.toISOString().split('T')[0],
          status: ar.status
        }))
      };

      res.json(formattedStudent);
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
      res.status(500).json({ 
        error: 'Error al obtener estudiante',
        message: error.message 
      });
    }
  }

  /**
   * Crear un nuevo estudiante
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const data = {
        name: req.body.name,
        phone: req.body.phone,
        classesRemaining: req.body.classesRemaining || 0,
        status: req.body.status || 'new',
        paymentMethod: req.body.paymentMethod,
        notes: req.body.notes,
        price: req.body.price,
        classType: req.body.classType,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        assignedClasses: req.body.assignedClasses
      };

      const student = await studentService.createStudent(data);

      res.status(201).json({ 
        id: student.id,
        name: student.name,
        phone: student.phone,
        classesRemaining: student.classesRemaining,
        status: student.status,
        paymentMethod: student.paymentMethod,
        notes: student.notes,
        price: student.price ? parseFloat(student.price) : null,
        classType: student.classType,
        expiryDate: student.expiryDate ? student.expiryDate.toISOString().split('T')[0] : null,
        assignedClasses: student.assignedClasses.map(ac => ({
          date: ac.date.toISOString().split('T')[0],
          startTime: ac.startTime,
          endTime: ac.endTime
        })),
        attendanceHistory: []
      });
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      res.status(500).json({ 
        error: 'Error al crear estudiante',
        message: error.message 
      });
    }
  }

  /**
   * Actualizar un estudiante
   */
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const data = {
        name: req.body.name,
        phone: req.body.phone,
        classesRemaining: req.body.classesRemaining,
        status: req.body.status,
        paymentMethod: req.body.paymentMethod,
        notes: req.body.notes,
        price: req.body.price,
        classType: req.body.classType,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        assignedClasses: req.body.assignedClasses
      };

      const student = await studentService.updateStudent(id, data);

      res.json({ 
        id: student.id,
        name: student.name,
        phone: student.phone,
        classesRemaining: student.classesRemaining,
        status: student.status,
        paymentMethod: student.paymentMethod,
        notes: student.notes,
        price: student.price ? parseFloat(student.price) : null,
        classType: student.classType,
        expiryDate: student.expiryDate ? student.expiryDate.toISOString().split('T')[0] : null,
        assignedClasses: student.assignedClasses.map(ac => ({
          date: ac.date.toISOString().split('T')[0],
          startTime: ac.startTime,
          endTime: ac.endTime
        })),
        attendanceHistory: student.attendanceRecords.map(ar => ({
          sessionId: ar.sessionId,
          date: ar.date.toISOString().split('T')[0],
          status: ar.status
        }))
      });
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      res.status(500).json({ 
        error: 'Error al actualizar estudiante',
        message: error.message 
      });
    }
  }

  /**
   * Eliminar un estudiante
   */
  async delete(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      await studentService.deleteStudent(id);

      res.json({ success: true, message: 'Estudiante eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      res.status(500).json({ 
        error: 'Error al eliminar estudiante',
        message: error.message 
      });
    }
  }

  /**
   * Renovar bono de estudiante
   */
  async renew(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { numClasses } = req.body;

      const student = await studentService.renewStudent(id, numClasses);

      res.json({ success: true, student });
    } catch (error) {
      console.error('Error al renovar estudiante:', error);
      res.status(500).json({ 
        error: 'Error al renovar estudiante',
        message: error.message 
      });
    }
  }

  /**
   * Validaciones para crear estudiante
   */
  validateCreate() {
    return [
      body('name').trim().notEmpty().withMessage('El nombre es requerido'),
      body('phone').trim().notEmpty().withMessage('El teléfono es requerido'),
      body('classesRemaining').optional().isInt({ min: 0 }).withMessage('Las clases restantes deben ser un número positivo'),
      body('status').optional().isIn(['regular', 'needs_renewal', 'new']).withMessage('Estado inválido'),
      body('price').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
      body('classType').optional().isString(),
      body('expiryDate').optional().isISO8601().withMessage('Fecha de expiración inválida')
    ];
  }

  /**
   * Validaciones para actualizar estudiante
   */
  validateUpdate() {
    return [
      param('id').isUUID().withMessage('ID inválido'),
      body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
      body('phone').optional().trim().notEmpty().withMessage('El teléfono no puede estar vacío'),
      body('classesRemaining').optional().isInt({ min: 0 }).withMessage('Las clases restantes deben ser un número positivo'),
      body('status').optional().isIn(['regular', 'needs_renewal', 'new']).withMessage('Estado inválido'),
      body('price').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
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

  /**
   * Validaciones para renovar
   */
  validateRenew() {
    return [
      param('id').isUUID().withMessage('ID inválido'),
      body('numClasses').isInt({ min: 1 }).withMessage('El número de clases debe ser mayor a 0')
    ];
  }
}

export default new StudentController();
