
import React, { useState, useEffect, useMemo } from 'react';
import { EquipoMember, Tarea, TeamTasksData, PrioridadTarea } from './types';
import { getHoyMadrid, formatFecha, esAtrasada, generateMockData } from './utils';
import GanttChart from './GanttChart';

const STORAGE_KEY = 'ceramica_team_tasks_v2';

const TeamTasksModule: React.FC = () => {
  const [data, setData] = useState<TeamTasksData>({ members: [], tasks: [] });
  const [viewMode, setViewMode] = useState<'panel' | 'gantt'>('panel');
  const [activeMemberFilter, setActiveMemberFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'concluidas' | 'no_concluidas' | 'atrasadas'>('todas');
  
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  const [editingMember, setEditingMember] = useState<EquipoMember | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      const mock = generateMockData();
      setData(mock);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    }
  }, []);

  useEffect(() => {
    if (data.members.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const filteredTasks = useMemo(() => {
    return data.tasks.filter(t => {
      const matchMember = activeMemberFilter === 'todos' || t.responsableId === activeMemberFilter;
      const matchSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.categoria.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = 
        statusFilter === 'todas' ? true :
        statusFilter === 'concluidas' ? t.concluida :
        statusFilter === 'no_concluidas' ? !t.concluida :
        statusFilter === 'atrasadas' ? esAtrasada(t) : true;
      return matchMember && matchSearch && matchStatus;
    }).sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
  }, [data.tasks, activeMemberFilter, searchQuery, statusFilter]);

  // Agrupar tareas por responsable para la vista de panel
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Tarea[]> = {};
    filteredTasks.forEach(task => {
      if (!groups[task.responsableId]) groups[task.responsableId] = [];
      groups[task.responsableId].push(task);
    });
    return groups;
  }, [filteredTasks]);

  const stats = useMemo(() => {
    const total = data.tasks.length;
    const concluidas = data.tasks.filter(t => t.concluida).length;
    const atrasadas = data.tasks.filter(t => esAtrasada(t)).length;
    return { total, concluidas, atrasadas, noConcluidas: total - concluidas };
  }, [data.tasks]);

  const handleToggleTask = (task: Tarea) => {
    const isNowConcluida = !task.concluida;
    const hoy = getHoyMadrid();
    const updatedTasks = data.tasks.map(t => {
      if (t.id === task.id) {
        return { 
          ...t, 
          concluida: isNowConcluida, 
          progreso: isNowConcluida ? 100 : t.progreso,
          fechaConcluida: isNowConcluida ? hoy : undefined,
          actualizadaEn: new Date().toISOString()
        };
      }
      return t;
    });
    setData({ ...data, tasks: updatedTasks });
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea permanentemente?')) {
      const updatedTasks = data.tasks.filter(t => t.id !== id);
      setData({ ...data, tasks: updatedTasks });
      setShowTaskModal(false);
    }
  };

  const handleSaveTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData: Partial<Tarea> = {
      titulo: formData.get('titulo') as string,
      descripcion: formData.get('descripcion') as string,
      responsableId: formData.get('responsableId') as string,
      fechaInicio: formData.get('fechaInicio') as string,
      fechaEntrega: formData.get('fechaEntrega') as string,
      prioridad: formData.get('prioridad') as PrioridadTarea,
      categoria: formData.get('categoria') as string,
      progreso: parseInt(formData.get('progreso') as string || '0'),
      actualizadaEn: new Date().toISOString(),
    };

    if (editingTask) {
      const updated = data.tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t);
      setData({ ...data, tasks: updated });
    } else {
      const nueva: Tarea = {
        id: Math.random().toString(36).substr(2, 9),
        creadaEn: new Date().toISOString(),
        concluida: false,
        dependencias: [],
        ...(taskData as Tarea)
      };
      setData({ ...data, tasks: [nueva, ...data.tasks] });
    }
    setShowTaskModal(false);
  };

  const handleSaveMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const memberData: Partial<EquipoMember> = {
      nombre: formData.get('nombre') as string,
      rol: formData.get('rol') as string,
      responsabilidades: formData.get('responsabilidades') as string,
      color: formData.get('color') as string,
      activo: formData.get('activo') === 'on',
    };

    if (editingMember) {
      const updated = data.members.map(m => m.id === editingMember.id ? { ...m, ...memberData } : m);
      setData({ ...data, members: updated });
    } else {
      const nuevo: EquipoMember = {
        id: Math.random().toString(36).substr(2, 9),
        ...(memberData as EquipoMember)
      };
      setData({ ...data, members: [...data.members, nuevo] });
    }
    setShowMemberModal(false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const getMemberById = (id: string) => data.members.find(m => m.id === id);

  return (
    <div className="h-full flex flex-col bg-[#FDF2F2] overflow-hidden">
      {/* Header Fijo */}
      <div className="bg-white/80 backdrop-blur-md border-b border-red-50 p-6 md:p-8 shrink-0 mx-4 md:mx-8 mt-4 rounded-[2.5rem] shadow-sm z-10 no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight leading-none">Tareas del Equipo</h2>
            <div className="flex gap-4 mt-3">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{stats.total} TOTAL</span>
              <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">{stats.concluidas} LISTAS</span>
              <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">{stats.atrasadas} ATRASADAS</span>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => { setEditingMember(null); setShowMemberModal(true); }} className="px-5 py-3 border-2 border-red-50 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors">Nuevo Miembro</button>
             <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="px-7 py-3 bg-[#E55B69] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-red-100/50 hover:brightness-110 active:scale-95 transition-all">Nueva Tarea</button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex bg-[#FDF2F2] p-1.5 rounded-2xl border border-red-50 w-full md:w-auto">
            <button onClick={() => setViewMode('panel')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'panel' ? 'bg-white text-[#E55B69] shadow-md' : 'text-gray-400'}`}>Vista Panel</button>
            <button onClick={() => setViewMode('gantt')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'gantt' ? 'bg-white text-[#E55B69] shadow-md' : 'text-gray-400'}`}>Timeline</button>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {viewMode === 'gantt' && (
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#1e2330] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-black transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Exportar PDF
              </button>
            )}
            <select value={activeMemberFilter} onChange={(e) => setActiveMemberFilter(e.target.value)} className="flex-1 md:flex-none px-5 py-2.5 border-2 border-red-50 rounded-2xl text-[11px] font-bold uppercase outline-none focus:border-[#E55B69] bg-white appearance-none cursor-pointer">
              <option value="todos">Todos los responsables</option>
              {data.members.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
            <input type="text" placeholder="BUSCAR POR TÍTULO..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 md:w-56 px-5 py-2.5 border-2 border-red-50 rounded-2xl text-[11px] font-bold uppercase outline-none focus:border-[#E55B69] bg-white" />
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-hidden p-4 md:p-8 print-container">
        {viewMode === 'panel' ? (
          <div className="h-full overflow-y-auto space-y-12 custom-scrollbar pb-32 px-2 no-print">
            {data.members
              .filter(m => activeMemberFilter === 'todos' || m.id === activeMemberFilter)
              .map(member => {
                const memberTasks = groupedTasks[member.id] || [];
                return (
                  <div key={member.id} className="animate-fade-in">
                    {/* Cabecera del Miembro */}
                    <div className="flex items-center justify-between mb-6 px-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-gray-200/50"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.nombre.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-none uppercase">{member.nombre}</h3>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">{member.rol} • {memberTasks.length} TAREAS ASIGNADAS</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setEditingMember(member); setShowMemberModal(true); }}
                        className="p-3 text-gray-300 hover:text-[#E55B69] hover:bg-white rounded-2xl transition-all border border-transparent hover:border-red-50"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                      </button>
                    </div>

                    {/* Listado de Tareas del Miembro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
                      {memberTasks.length > 0 ? memberTasks.map(tarea => (
                        <div key={tarea.id} className="bg-white p-7 rounded-[2.8rem] border border-white shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between min-h-[220px]">
                          <div className="flex justify-between items-start mb-6">
                            <div className="max-w-[80%]">
                              <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] mb-2 block">{tarea.categoria}</span>
                              <h4 className={`text-xl font-black leading-tight ${tarea.concluida ? 'line-through text-gray-300 opacity-60' : 'text-gray-800'}`}>{tarea.titulo}</h4>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button onClick={() => handleToggleTask(tarea)} className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${tarea.concluida ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-red-50 text-red-100 hover:text-green-500 hover:border-green-500'}`}>
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" /></svg>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-8 border-t border-red-50 pt-6">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">FECHA ENTREGA</span>
                                <span className={`text-[15px] font-black ${esAtrasada(tarea) ? 'text-red-500' : 'text-gray-700'}`}>{formatFecha(tarea.fechaEntrega)}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">PROGRESO</span>
                                  <span className="text-[12px] font-black text-gray-800">{tarea.progreso}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                  <div className={`h-full transition-all duration-700 ease-out ${tarea.concluida ? 'bg-green-500' : 'bg-[#E55B69]'}`} style={{ width: `${tarea.progreso}%` }} />
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => { setEditingTask(tarea); setShowTaskModal(true); }}
                                className="px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#E55B69] bg-red-50/50 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                Detalles / Editar
                              </button>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-full py-12 px-10 border-2 border-dashed border-red-50 rounded-[3rem] flex flex-col items-center justify-center text-center bg-white/30 backdrop-blur-sm">
                           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mb-4">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <p className="text-gray-300 font-black uppercase text-[11px] tracking-[0.2em]">Sin tareas activas para este responsable</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {filteredTasks.length === 0 && searchQuery !== '' && (
              <div className="py-32 text-center">
                 <p className="text-gray-300 font-black uppercase text-sm tracking-[0.3em]">No se encontraron tareas con "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          <GanttChart 
            tasks={filteredTasks} 
            members={data.members} 
            onTaskClick={(t) => { setEditingTask(t); setShowTaskModal(true); }}
          />
        )}
      </div>

      {/* Modales y Resto (Ocultos en impresión por no-print en Sidebar/Header) */}
      <div className="no-print">
        {/* Modal Tarea */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-10 md:p-14 shadow-2xl animate-fade-in relative overflow-hidden flex flex-col max-h-[90vh]">
              <button onClick={() => setShowTaskModal(false)} className="absolute top-10 right-10 p-2 text-gray-200 hover:text-gray-400 transition-colors">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="overflow-y-auto custom-scrollbar pr-2">
                <h3 className="text-3xl font-black uppercase text-gray-800 mb-2 leading-tight">{editingTask ? 'Ficha de Tarea' : 'Nueva Tarea'}</h3>
                <p className="text-gray-400 text-sm font-medium mb-10">Define los detalles y el seguimiento de la actividad.</p>
                <form onSubmit={handleSaveTask} className="space-y-8">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">TÍTULO DE LA ACTIVIDAD</label>
                    <input required name="titulo" defaultValue={editingTask?.titulo} className="w-full px-8 py-5 border-2 border-red-50 rounded-[1.8rem] outline-none focus:border-[#E55B69] font-black text-xl text-gray-800 placeholder:text-gray-200" placeholder="Ej: HORNEADA DE BIZCOCHO" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">RESPONSABLE</label>
                      <select name="responsableId" defaultValue={editingTask?.responsableId} className="w-full px-7 py-5 border-2 border-red-50 rounded-[1.8rem] bg-white font-bold text-gray-700 appearance-none cursor-pointer">
                        {data.members.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">CATEGORÍA / ÁREA</label>
                      <input name="categoria" defaultValue={editingTask?.categoria || 'GENERAL'} className="w-full px-7 py-5 border-2 border-red-50 rounded-[1.8rem] font-bold uppercase text-gray-700" placeholder="Ej: LOGÍSTICA" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">FECHA INICIO</label>
                      <input required type="date" name="fechaInicio" defaultValue={editingTask?.fechaInicio || getHoyMadrid()} className="w-full px-6 py-5 border-2 border-red-50 rounded-[1.8rem] font-black text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">FECHA ENTREGA</label>
                      <input required type="date" name="fechaEntrega" defaultValue={editingTask?.fechaEntrega || getHoyMadrid()} className="w-full px-6 py-5 border-2 border-red-50 rounded-[1.8rem] font-black text-gray-800" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[11px] font-black uppercase text-gray-300 tracking-[0.2em]">PROGRESO ACTUAL</label>
                      <span className="text-sm font-black text-[#E55B69]" id="progresso-val">{editingTask?.progreso || 0}%</span>
                    </div>
                    <input type="range" name="progreso" min="0" max="100" defaultValue={editingTask?.progreso || 0} className="w-full h-2 bg-red-50 rounded-lg appearance-none cursor-pointer accent-[#E55B69]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">DESCRIPCIÓN DETALLADA</label>
                    <textarea name="description" defaultValue={editingTask?.descripcion} className="w-full px-8 py-5 border-2 border-red-50 rounded-[1.8rem] min-h-[140px] font-medium text-gray-600 resize-none placeholder:text-gray-200" placeholder="Especificaciones sobre la tarea..." />
                  </div>
                  <div className="pt-8 flex flex-col gap-5">
                    <button type="submit" className="w-full py-6 bg-[#E55B69] text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl shadow-red-100/50 hover:brightness-110 active:scale-95 transition-all text-lg">Guardar Cambios</button>
                    {editingTask && (
                      <button type="button" onClick={() => handleDeleteTask(editingTask.id)} className="w-full py-4 text-red-500 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-red-50 rounded-[1.5rem] transition-colors border-2 border-transparent hover:border-red-100">Borrar Tarea Permanentemente</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Miembro */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-10 md:p-14 shadow-2xl animate-fade-in relative overflow-hidden">
              <button onClick={() => setShowMemberModal(false)} className="absolute top-10 right-10 p-2 text-gray-200 hover:text-gray-400 transition-colors">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-3xl font-black uppercase text-gray-800 mb-2 leading-tight">{editingMember ? 'Perfil de Equipo' : 'Nuevo Integrante'}</h3>
              <p className="text-gray-400 text-sm font-medium mb-10">Configura los datos y la identidad visual del miembro.</p>
              <form onSubmit={handleSaveMember} className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">NOMBRE COMPLETO</label>
                  <input required name="nombre" defaultValue={editingMember?.nombre} className="w-full px-8 py-5 border-2 border-red-50 rounded-[1.8rem] outline-none focus:border-[#E55B69] font-black text-xl text-gray-800" placeholder="Ej: MARTA SOLER" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">ROL / CARGO</label>
                    <input required name="rol" defaultValue={editingMember?.rol} className="w-full px-7 py-5 border-2 border-red-50 rounded-[1.8rem] font-bold uppercase text-gray-700" placeholder="Ej: CERAMISTA" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">COLOR ASIGNADO</label>
                    <div className="flex gap-4 items-center h-[66px] px-6 border-2 border-red-50 rounded-[1.8rem] bg-white">
                      <input type="color" name="color" defaultValue={editingMember?.color || '#E55B69'} className="w-10 h-10 bg-transparent border-0 rounded-lg cursor-pointer shrink-0" />
                      <span className="text-[10px] font-black text-gray-300 uppercase">IDENTIDAD VISUAL</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-300 tracking-[0.2em] mb-3">RESPONSABILIDADES CLAVE</label>
                  <textarea name="responsabilidades" defaultValue={editingMember?.responsabilidades} className="w-full px-8 py-5 border-2 border-red-50 rounded-[1.8rem] min-h-[120px] font-medium text-gray-600 resize-none" placeholder="Describe sus funciones principales..." />
                </div>
                <div className="flex items-center gap-4 py-2 px-4 bg-red-50/20 rounded-[1.5rem]">
                  <input type="checkbox" name="activo" defaultChecked={editingMember?.activo !== false} className="w-6 h-6 accent-[#E55B69] rounded-xl cursor-pointer" />
                  <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest cursor-pointer">INTEGRANTE ACTIVO ACTUALMENTE</label>
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full py-6 bg-[#E55B69] text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl shadow-red-100/50 hover:brightness-110 active:scale-95 transition-all text-lg">Guardar Perfil</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamTasksModule;
