
import React, { useState, useMemo } from 'react';
import { ClassSession, Student } from '../types';

interface CalendarViewProps {
  sessions: ClassSession[];
  onAddSession: (session: Omit<ClassSession, 'id'>) => void;
  onUpdateSession: (id: string, updates: Partial<ClassSession>) => void;
  onDeleteSession: (id: string) => void;
  students: Student[];
  onMarkAttendance: (sessionId: string, studentName: string, status: 'present' | 'absent' | 'none') => void;
}

type CalendarMode = 'day' | 'month';

const CalendarView: React.FC<CalendarViewProps> = ({ sessions, onAddSession, onUpdateSession, onDeleteSession, students, onMarkAttendance }) => {
  const [viewMode, setViewMode] = useState<CalendarMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [attendanceTab, setAttendanceTab] = useState<'edit' | 'attendance'>('attendance');
  
  const [sessionForm, setSessionForm] = useState({
    date: '',
    startTime: '10:00',
    endTime: '12:00',
    selectedStudents: [] as string[],
  });

  const hours = Array.from({ length: 14 }, (_, i) => i + 9); 
  const HOUR_HEIGHT = 100;

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const handleOpenAttendance = (session: ClassSession) => {
    setEditingSessionId(session.id);
    setSessionForm({
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      selectedStudents: [...(session.students || [])],
    });
    setAttendanceTab('attendance');
    setShowSessionModal(true);
  };

  const handleOpenEdit = (session: ClassSession) => {
    setEditingSessionId(session.id);
    setSessionForm({
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      selectedStudents: [...(session.students || [])],
    });
    setAttendanceTab('edit');
    setShowSessionModal(true);
  };

  const handleCreateNew = (dateKey: string, hourStart: string) => {
    setEditingSessionId(null);
    setSessionForm({
      date: dateKey,
      startTime: hourStart,
      endTime: `${String(parseInt(hourStart) + 2).padStart(2, '0')}:00`,
      selectedStudents: [],
    });
    setAttendanceTab('edit');
    setShowSessionModal(true);
  };

  const weekDays = useMemo(() => {
    const days = [];
    const baseDate = new Date(selectedDate);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthLastDay - i), currentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }
    while (days.length < 42) {
      const nextDay = days.length - (daysInMonth + startOffset) + 1;
      days.push({ date: new Date(year, month + 1, nextDay), currentMonth: false });
    }
    return days;
  }, [selectedDate]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submission = {
      date: sessionForm.date,
      startTime: sessionForm.startTime,
      endTime: sessionForm.endTime,
      students: [...sessionForm.selectedStudents]
    };

    if (editingSessionId) {
      onUpdateSession(editingSessionId, submission);
    } else {
      onAddSession(submission);
    }
    setShowSessionModal(false);
  };

  const currentSessionData = useMemo(() => {
    return editingSessionId ? sessions.find(s => s.id === editingSessionId) : null;
  }, [editingSessionId, sessions]);

  const renderDayView = () => {
    const dateKey = formatDateKey(selectedDate);
    const daySessions = sessions.filter(s => s.date === dateKey);
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in">
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 px-4 overflow-x-auto pb-2 no-scrollbar">
          {weekDays.map((date, i) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(new Date(date))}
                className={`flex flex-col items-center min-w-[65px] py-4 rounded-2xl transition-all ${isSelected ? 'bg-[#E55B69] text-white shadow-xl scale-105' : 'bg-white text-gray-300'}`}
              >
                <span className="text-[10px] font-black uppercase mb-1">{date.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                <span className="text-xl font-black">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 bg-white rounded-t-[3rem] border-x border-t border-red-50 shadow-inner overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar p-6 lg:p-10">
            <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
              {hours.map((h) => (
                <div key={h} onClick={() => handleCreateNew(dateKey, `${String(h).padStart(2, '0')}:00`)} className="relative border-t border-gray-50 h-[100px] cursor-pointer hover:bg-red-50/20">
                  <span className="w-16 text-right pr-4 text-xs font-black text-gray-200 -mt-3">{h}:00</span>
                </div>
              ))}
              
              {daySessions.map((session) => {
                const [h, m] = session.startTime.split(':').map(Number);
                const [eh, em] = session.endTime.split(':').map(Number);
                const top = ((h * 60 + m - 9 * 60) / 60) * HOUR_HEIGHT;
                const height = ((eh * 60 + em - (h * 60 + m)) / 60) * HOUR_HEIGHT;
                const confirmedCount = session.attendanceConfirmed?.length || 0;
                
                return (
                  <div 
                    key={session.id}
                    className="absolute left-[70px] right-2 rounded-[2rem] bg-white border border-red-100 shadow-xl z-10 p-4 flex flex-col border-l-4 border-l-[#E55B69] hover:scale-[1.01] transition-transform overflow-y-auto"
                    style={{ top: `${top}px`, height: `${Math.max(120, height)}px`, maxHeight: `${height}px` }}
                  >
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-3 py-1 bg-red-50 text-[#E55B69] rounded-full text-[10px] font-black uppercase">{session.startTime} - {session.endTime}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(session); }} 
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-[#E55B69] rounded-xl border border-gray-100 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span className="text-[10px] font-manrope font-extrabold uppercase tracking-widest">EDITAR</span>
                        </button>
                      </div>
                      <h4 className="text-xl font-black text-gray-800 leading-tight">Clase de Cerámica</h4>
                      
                      {/* Mostrar nombres de alumnos asignados */}
                      <div className="mt-2 mb-2 max-h-16 overflow-y-auto custom-scrollbar">
                        <p className="text-[10px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-1">Alumnos Asignados:</p>
                        <div className="flex flex-wrap gap-1">
                          {session.students && session.students.length > 0 ? (
                            session.students.map((name, idx) => (
                              <span key={idx} className="text-[11px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-300 italic">Sin alumnos</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <p className="text-[10px] font-manrope font-extrabold text-[#E55B69] uppercase tracking-widest mb-2">
                        {confirmedCount} / {(session.students || []).length} ASISTENCIAS CONFIRMADAS
                      </p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenAttendance(session); }}
                        className="w-full py-3 bg-[#E55B69] text-white rounded-xl text-[12px] font-manrope font-extrabold uppercase tracking-widest shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        CONTROL ASISTENCIA
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="flex-1 bg-white rounded-t-[3rem] border-x border-t border-red-50 p-6 md:p-10 shadow-inner overflow-y-auto custom-scrollbar animate-fade-in flex flex-col items-center">
        <div className="w-full max-w-2xl flex justify-between items-center mb-8">
          <button onClick={() => changeMonth(-1)} className="p-3 bg-red-50 rounded-full text-[#E55B69] hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-xl md:text-2xl font-manrope font-extrabold text-[#1e2330] uppercase tracking-widest">
            {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => changeMonth(1)} className="p-3 bg-red-50 rounded-full text-[#E55B69] hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        
        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-7 mb-4">
            {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {monthDays.map((day, i) => {
              const dateKey = formatDateKey(day.date);
              const hasEvents = sessions.some(s => s.date === dateKey);
              const isSelected = day.date.toDateString() === selectedDate.toDateString();
              const isToday = day.date.toDateString() === new Date().toDateString();

              return (
                <div 
                  key={i} 
                  onClick={() => { setSelectedDate(new Date(day.date)); setViewMode('day'); }}
                  className={`aspect-square rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center relative cursor-pointer transition-all border ${!day.currentMonth ? 'opacity-20 grayscale' : 'opacity-100'} ${isSelected ? 'bg-[#E55B69] text-white border-[#E55B69] scale-105 shadow-xl z-10' : 'bg-white border-red-50 hover:border-red-200'} ${isToday && !isSelected ? 'ring-2 ring-red-100' : ''}`}
                >
                  <span className={`text-lg md:text-2xl font-black ${isSelected ? 'text-white' : 'text-gray-800'}`}>{day.date.getDate()}</span>
                  {hasEvents && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-[#E55B69]'}`}></div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-manrope font-extrabold text-gray-800 uppercase leading-none">AGENDA</h2>
          <p className="text-[10px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mt-1">Planificación del taller</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-red-50 shadow-sm">
          <button onClick={() => setViewMode('day')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${viewMode === 'day' ? 'bg-[#E55B69] text-white shadow-md' : 'text-gray-400 hover:text-[#E55B69]'}`}>DÍA</button>
          <button onClick={() => setViewMode('month')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${viewMode === 'month' ? 'bg-[#E55B69] text-white shadow-md' : 'text-gray-400 hover:text-[#E55B69]'}`}>MES</button>
        </div>
      </div>

      {viewMode === 'day' ? renderDayView() : renderMonthView()}

      {showSessionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative animate-fade-in my-8">
            <button onClick={() => setShowSessionModal(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-600 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="flex items-center gap-6 mb-8 border-b border-red-50 pb-6">
               <button onClick={() => setAttendanceTab('attendance')} className={`text-xl font-manrope font-extrabold uppercase tracking-tight ${attendanceTab === 'attendance' ? 'text-[#E55B69]' : 'text-gray-300'}`}>Asistencia</button>
               <button onClick={() => setAttendanceTab('edit')} className={`text-xl font-manrope font-extrabold uppercase tracking-tight ${attendanceTab === 'edit' ? 'text-[#E55B69]' : 'text-gray-300'}`}>Ajustes</button>
            </div>

            {attendanceTab === 'attendance' && currentSessionData ? (
              <div className="space-y-4 animate-fade-in">
                <p className="text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-6">Confirma los presentes de hoy:</p>
                {(currentSessionData.students || []).length > 0 ? (currentSessionData.students || []).map((studentName, i) => {
                  const s = students.find(st => st.name === studentName);
                  const isPresent = currentSessionData.attendanceConfirmed?.includes(studentName);
                  const isAbsent = currentSessionData.attendanceAbsent?.includes(studentName);
                  
                  return (
                    <div key={i} className={`flex items-center justify-between p-5 bg-white rounded-2xl border transition-all ${isPresent ? 'border-green-200 bg-green-50/10' : isAbsent ? 'border-red-200 bg-red-50/10' : 'border-red-50'}`}>
                      <div>
                        <p className={`text-lg font-manrope font-extrabold ${isPresent ? 'text-green-600' : isAbsent ? 'text-red-500' : 'text-gray-800'}`}>{studentName}</p>
                        <p className="text-[10px] font-manrope font-extrabold text-gray-400 uppercase tracking-widest">{s?.classesRemaining || 0} CLASES RESTANTES</p>
                      </div>
                      <div className="flex gap-2">
                        {/* Botón para Presente */}
                        <button 
                          onClick={() => onMarkAttendance(currentSessionData.id, studentName, isPresent ? 'none' : 'present')}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${isPresent ? 'bg-green-500 text-white' : 'bg-white border border-gray-100 text-gray-200 hover:text-green-500'}`}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                        </button>
                        
                        {/* Botón para Ausente */}
                        <button 
                          onClick={() => onMarkAttendance(currentSessionData.id, studentName, isAbsent ? 'none' : 'absent')}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm ${isAbsent ? 'bg-red-500 text-white' : 'bg-white border border-gray-100 text-gray-200 hover:text-red-500'}`}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-manrope font-extrabold uppercase tracking-widest text-xs">No hay alumnos asignados a esta sesión</p>
                    <button onClick={() => setAttendanceTab('edit')} className="mt-4 text-[#E55B69] font-black text-xs uppercase tracking-tighter hover:underline">Ir a Ajustes para añadir alumnos</button>
                  </div>
                )}
                <button onClick={() => setShowSessionModal(false)} className="w-full mt-6 py-5 bg-[#1e2330] text-white rounded-2xl font-manrope font-extrabold uppercase tracking-widest">CERRAR CONTROL</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[11px] font-black text-gray-300 uppercase tracking-widest mb-2">Fecha</label>
                    <input type="date" value={sessionForm.date} onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})} className="w-full px-5 py-4 border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px]" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="time" value={sessionForm.startTime} onChange={(e) => setSessionForm({...sessionForm, startTime: e.target.value})} className="w-full px-5 py-4 border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px]" required />
                    <input type="time" value={sessionForm.endTime} onChange={(e) => setSessionForm({...sessionForm, endTime: e.target.value})} className="w-full px-5 py-4 border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px]" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-300 uppercase tracking-widest mb-2">Seleccionar Alumnos ({sessionForm.selectedStudents.length})</label>
                  <div className="p-4 bg-red-50/20 rounded-2xl max-h-48 overflow-y-auto space-y-2 border-2 border-red-50 custom-scrollbar">
                    {students.length > 0 ? students.map(s => (
                      <button key={s.id} type="button" onClick={() => {
                        const cur = sessionForm.selectedStudents;
                        setSessionForm({...sessionForm, selectedStudents: cur.includes(s.name) ? cur.filter(n => n !== s.name) : [...cur, s.name]});
                      }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-manrope font-extrabold transition-all border ${sessionForm.selectedStudents.includes(s.name) ? 'bg-[#E55B69] text-white' : 'bg-white text-gray-500 border-red-50'}`}>
                        {s.name}
                      </button>
                    )) : (
                      <p className="text-gray-300 text-center py-4 text-xs font-black uppercase tracking-widest">No hay alumnos registrados</p>
                    )}
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-[#E55B69] text-white rounded-2xl font-manrope font-extrabold uppercase tracking-widest shadow-xl shadow-red-100">{editingSessionId ? 'GUARDAR CAMBIOS' : 'CREAR SESIÓN'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
