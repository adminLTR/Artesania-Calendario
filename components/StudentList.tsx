
import React, { useState, useMemo } from 'react';
import { Student, AssignedClass, CeramicPiece } from '../types';
import StudentHistory from './StudentHistory';

interface StudentListProps {
  students: Student[];
  pieces: CeramicPiece[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onRenew: (id: string, numClasses: number) => void;
  onUpdate: (id: string, updates: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
}

type TabType = 'all' | 'active' | 'pending';

const StudentList: React.FC<StudentListProps> = ({ students, pieces, onAddStudent, onRenew, onUpdate, onDeleteStudent }) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    notes: '', 
    classesRemaining: 4, 
    price: 100, 
    paymentStatus: 'paid' as 'paid' | 'pending', 
    classType: 'Modelado',
    expiryDate: '',
    assignedClasses: [] as AssignedClass[] 
  });

  const cardThemes = [
    { bg: 'bg-[#FDF2F2]', border: 'border-red-100', accent: 'text-[#E55B69]' },
    { bg: 'bg-[#F0F7FF]', border: 'border-blue-100', accent: 'text-blue-500' },
    { bg: 'bg-[#F2FAF5]', border: 'border-green-100', accent: 'text-green-500' },
    { bg: 'bg-[#FFF9F2]', border: 'border-orange-100', accent: 'text-orange-500' },
    { bg: 'bg-[#F5F3FF]', border: 'border-purple-100', accent: 'text-purple-500' },
  ];

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setForm({ 
      name: student.name, 
      phone: student.phone, 
      notes: student.notes || '', 
      classesRemaining: student.classesRemaining, 
      price: student.price || 100, 
      paymentStatus: student.status === 'needs_renewal' ? 'pending' : 'paid', 
      classType: student.classType || 'Modelado',
      expiryDate: student.expiryDate || '',
      assignedClasses: student.assignedClasses || [] 
    });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingStudent(null);
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    const defaultExpiry = today.toISOString().split('T')[0];
    setForm({ name: '', phone: '', notes: '', classesRemaining: 4, price: 100, paymentStatus: 'paid', classType: 'Modelado', expiryDate: defaultExpiry, assignedClasses: [] });
    setShowModal(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editingStudent?.id && window.confirm('¿Eliminar a este alumno y todos sus registros?')) {
      onDeleteStudent(editingStudent.id);
      setShowModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      name: form.name, phone: form.phone, notes: form.notes, classesRemaining: form.classesRemaining, price: form.price, 
      status: (form.paymentStatus === 'pending' ? 'needs_renewal' : 'regular') as 'needs_renewal' | 'regular', 
      classType: form.classType, expiryDate: form.expiryDate, assignedClasses: form.assignedClasses 
    };
    if (editingStudent?.id) onUpdate(editingStudent.id, data);
    else onAddStudent(data);
    setShowModal(false);
  };

  const filteredStudents = useMemo(() => {
    if (activeTab === 'pending') return students.filter(s => s.status === 'needs_renewal');
    if (activeTab === 'active') return students.filter(s => s.status === 'regular');
    return students;
  }, [students, activeTab]);

  const pendingCount = students.filter(s => s.status === 'needs_renewal').length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-5 px-4">
        <div>
          <h2 className="text-[25px] md:text-[38px] font-manrope font-extrabold text-gray-800 uppercase tracking-tight leading-none">Gestión de <span className="text-[#E55B69]">Alumnos</span></h2>
          <p className="text-[11px] md:text-[13px] font-manrope font-extrabold text-gray-400 uppercase tracking-widest mt-2 md:mt-3">Control de asistencia y pagos</p>
        </div>
        <button onClick={handleCreateClick} className="w-full md:w-auto px-6 md:px-8 py-4 md:py-5 bg-[#E55B69] text-white rounded-2xl text-[12px] md:text-[13px] font-manrope font-extrabold shadow-xl uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 transition-all shrink-0">
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Nuevo Alumno
        </button>
      </div>

      <div className="bg-white p-1.5 rounded-full border border-red-50 shadow-sm mb-8 self-start ml-4 flex items-center overflow-x-auto no-scrollbar max-w-[calc(100%-2rem)]">
        <button onClick={() => setActiveTab('all')} className={`whitespace-nowrap px-6 md:px-8 py-3 rounded-full text-[12px] md:text-[14px] font-manrope font-extrabold transition-all duration-300 ${activeTab === 'all' ? 'bg-[#E55B69] text-white shadow-md' : 'text-[#94a3b8]'}`}>TODOS</button>
        <button onClick={() => setActiveTab('active')} className={`whitespace-nowrap px-6 md:px-8 py-3 rounded-full text-[12px] md:text-[14px] font-manrope font-extrabold transition-all duration-300 ${activeTab === 'active' ? 'bg-[#E55B69] text-white shadow-md' : 'text-[#94a3b8]'}`}>ACTIVOS</button>
        <button onClick={() => setActiveTab('pending')} className={`whitespace-nowrap px-6 md:px-8 py-3 rounded-full text-[12px] md:text-[14px] font-manrope font-extrabold transition-all duration-300 flex items-center gap-2 ${activeTab === 'pending' ? 'bg-[#E55B69] text-white shadow-md' : 'text-[#94a3b8]'}`}>PENDIENTES {pendingCount > 0 && <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] md:text-[12px] font-manrope font-extrabold ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-red-50 text-[#E55B69]'}`}>{pendingCount}</span>}</button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-20">
        <div className={`grid gap-6 md:gap-8 ${activeTab === 'all' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
          {filteredStudents.map((s, index) => {
            const theme = cardThemes[index % cardThemes.length];
            return activeTab === 'all' ? (
              <div key={s.id} onClick={() => handleEditClick(s)} className="p-6 bg-white rounded-[2rem] border border-red-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-xl transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-manrope font-extrabold text-[18px] ${s.classType === 'Torno' ? 'bg-blue-400' : 'bg-[#E55B69]'}`}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-manrope font-extrabold text-gray-800 text-[20px] leading-tight">{s.name}</h4>
                    <p className="text-[12px] font-manrope font-extrabold text-gray-400 uppercase tracking-widest">{s.phone}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                   <div className="flex flex-col">
                    <span className="text-[10px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-1">Bono</span>
                    <span className={`px-4 py-1 rounded-full text-[11px] font-manrope font-extrabold uppercase ${s.classType === 'Torno' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-[#E55B69]'}`}>{s.classType || 'Modelado'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-1">Clases</span>
                    <span className="font-manrope font-black text-gray-800">{s.classesRemaining}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-1">Estado</span>
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${s.status === 'needs_renewal' ? 'bg-red-50 text-[#E55B69]' : 'bg-green-50 text-green-600'}`}>
                      {s.status === 'needs_renewal' ? 'PENDIENTE' : 'AL DÍA'}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            ) : (
              <div key={s.id} className={`p-6 md:p-8 border rounded-[2rem] md:rounded-[3rem] ${theme.bg} relative group flex flex-col justify-between transition-all hover:shadow-2xl hover:bg-white ${s.status === 'needs_renewal' ? `border-dashed border-2 ${theme.border}` : 'border-white shadow-sm'}`}>
                <button onClick={() => handleEditClick(s)} className={`absolute top-6 md:top-8 right-6 md:right-8 text-gray-300 hover:${theme.accent} transition-opacity`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <div className="mb-6">
                  <div className="flex items-center gap-3 md:gap-4 mb-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${s.status === 'needs_renewal' ? 'bg-[#E55B69] animate-pulse' : 'bg-green-400'}`}></div>
                    <h4 className="font-manrope font-extrabold text-gray-800 text-[18px] md:text-[23px] leading-tight truncate">{s.name}</h4>
                  </div>
                  <p className="text-[12px] md:text-[13px] font-manrope font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2 md:gap-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    {s.phone}
                  </p>
                </div>
                <div className={`flex justify-between items-end border-t ${theme.border} pt-6`}>
                  <div>
                    <p className="text-[10px] md:text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-1.5">Cuota</p>
                    <span className={`text-[20px] md:text-[25px] font-manrope font-extrabold ${s.status === 'needs_renewal' ? 'text-[#E55B69]' : 'text-gray-800'}`}>{s.price}€</span>
                  </div>
                  <div className="flex flex-col items-end">
                    {s.status === 'needs_renewal' ? (
                      <button onClick={(e) => {e.stopPropagation(); onUpdate(s.id, { status: 'regular' });}} className="px-4 md:px-5 py-2.5 md:py-3 bg-[#E55B69] text-white text-[11px] md:text-[12px] font-manrope font-extrabold rounded-xl uppercase tracking-widest shadow-lg shadow-red-100">Pagar</button>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-[20px] md:text-[25px] font-manrope font-extrabold text-gray-800">{s.classesRemaining}</span>
                        <p className="text-[10px] md:text-[11px] font-manrope font-extrabold uppercase text-gray-400">CLASES</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative animate-fade-in flex flex-col max-h-[95dvh]">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-gray-300 hover:text-gray-600 transition-colors z-20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-8 md:p-14 overflow-y-auto custom-scrollbar">
              <h3 className="text-[32px] font-manrope font-extrabold text-[#1e2330] mb-2 uppercase tracking-tight leading-none">{editingStudent ? 'EDITAR ALUMNO' : 'NUEVO ALUMNO'}</h3>
              <p className="text-gray-400 text-[16px] mb-10 font-manrope font-medium">Registra o actualiza los detalles del alumno y su historial.</p>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Fila 1: Nombre, Tipo de Clase, Cuota */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-6">
                    <label className="block text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">Nombre Completo</label>
                    <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-6 py-5 border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] outline-none focus:border-[#E55B69] placeholder:text-gray-200" placeholder="Ej: Laura García" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">Tipo de Clase</label>
                    <div className="relative">
                      <select value={form.classType} onChange={(e) => setForm({...form, classType: e.target.value})} className="w-full px-6 py-5 bg-white border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] outline-none appearance-none focus:border-[#E55B69]">
                        <option value="Modelado">Modelado</option>
                        <option value="Torno">Torno</option>
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">Cuota (€)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({...form, price: parseInt(e.target.value)})} className="w-full px-6 py-5 border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] outline-none focus:border-[#E55B69]" />
                  </div>
                </div>

                {/* Fila 2: Teléfono y Clases del Bono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">Teléfono Móvil</label>
                    <input required value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full px-6 py-5 border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] outline-none focus:border-[#E55B69] placeholder:text-gray-200" placeholder="+34 600 000 000" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">Clases del Bono</label>
                    <div className="relative">
                      <input type="number" value={form.classesRemaining} onChange={(e) => setForm({...form, classesRemaining: parseInt(e.target.value)})} className="w-full px-6 py-5 border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] outline-none focus:border-[#E55B69]" />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                         <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Sesiones</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fila 3: Estado de Facturación */}
                <div>
                  <label className="block text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-4">Estado de Facturación</label>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setForm({...form, paymentStatus: 'paid'})}
                      className={`flex-1 py-5 rounded-2xl font-manrope font-extrabold text-[14px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${form.paymentStatus === 'paid' ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-100' : 'bg-white border-gray-100 text-gray-300 hover:border-green-200'}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${form.paymentStatus === 'paid' ? 'bg-white' : 'bg-green-400'}`}></div>
                      AL DÍA
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setForm({...form, paymentStatus: 'pending'})}
                      className={`flex-1 py-5 rounded-2xl font-manrope font-extrabold text-[14px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 ${form.paymentStatus === 'pending' ? 'bg-[#E55B69] border-[#E55B69] text-white shadow-lg shadow-red-100' : 'bg-white border-gray-100 text-gray-300 hover:border-red-200'}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${form.paymentStatus === 'pending' ? 'bg-white' : 'bg-red-400'}`}></div>
                      PENDIENTE
                    </button>
                  </div>
                </div>

                {/* Nuevo: Campo de Comentarios / Observaciones */}
                <div>
                  <label className="block text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">Comentarios / Observaciones</label>
                  <textarea 
                    value={form.notes} 
                    onChange={(e) => setForm({...form, notes: e.target.value})} 
                    className="w-full px-8 py-5 border-2 border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] outline-none focus:border-[#E55B69] placeholder:text-gray-200 min-h-[120px] resize-none" 
                    placeholder="Ej: Prefiere clases de tarde, alérgico a ciertos pigmentos, etc..." 
                  />
                </div>

                {editingStudent && (
                  <StudentHistory 
                    studentId={editingStudent.id} 
                    pieces={pieces} 
                    attendanceHistory={editingStudent.attendanceHistory}
                  />
                )}

                <div className="pt-8 flex flex-col items-center">
                  <button type="submit" className="w-full py-6 bg-[#E55B69] text-white rounded-[2rem] font-manrope font-extrabold shadow-xl shadow-red-100 uppercase tracking-widest text-[16px] hover:brightness-110 active:scale-95 transition-all">
                    GUARDAR CAMBIOS
                  </button>
                  {editingStudent && (
                    <button type="button" onClick={handleDelete} className="w-full mt-6 text-[#E55B69] font-manrope font-extrabold text-[13px] uppercase tracking-[0.3em] hover:opacity-70">Eliminar Alumno</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
