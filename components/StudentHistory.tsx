
import React, { useMemo, useState } from 'react';
import { CeramicPiece, CeramicPieceStatus, Student } from '../types';

interface StudentHistoryProps {
  studentId: string;
  pieces: CeramicPiece[];
  attendanceHistory?: Student['attendanceHistory'];
  includeCurrentMonth?: boolean;
}

const StudentHistory: React.FC<StudentHistoryProps> = ({ studentId, pieces, attendanceHistory = [], includeCurrentMonth = true }) => {
  // Se cambia el estado inicial a 'attendance' por defecto
  const [activeHistoryTab, setActiveHistoryTab] = useState<'pieces' | 'attendance'>('attendance');
  const [filterMode, setFilterMode] = useState<'creadas' | 'concluidas'>('creadas');

  const monthsToDisplay = useMemo(() => {
    const today = new Date();
    const months = [];
    const count = includeCurrentMonth ? 4 : 3;
    
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: d.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase(),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return months;
  }, [includeCurrentMonth]);

  const filteredPieces = useMemo(() => {
    const studentPieces = pieces.filter(p => p.alumnoId === studentId);
    // Filtrar por estado: concluidas o creadas (cualquier otro estado)
    if (filterMode === 'concluidas') {
      return studentPieces.filter(p => p.status === 'concluida');
    } else {
      return studentPieces.filter(p => p.status !== 'concluida');
    }
  }, [pieces, studentId, filterMode]);

  const attendanceGroupedByMonth = useMemo(() => {
    const groups: Record<string, typeof attendanceHistory> = {};
    attendanceHistory.forEach(record => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(record);
    });
    return groups;
  }, [attendanceHistory]);

  const getStatusColor = (status: CeramicPieceStatus) => {
    switch (status) {
      case 'concluida': return 'bg-green-500';
      case 'creada': return 'bg-blue-400';
      case 'en secado': return 'bg-orange-300';
      case 'bizcochada': return 'bg-amber-600';
      case 'esmaltada': return 'bg-purple-400';
      case 'cocida final': return 'bg-indigo-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="mt-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-red-50 pb-6">
        <div className="flex gap-6">
          {/* ASISTENCIA PRIMERO Y DESTACADA */}
          <button 
            type="button"
            onClick={() => setActiveHistoryTab('attendance')}
            className={`text-[20px] md:text-[28px] font-manrope font-extrabold uppercase tracking-tight leading-none transition-colors ${activeHistoryTab === 'attendance' ? 'text-[#E55B69]' : 'text-gray-300'}`}
          >
            Asistencia
          </button>
          
          {/* PIEZAS EN SEGUNDO LUGAR Y COLOR AZUL */}
          <button 
            type="button"
            onClick={() => setActiveHistoryTab('pieces')}
            className={`text-[20px] md:text-[28px] font-manrope font-extrabold uppercase tracking-tight leading-none transition-colors ${activeHistoryTab === 'pieces' ? 'text-blue-500' : 'text-gray-300'}`}
          >
            Piezas
          </button>
        </div>

        {/* Filtro de piezas creadas/concluidas */}
        {activeHistoryTab === 'pieces' && (
          <div className="flex bg-white border border-blue-50 p-1 rounded-2xl shadow-sm">
            <button 
              type="button"
              onClick={() => setFilterMode('creadas')} 
              className={`px-6 py-2.5 rounded-xl text-[11px] font-manrope font-extrabold transition-all uppercase tracking-widest ${filterMode === 'creadas' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              EN PROCESO
            </button>
            <button 
              type="button"
              onClick={() => setFilterMode('concluidas')} 
              className={`px-6 py-2.5 rounded-xl text-[11px] font-manrope font-extrabold transition-all uppercase tracking-widest ${filterMode === 'concluidas' ? 'bg-green-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              CONCLUIDAS
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {activeHistoryTab === 'pieces' ? (
          // Mostrar piezas filtradas
          <div className="bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-[2rem] border border-blue-100 shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              {filteredPieces && filteredPieces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Ordenar por fecha de creación descendente (más recientes primero) */}
                  {[...filteredPieces].sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()).map(piece => (
                    <div key={piece.id} className="group bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                      {/* Header con icono y status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${getStatusColor(piece.status)} group-hover:scale-110 transition-transform`}>
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-manrope font-black uppercase tracking-wider ${getStatusColor(piece.status)} text-white shadow-sm`}>
                          {piece.status}
                        </span>
                      </div>

                      {/* Contenido */}
                      <div className="space-y-3">
                        <h4 className="font-manrope font-black text-gray-800 text-[16px] uppercase leading-tight line-clamp-2 min-h-[2.5rem]">
                          {piece.description || 'Sin descripción'}
                        </h4>
                        
                        {/* Detalles */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          {piece.glazeType && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                              </svg>
                              <p className="text-[11px] font-manrope font-bold text-blue-600 uppercase tracking-wide">{piece.glazeType}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-[11px] font-manrope font-semibold text-gray-500 uppercase tracking-wide">
                              {new Date(piece.fechaCreacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          
                          {piece.fechaConclusion && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-[11px] font-manrope font-semibold text-green-600 uppercase tracking-wide">
                                Finalizada: {new Date(piece.fechaConclusion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-400 text-[13px] font-manrope font-bold uppercase tracking-widest">
                    {filterMode === 'concluidas' ? 'No hay piezas concluidas' : 'No hay piezas en proceso'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Mostrar asistencias sin agrupar por mes
          <div className="bg-white rounded-[2rem] border border-red-50 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 bg-red-50/5">
              {attendanceHistory && attendanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {/* Ordenar por fecha descendente (más recientes primero) */}
                  {[...attendanceHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${record.status === 'present' ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}>
                          {record.status === 'present' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>}
                        </div>
                        <div>
                          <p className="font-manrope font-extrabold text-gray-800 text-[15px]">
                            {new Date(record.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] font-manrope font-extrabold text-gray-400 uppercase tracking-widest">{record.status === 'present' ? 'PRESENTÓ ASISTENCIA' : 'AUSENTE'}</p>
                        </div>
                      </div>
                      {record.status === 'present' && <span className="text-[12px] font-manrope font-black text-green-600">-1 CLASE</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-300 text-[12px] uppercase tracking-widest py-8">Sin registros de asistencia</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHistory;
