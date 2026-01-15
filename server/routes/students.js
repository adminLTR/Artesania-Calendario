import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todos los estudiantes
router.get('/', async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        s.*,
        GROUP_CONCAT(DISTINCT CONCAT(ac.date, '|', ac.start_time, '|', ac.end_time) SEPARATOR ';;') as assigned_classes,
        GROUP_CONCAT(DISTINCT CONCAT(ah.session_id, '|', ah.date, '|', ah.status) SEPARATOR ';;') as attendance_history
      FROM students s
      LEFT JOIN assigned_classes ac ON s.id = ac.student_id
      LEFT JOIN attendance_history ah ON s.id = ah.student_id
      GROUP BY s.id
    `);

    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      phone: student.phone,
      classesRemaining: student.classes_remaining,
      status: student.status,
      paymentMethod: student.payment_method,
      notes: student.notes,
      price: student.price,
      classType: student.class_type,
      expiryDate: student.expiry_date,
      assignedClasses: student.assigned_classes 
        ? student.assigned_classes.split(';;').map(ac => {
            const [date, startTime, endTime] = ac.split('|');
            return { date, startTime, endTime };
          })
        : [],
      attendanceHistory: student.attendance_history
        ? student.attendance_history.split(';;').map(ah => {
            const [sessionId, date, status] = ah.split('|');
            return { sessionId, date, status };
          })
        : []
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
});

// Crear o actualizar estudiante
router.post('/', async (req, res) => {
  const student = req.body;
  
  try {
    await pool.query(`
      INSERT INTO students (id, name, phone, classes_remaining, status, payment_method, notes, price, class_type, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = VALUES(phone),
        classes_remaining = VALUES(classes_remaining),
        status = VALUES(status),
        payment_method = VALUES(payment_method),
        notes = VALUES(notes),
        price = VALUES(price),
        class_type = VALUES(class_type),
        expiry_date = VALUES(expiry_date)
    `, [
      student.id,
      student.name,
      student.phone,
      student.classesRemaining || 0,
      student.status || 'new',
      student.paymentMethod,
      student.notes,
      student.price,
      student.classType,
      student.expiryDate
    ]);

    // Guardar clases asignadas
    if (student.assignedClasses && student.assignedClasses.length > 0) {
      await pool.query('DELETE FROM assigned_classes WHERE student_id = ?', [student.id]);
      
      for (const ac of student.assignedClasses) {
        await pool.query(
          'INSERT INTO assigned_classes (student_id, date, start_time, end_time) VALUES (?, ?, ?, ?)',
          [student.id, ac.date, ac.startTime, ac.endTime]
        );
      }
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error('Error al guardar estudiante:', error);
    res.status(500).json({ error: 'Error al guardar estudiante' });
  }
});

// Eliminar estudiante
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    res.status(500).json({ error: 'Error al eliminar estudiante' });
  }
});

export default router;
