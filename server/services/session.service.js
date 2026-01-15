import prisma from '../config/prisma.js';

/**
 * Servicio para gestionar sesiones de clase
 */
class SessionService {
  /**
   * Obtener todas las sesiones con sus estudiantes
   */
  async getAllSessions() {
    return await prisma.classSession.findMany({
      include: {
        sessionStudents: {
          include: {
            student: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });
  }

  /**
   * Obtener una sesión por ID
   */
  async getSessionById(id) {
    return await prisma.classSession.findUnique({
      where: { id },
      include: {
        sessionStudents: {
          include: {
            student: true
          }
        }
      }
    });
  }

  /**
   * Crear una nueva sesión
   */
  async createSession(data) {
    const { date, startTime, endTime, students } = data;

    // Crear la sesión
    const session = await prisma.classSession.create({
      data: {
        date: new Date(date),
        startTime,
        endTime
      }
    });

    // Asignar estudiantes a la sesión
    if (students && students.length > 0) {
      await this.assignStudentsToSession(session.id, students);
    }

    return await this.getSessionById(session.id);
  }

  /**
   * Actualizar una sesión
   */
  async updateSession(id, data) {
    const { date, startTime, endTime, students } = data;

    // Actualizar la sesión
    await prisma.classSession.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime })
      }
    });

    // Si se proporcionan estudiantes, actualizar la asignación
    if (students !== undefined) {
      // Eliminar estudiantes actuales
      await prisma.sessionStudent.deleteMany({
        where: { sessionId: id }
      });

      // Asignar nuevos estudiantes
      if (students.length > 0) {
        await this.assignStudentsToSession(id, students);
      }
    }

    return await this.getSessionById(id);
  }

  /**
   * Asignar estudiantes a una sesión
   */
  async assignStudentsToSession(sessionId, studentNames) {
    const studentsToAssign = await prisma.student.findMany({
      where: {
        name: { in: studentNames }
      }
    });

    const sessionStudents = studentsToAssign.map(student => ({
      sessionId,
      studentId: student.id,
      studentName: student.name,
      attendanceStatus: 'none'
    }));

    await prisma.sessionStudent.createMany({
      data: sessionStudents
    });
  }

  /**
   * Actualizar asistencia de un estudiante en una sesión
   */
  async updateAttendance(sessionId, studentName, status) {
    const sessionStudent = await prisma.sessionStudent.findFirst({
      where: {
        sessionId,
        studentName
      },
      include: {
        student: true
      }
    });

    if (!sessionStudent) {
      throw new Error('Estudiante no encontrado en la sesión');
    }

    // Actualizar estado de asistencia en SessionStudent
    await prisma.sessionStudent.update({
      where: { id: sessionStudent.id },
      data: {
        attendanceStatus: status === 'none' ? 'none' : status
      }
    });

    // Si el estudiante está marcado como presente, decrementar clases restantes
    if (status === 'present') {
      const student = sessionStudent.student;
      const newClassesRemaining = Math.max(0, student.classesRemaining - 1);

      await prisma.student.update({
        where: { id: student.id },
        data: {
          classesRemaining: newClassesRemaining,
          status: newClassesRemaining === 0 ? 'needs_renewal' : student.status
        }
      });

      // Crear o actualizar registro de asistencia
      await prisma.attendanceRecord.upsert({
        where: {
          studentId_sessionId: {
            studentId: student.id,
            sessionId
          }
        },
        create: {
          studentId: student.id,
          sessionId,
          date: (await prisma.classSession.findUnique({ where: { id: sessionId } })).date,
          status: 'present'
        },
        update: {
          status: 'present'
        }
      });
    } else if (status === 'absent') {
      // Crear o actualizar registro de asistencia como ausente
      const session = await prisma.classSession.findUnique({ where: { id: sessionId } });
      
      await prisma.attendanceRecord.upsert({
        where: {
          studentId_sessionId: {
            studentId: sessionStudent.studentId,
            sessionId
          }
        },
        create: {
          studentId: sessionStudent.studentId,
          sessionId,
          date: session.date,
          status: 'absent'
        },
        update: {
          status: 'absent'
        }
      });
    } else if (status === 'none') {
      // Eliminar registro de asistencia si existe
      await prisma.attendanceRecord.deleteMany({
        where: {
          studentId: sessionStudent.studentId,
          sessionId
        }
      });

      // Si antes estaba presente, restaurar la clase
      if (sessionStudent.attendanceStatus === 'present') {
        const student = sessionStudent.student;
        await prisma.student.update({
          where: { id: student.id },
          data: {
            classesRemaining: student.classesRemaining + 1
          }
        });
      }
    }

    return await this.getSessionById(sessionId);
  }

  /**
   * Eliminar una sesión
   */
  async deleteSession(id) {
    await prisma.classSession.delete({
      where: { id }
    });
  }
}

export default new SessionService();
