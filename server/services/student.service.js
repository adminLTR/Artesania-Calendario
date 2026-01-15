import prisma from '../config/prisma.js';

/**
 * Servicio para gestionar operaciones de Estudiantes
 */
class StudentService {
  /**
   * Obtener todos los estudiantes con sus relaciones
   */
  async getAllStudents() {
    return await prisma.student.findMany({
      include: {
        assignedClasses: {
          orderBy: { date: 'asc' }
        },
        attendanceRecords: {
          orderBy: { date: 'desc' }
        },
        pieces: {
          where: {
            status: { not: 'concluida' }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Obtener un estudiante por ID
   */
  async getStudentById(id) {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        assignedClasses: true,
        attendanceRecords: {
          orderBy: { date: 'desc' }
        },
        pieces: true
      }
    });
  }

  /**
   * Crear un nuevo estudiante
   */
  async createStudent(data) {
    const { assignedClasses, ...studentData } = data;
    
    return await prisma.student.create({
      data: {
        ...studentData,
        assignedClasses: assignedClasses ? {
          create: assignedClasses.map(ac => ({
            date: new Date(ac.date),
            startTime: ac.startTime,
            endTime: ac.endTime
          }))
        } : undefined
      },
      include: {
        assignedClasses: true,
        attendanceRecords: true
      }
    });
  }

  /**
   * Actualizar un estudiante
   */
  async updateStudent(id, data) {
    const { assignedClasses, ...studentData } = data;
    
    // Si hay clases asignadas, primero eliminar las existentes
    if (assignedClasses !== undefined) {
      await prisma.assignedClass.deleteMany({
        where: { studentId: id }
      });
    }

    return await prisma.student.update({
      where: { id },
      data: {
        ...studentData,
        assignedClasses: assignedClasses ? {
          create: assignedClasses.map(ac => ({
            date: new Date(ac.date),
            startTime: ac.startTime,
            endTime: ac.endTime
          }))
        } : undefined
      },
      include: {
        assignedClasses: true,
        attendanceRecords: true,
        pieces: true
      }
    });
  }

  /**
   * Eliminar un estudiante
   */
  async deleteStudent(id) {
    return await prisma.student.delete({
      where: { id }
    });
  }

  /**
   * Renovar bono de un estudiante
   */
  async renewStudent(id, numClasses) {
    const student = await prisma.student.findUnique({ where: { id } });
    
    if (!student) {
      throw new Error('Estudiante no encontrado');
    }

    return await prisma.student.update({
      where: { id },
      data: {
        classesRemaining: student.classesRemaining + numClasses,
        status: 'regular'
      },
      include: {
        assignedClasses: true,
        attendanceRecords: true
      }
    });
  }

  /**
   * Actualizar asistencia de un estudiante
   */
  async updateAttendance(studentId, sessionId, date, status) {
    // Primero verificar si ya existe un registro
    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId
        }
      }
    });

    if (status === 'none' && existing) {
      // Eliminar registro si el status es 'none'
      await prisma.attendanceRecord.delete({
        where: { id: existing.id }
      });
      return null;
    }

    if (status !== 'none') {
      // Crear o actualizar registro
      return await prisma.attendanceRecord.upsert({
        where: {
          studentId_sessionId: {
            studentId,
            sessionId
          }
        },
        create: {
          studentId,
          sessionId,
          date: new Date(date),
          status
        },
        update: {
          status,
          date: new Date(date)
        }
      });
    }

    return null;
  }

  /**
   * Buscar estudiantes por nombre
   */
  async searchStudents(query) {
    return await prisma.student.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        assignedClasses: true,
        attendanceRecords: true
      }
    });
  }

  /**
   * Obtener estudiantes por estado
   */
  async getStudentsByStatus(status) {
    return await prisma.student.findMany({
      where: { status },
      include: {
        assignedClasses: true,
        attendanceRecords: true
      }
    });
  }
}

export default new StudentService();
