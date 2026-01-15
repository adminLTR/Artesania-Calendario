import prisma from '../config/prisma.js';

/**
 * Servicio para gestionar piezas cerámicas
 */
class PieceService {
  /**
   * Convertir status del frontend (con espacios) al formato de Prisma (con guiones bajos)
   */
  convertStatusToPrisma(status) {
    const statusMap = {
      'creada': 'creada',
      'en secado': 'en_secado',
      'bizcochada': 'bizcochada',
      'esmaltada': 'esmaltada',
      'cocida final': 'cocida_final',
      'concluida': 'concluida'
    };
    return statusMap[status] || status;
  }

  /**
   * Convertir status de Prisma (con guiones bajos) al formato del frontend (con espacios)
   */
  convertStatusFromPrisma(status) {
    const statusMap = {
      'creada': 'creada',
      'en_secado': 'en secado',
      'bizcochada': 'bizcochada',
      'esmaltada': 'esmaltada',
      'cocida_final': 'cocida final',
      'concluida': 'concluida'
    };
    return statusMap[status] || status;
  }

  /**
   * Obtener todas las piezas
   */
  async getAllPieces() {
    return await prisma.ceramicPiece.findMany({
      include: {
        student: true
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    });
  }

  /**
   * Obtener una pieza por ID
   */
  async getPieceById(id) {
    return await prisma.ceramicPiece.findUnique({
      where: { id },
      include: {
        student: true
      }
    });
  }

  /**
   * Crear una nueva pieza
   */
  async createPiece(data) {
    const { alumnoId, owner, description, status, glazeType, deliveryDate, notes, extraCommentary, fechaCreacion } = data;

    return await prisma.ceramicPiece.create({
      data: {
        alumnoId: alumnoId || null,
        owner,
        description: description || null,
        status: this.convertStatusToPrisma(status || 'creada'),
        fechaCreacion: fechaCreacion ? new Date(fechaCreacion) : new Date(),
        glazeType: glazeType || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        notes: notes || null,
        extraCommentary: extraCommentary || null
      },
      include: {
        student: true
      }
    });
  }

  /**
   * Actualizar una pieza
   */
  async updatePiece(id, data) {
    const updateData = {};

    if (data.alumnoId !== undefined) updateData.alumnoId = data.alumnoId || null;
    if (data.owner !== undefined) updateData.owner = data.owner;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.status !== undefined) updateData.status = this.convertStatusToPrisma(data.status);
    if (data.glazeType !== undefined) updateData.glazeType = data.glazeType || null;
    if (data.deliveryDate !== undefined) updateData.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.extraCommentary !== undefined) updateData.extraCommentary = data.extraCommentary || null;
    if (data.fechaConclusion !== undefined) updateData.fechaConclusion = data.fechaConclusion ? new Date(data.fechaConclusion) : null;

    // Si cambia a concluida, establecer fecha de conclusión
    if (data.status === 'concluida' && !data.fechaConclusion) {
      updateData.fechaConclusion = new Date();
    }

    return await prisma.ceramicPiece.update({
      where: { id },
      data: updateData,
      include: {
        student: true
      }
    });
  }

  /**
   * Eliminar una pieza
   */
  async deletePiece(id) {
    return await prisma.ceramicPiece.delete({
      where: { id }
    });
  }

  /**
   * Obtener piezas por alumno
   */
  async getPiecesByStudent(alumnoId) {
    return await prisma.ceramicPiece.findMany({
      where: { alumnoId },
      orderBy: {
        fechaCreacion: 'desc'
      },
      include: {
        student: true
      }
    });
  }

  /**
   * Obtener piezas por estado
   */
  async getPiecesByStatus(status) {
    return await prisma.ceramicPiece.findMany({
      where: { status },
      orderBy: {
        fechaCreacion: 'desc'
      },
      include: {
        student: true
      }
    });
  }
}

export default new PieceService();
