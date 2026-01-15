const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  // Estudiantes
  async getStudents() {
    const response = await fetch(`${API_BASE_URL}/students`);
    if (!response.ok) throw new Error('Error al obtener estudiantes');
    return response.json();
  }

  async saveStudent(student) {
    // Si tiene ID, es una actualización (PUT), si no, es creación (POST)
    const isUpdate = !!student.id;
    const url = isUpdate ? `${API_BASE_URL}/students/${student.id}` : `${API_BASE_URL}/students`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    // Mapear datos del frontend al formato del backend
    const payload = {
      name: student.name,
      phone: student.phone,
      classesRemaining: student.classesRemaining,
      status: student.status,
      paymentMethod: student.paymentMethod,
      notes: student.notes,
      price: student.price,
      classType: student.classType,
      expiryDate: student.expiryDate,
      assignedClasses: student.assignedClasses || []
    };
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error al ${isUpdate ? 'actualizar' : 'crear'} estudiante`);
    }
    
    const data = await response.json();
    // El backend devuelve directamente el estudiante
    return data;
  }

  async deleteStudent(id) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar estudiante');
    return response.json();
  }

  // Sesiones
  async getSessions() {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    if (!response.ok) throw new Error('Error al obtener sesiones');
    return response.json();
  }

  async saveSession(session) {
    const isUpdate = !!session.id;
    const url = isUpdate ? `${API_BASE_URL}/sessions/${session.id}` : `${API_BASE_URL}/sessions`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    if (!response.ok) throw new Error('Error al guardar sesión');
    return response.json();
  }

  async updateAttendance(sessionId, studentName, status) {
    const response = await fetch(`${API_BASE_URL}/sessions/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, studentName, status })
    });
    if (!response.ok) throw new Error('Error al actualizar asistencia');
    return response.json();
  }

  async deleteSession(id) {
    const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar sesión');
    return response.json();
  }

  // Piezas cerámicas
  async getPieces() {
    const response = await fetch(`${API_BASE_URL}/pieces`);
    if (!response.ok) throw new Error('Error al obtener piezas');
    return response.json();
  }

  async savePiece(piece) {
    // Si tiene ID, es una actualización (PUT), si no, es creación (POST)
    const isUpdate = !!piece.id;
    const url = isUpdate ? `${API_BASE_URL}/pieces/${piece.id}` : `${API_BASE_URL}/pieces`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(piece)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Error al ${isUpdate ? 'actualizar' : 'crear'} pieza`);
    }
    
    return response.json();
  }

  async deletePiece(id) {
    const response = await fetch(`${API_BASE_URL}/pieces/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar pieza');
    return response.json();
  }

  // Clientes
  async getClients() {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) throw new Error('Error al obtener clientes');
    return response.json();
  }

  async saveClient(client) {
    const isUpdate = !!client.id;
    const url = isUpdate ? `${API_BASE_URL}/clients/${client.id}` : `${API_BASE_URL}/clients`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    if (!response.ok) throw new Error('Error al guardar cliente');
    return response.json();
  }

  async deleteClient(id) {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar cliente');
    return response.json();
  }

  // Gift Cards
  async getGiftCards() {
    const response = await fetch(`${API_BASE_URL}/giftcards`);
    if (!response.ok) throw new Error('Error al obtener gift cards');
    return response.json();
  }

  async saveGiftCard(giftcard) {
    const isUpdate = !!giftcard.id;
    const url = isUpdate ? `${API_BASE_URL}/giftcards/${giftcard.id}` : `${API_BASE_URL}/giftcards`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(giftcard)
    });
    if (!response.ok) throw new Error('Error al guardar gift card');
    return response.json();
  }

  async deleteGiftCard(id) {
    const response = await fetch(`${API_BASE_URL}/giftcards/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar gift card');
    return response.json();
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Error en health check');
    return response.json();
  }
}

export default new ApiService();
