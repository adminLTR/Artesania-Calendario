
export const formatFecha = (fecha: string) => {
  return new Intl.DateTimeFormat('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    timeZone: 'Europe/Madrid'
  }).format(new Date(fecha));
};

export const getHoyMadrid = () => {
  const d = new Date();
  const madridDate = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Madrid'
  }).format(d);
  return madridDate; // YYYY-MM-DD
};

export const esAtrasada = (tarea: { fechaEntrega: string, concluida: boolean }) => {
  const hoy = getHoyMadrid();
  return !tarea.concluida && hoy > tarea.fechaEntrega;
};

export const diffDias = (d1: string, d2: string) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const generateMockData = () => {
  const members: any[] = [
    { id: 'm1', nombre: 'Alexander', rol: 'Director', responsabilidades: 'Gestión general, clases avanzadas', activo: true, color: '#E55B69' },
    { id: 'm2', nombre: 'Marta', rol: 'Ceramista', responsabilidades: 'Torno, horneadas de bizcocho', activo: true, color: '#6366f1' },
    { id: 'm3', nombre: 'Juan', rol: 'Mantenimiento', responsabilidades: 'Limpieza, hornos, amasado', activo: true, color: '#10b981' },
    { id: 'm4', nombre: 'Elena', rol: 'Admin', responsabilidades: 'Inscripciones, RRSS, stock', activo: true, color: '#f59e0b' },
  ];

  const hoy = new Date();
  const tasks: any[] = [];
  const categorias = ['horno', 'compras', 'clases', 'mantenimiento', 'rrss'];
  const prioridades = ['baja', 'media', 'alta'];

  for (let i = 1; i <= 20; i++) {
    const rIdx = Math.floor(Math.random() * members.length);
    const startOffset = Math.floor(Math.random() * 30) - 15;
    const duration = Math.floor(Math.random() * 8) + 2;
    
    const dInicio = new Date(hoy);
    dInicio.setDate(hoy.getDate() + startOffset);
    const dEntrega = new Date(dInicio);
    dEntrega.setDate(dInicio.getDate() + duration);

    const concluida = i < 10;
    
    tasks.push({
      id: `t${i}`,
      titulo: `${categorias[i % categorias.length].toUpperCase()} - Sesión ${i}`,
      descripcion: `Descripción detallada de la tarea de ${categorias[i % categorias.length]}`,
      responsableId: members[rIdx].id,
      fechaInicio: dInicio.toISOString().split('T')[0],
      fechaEntrega: dEntrega.toISOString().split('T')[0],
      concluida: concluida,
      fechaConcluida: concluida ? dEntrega.toISOString().split('T')[0] : undefined,
      progreso: concluida ? 100 : Math.floor(Math.random() * 80),
      prioridad: prioridades[i % 3],
      categoria: categorias[i % categorias.length],
      dependencias: [],
      creadaEn: hoy.toISOString(),
      actualizadaEn: hoy.toISOString(),
    });
  }

  return { members, tasks };
};
