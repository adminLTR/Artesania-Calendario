import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Obtener todas las sesiones
router.get('/', async (req, res) => {
  try {
    const [sessions] = await pool.query('SELECT * FROM class_sessions ORDER BY date, start_time');
    
    const formattedSessions = await Promise.all(sessions.map(async (session) => {
      const [students] = await pool.query(
        'SELECT student_name, attendance_status FROM session_students WHERE session_id = ?',
        [session.id]
      );

      return {
        id: session.id,
        date: session.date,
        startTime: session.start_time,
        endTime: session.end_time,
        students: students.map(s => s.student_name),
        attendanceConfirmed: students
          .filter(s => s.attendance_status === 'present')
          .map(s => s.student_name),
        attendanceAbsent: students
          .filter(s => s.attendance_status === 'absent')
          .map(s => s.student_name)
      };
    }));

    res.json(formattedSessions);
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    res.status(500).json({ error: 'Error al obtener sesiones' });
  }
});

// Crear o actualizar sesión
router.post('/', async (req, res) => {
  const session = req.body;
  
  try {
    await pool.query(`
      INSERT INTO class_sessions (id, date, start_time, end_time)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        date = VALUES(date),
        start_time = VALUES(start_time),
        end_time = VALUES(end_time)
    `, [session.id, session.date, session.startTime, session.endTime]);

    // Guardar estudiantes de la sesión
    if (session.students && session.students.length > 0) {
      await pool.query('DELETE FROM session_students WHERE session_id = ?', [session.id]);
      
      for (const studentName of session.students) {
        const status = session.attendanceConfirmed?.includes(studentName) 
          ? 'present' 
          : session.attendanceAbsent?.includes(studentName)
          ? 'absent'
          : 'none';

        await pool.query(
          'INSERT INTO session_students (session_id, student_name, attendance_status) VALUES (?, ?, ?)',
          [session.id, studentName, status]
        );
      }
    }

    res.json({ success: true, session });
  } catch (error) {
    console.error('Error al guardar sesión:', error);
    res.status(500).json({ error: 'Error al guardar sesión' });
  }
});

// Actualizar asistencia
router.post('/attendance', async (req, res) => {
  const { sessionId, studentName, status } = req.body;
  
  try {
    await pool.query(
      'UPDATE session_students SET attendance_status = ? WHERE session_id = ? AND student_name = ?',
      [status, sessionId, studentName]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    res.status(500).json({ error: 'Error al actualizar asistencia' });
  }
});

// Eliminar sesión
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM class_sessions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar sesión:', error);
    res.status(500).json({ error: 'Error al eliminar sesión' });
  }
});

export default router;
