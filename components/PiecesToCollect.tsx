
import React, { useState, useMemo } from 'react';
import { CeramicPiece, CeramicPieceStatus, Student } from '../types';

interface PiecesToCollectProps {
  pieces: CeramicPiece[];
  students: Student[];
  onAddPiece: (piece: Omit<CeramicPiece, 'id'>) => void;
  onUpdatePiece: (id: string, updates: Partial<CeramicPiece>) => void;
  onDeletePiece: (id: string) => void;
}

const PieceCard: React.FC<{ 
  piece: CeramicPiece; 
  onEdit: (piece: CeramicPiece) => void; 
  onUpdateStatus: (id: string, nextStatus: CeramicPieceStatus) => void;
  getStatusAction: (status: CeramicPieceStatus) => { label: string; next: CeramicPieceStatus } | null;
  getStatusLabel: (status: CeramicPieceStatus) => string;
}> = ({ piece, onEdit, onUpdateStatus, getStatusAction, getStatusLabel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const action = getStatusAction(piece.status);
  
  const COMMENT_LIMIT = 80;
  const hasLongComment = (piece.extraCommentary?.length || 0) > COMMENT_LIMIT;
  const displayText = isExpanded 
    ? piece.extraCommentary 
    : piece.extraCommentary?.slice(0, COMMENT_LIMIT) + (hasLongComment ? '...' : '');

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-white hover:shadow-2xl transition-all relative flex flex-col group h-full">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-orange-400"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-900 translate-x-1 -translate-y-1"></div>
          </div>
          <div>
            <h3 className="font-manrope font-extrabold text-[#1e2330] text-[20px] md:text-[23px] leading-tight line-clamp-2 pr-12">
              {piece.owner}
            </h3>
            <p className="text-[12px] font-manrope font-extrabold text-gray-200 uppercase mt-1">#P-{piece.id.toUpperCase()}</p>
          </div>
        </div>
        <button 
          onClick={() => onEdit(piece)} 
          className="text-blue-300 hover:text-blue-500 font-manrope font-extrabold text-[14px] md:text-[16px] absolute top-8 md:top-10 right-8 md:right-10"
        >
          Editar
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <p className="text-[16px] md:text-[19px] font-manrope font-regular text-gray-500 mb-6 leading-relaxed">
          {piece.description}
        </p>
        
        {piece.glazeType && (
          <div className="mb-4">
            <p className="text-[10px] md:text-[12px] font-manrope font-extrabold text-[#E55B69] uppercase tracking-widest">
              ESMALTE: {piece.glazeType.toUpperCase()}
            </p>
          </div>
        )}

        {piece.deliveryDate && (
          <div className="mb-4">
            <p className="text-[10px] md:text-[12px] font-manrope font-extrabold text-green-500 uppercase tracking-widest">
              ENTREGA TENTATIVA: {new Date(piece.deliveryDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {piece.extraCommentary && (
          <div className="mb-6 p-4 bg-red-50/30 rounded-2xl border border-red-50/50">
            <p className="text-[10px] font-manrope font-extrabold text-gray-400 uppercase tracking-widest mb-2">Comentarios:</p>
            <p className="text-[14px] md:text-[16px] font-manrope font-light text-gray-600 leading-snug">
              {displayText}
            </p>
            {hasLongComment && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-[11px] font-manrope font-extrabold text-[#E55B69] uppercase tracking-tighter hover:underline"
              >
                {isExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        )}

        <div className="mb-8">
          <span className="inline-block px-5 py-2 bg-red-50 text-[#E55B69] rounded-full text-[11px] md:text-[13px] font-manrope font-extrabold uppercase tracking-widest">
            {getStatusLabel(piece.status)}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button 
          disabled={!action}
          onClick={() => action && onUpdateStatus(piece.id, action.next)} 
          className={`w-full py-5 rounded-2xl text-[14px] md:text-[18px] font-manrope font-extrabold uppercase tracking-widest shadow-xl transition-all ${
            !action 
            ? 'bg-gray-100 text-gray-300 shadow-none cursor-not-allowed' 
            : 'bg-[#E55B69] text-white hover:brightness-110 active:scale-95'
          }`}
        >
          {action ? action.label : 'ENTREGADO'}
        </button>
      </div>
    </div>
  );
};

const PiecesToCollect: React.FC<PiecesToCollectProps> = ({ pieces, students, onAddPiece, onUpdatePiece, onDeletePiece }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPiece, setEditingPiece] = useState<CeramicPiece | null>(null);
  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [form, setForm] = useState({ 
    alumnoId: '',
    owner: '', 
    description: '', 
    status: 'bizcochada' as CeramicPieceStatus, 
    glazeType: '', 
    deliveryDate: '', 
    notes: '',
    extraCommentary: '',
    fechaCreacion: new Date().toISOString()
  });

  const uniqueOwners = useMemo(() => {
    const owners = pieces.map(p => p.owner);
    return Array.from(new Set(owners)).sort();
  }, [pieces]);

  const filteredPieces = useMemo(() => {
    return pieces.filter(p => {
      const matchOwner = selectedOwnerFilter === 'all' || p.owner === selectedOwnerFilter;
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
      return matchOwner && matchStatus;
    });
  }, [pieces, selectedOwnerFilter, selectedStatus]);

  const handleEditClick = (piece: CeramicPiece) => {
    setEditingPiece(piece);
    setForm({ 
      alumnoId: piece.alumnoId || '',
      owner: piece.owner, 
      description: piece.description, 
      status: piece.status, 
      glazeType: piece.glazeType || '', 
      deliveryDate: piece.deliveryDate || '', 
      notes: piece.notes || '',
      extraCommentary: piece.extraCommentary || '',
      fechaCreacion: piece.fechaCreacion
    });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingPiece(null);
    setForm({ 
      alumnoId: '',
      owner: '', 
      description: '', 
      status: 'creada', 
      glazeType: '', 
      deliveryDate: '', 
      notes: '', 
      extraCommentary: '',
      fechaCreacion: new Date().toISOString()
    });
    setShowModal(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editingPiece?.id && window.confirm('¿Eliminar esta pieza permanentemente?')) {
      onDeletePiece(editingPiece.id);
      setShowModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar que se haya seleccionado un propietario
    if (!form.owner) {
      alert("Por favor, selecciona un propietario para la pieza.");
      return;
    }
    
    if (editingPiece?.id) onUpdatePiece(editingPiece.id, form);
    else onAddPiece(form);
    setShowModal(false);
  };

  const handleOwnerChange = (val: string) => {
    // val es el ID del alumno
    const student = students.find(s => s.id === val);
    if (student) {
      setForm({ ...form, alumnoId: student.id, owner: student.name });
    } else {
      setForm({ ...form, alumnoId: '', owner: '' });
    }
  };

  const getStatusAction = (status: CeramicPieceStatus) => {
    switch (status) {
      case 'bizcochada': return { label: 'A ESMALTAR', next: 'esmaltada' as const };
      case 'esmaltada': return { label: 'A HORNO FINAL', next: 'cocida final' as const };
      case 'cocida final': return { label: 'ENTREGAR', next: 'concluida' as const };
      default: return null;
    }
  };

  const getStatusLabel = (status: CeramicPieceStatus) => {
    switch (status) {
      case 'creada': return 'CREADA';
      case 'en secado': return 'EN SECADO';
      case 'bizcochada': return 'BIZCOCHADA';
      case 'esmaltada': return 'ESMALTADA';
      case 'cocida final': return 'COCIDA FINAL';
      case 'concluida': return 'CONCLUIDA';
      default: return status;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-[32px] md:text-[45px] font-manrope font-extrabold text-[#1e2330] uppercase tracking-tight leading-none">
            CONTROL DE <span className="text-[#E55B69]">PIEZAS</span>
          </h2>
          <p className="text-[12px] md:text-[14px] font-manrope font-extrabold text-gray-300 uppercase tracking-[0.2em] mt-2">
            SEGUIMIENTO DE PRODUCCIONES
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <select 
              value={selectedOwnerFilter} 
              onChange={(e) => setSelectedOwnerFilter(e.target.value)} 
              className="w-full px-6 py-4 bg-white border border-red-50 rounded-2xl text-[14px] font-manrope font-regular text-gray-500 appearance-none cursor-pointer outline-none shadow-sm"
            >
              <option value="all">Todos los alumnos</option>
              {uniqueOwners.map(owner => <option key={owner} value={owner}>{owner}</option>)}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <button 
            onClick={handleCreateClick} 
            className="w-full md:w-auto px-10 py-4 bg-[#E55B69] text-white rounded-2xl text-[14px] font-manrope font-extrabold shadow-lg shadow-red-100 uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            NUEVA PIEZA
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar pr-2 pb-24">
        {filteredPieces.map(piece => (
          <PieceCard 
            key={piece.id} 
            piece={piece} 
            onEdit={handleEditClick} 
            onUpdateStatus={(id, next) => onUpdatePiece(id, { status: next })}
            getStatusAction={getStatusAction}
            getStatusLabel={getStatusLabel}
          />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white w-full max-w-xl max-h-[90dvh] rounded-[3.5rem] shadow-2xl relative animate-fade-in flex flex-col">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-10 right-10 text-gray-300 hover:text-gray-500 transition-colors z-20"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-10 md:p-14 overflow-y-auto custom-scrollbar">
              <h3 className="text-[36px] md:text-[45px] font-manrope font-extrabold text-[#1e2330] mb-2 uppercase tracking-tight leading-none">
                {editingPiece ? 'EDITAR PIEZA' : 'NUEVA PIEZA'}
              </h3>
              <p className="text-gray-400 text-[16px] md:text-[19px] mb-12 font-manrope font-regular leading-tight">
                Actualiza los detalles de la pieza de cerámica.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[11px] md:text-[13px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">PROPIETARIO (ALUMNO)</label>
                  <div className="relative">
                    <select 
                      required
                      value={form.alumnoId}
                      onChange={(e) => handleOwnerChange(e.target.value)}
                      className="w-full px-8 py-5 border border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] md:text-[20px] focus:outline-none focus:border-[#E55B69] text-gray-800 appearance-none bg-white"
                    >
                      <option value="">Selecciona un alumno...</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] md:text-[13px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">DESCRIPCIÓN</label>
                  <input 
                    required 
                    value={form.description} 
                    onChange={(e) => setForm({...form, description: e.target.value})} 
                    className="w-full px-8 py-5 border border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] md:text-[20px] focus:outline-none focus:border-[#E55B69] text-gray-800 placeholder:text-gray-200" 
                    placeholder="Bowls con rayas azules por dentro y por fuera" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] md:text-[13px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">TIPO DE ESMALTE</label>
                    <input 
                      value={form.glazeType} 
                      onChange={(e) => setForm({...form, glazeType: e.target.value})} 
                      className="w-full px-8 py-5 border border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] focus:outline-none focus:border-[#E55B69] text-gray-800 placeholder:text-gray-200" 
                      placeholder="Azul Cobalto" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] md:text-[13px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">TENTATIVA ENTREGA</label>
                    <input 
                      type="date"
                      value={form.deliveryDate} 
                      onChange={(e) => setForm({...form, deliveryDate: e.target.value})} 
                      className="w-full px-8 py-5 border border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] focus:outline-none focus:border-[#E55B69] text-gray-800" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] md:text-[13px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">ESTADO</label>
                  <div className="relative">
                    <select 
                      value={form.status} 
                      onChange={(e) => setForm({...form, status: e.target.value as CeramicPieceStatus})} 
                      className="w-full px-8 py-5 border border-red-50 rounded-2xl font-manrope font-extrabold text-[18px] md:text-[20px] focus:outline-none focus:border-[#E55B69] text-gray-800 appearance-none bg-white"
                    >
                      <option value="creada">Creada</option>
                      <option value="en secado">En Secado</option>
                      <option value="bizcochada">Bizcochada</option>
                      <option value="esmaltada">Esmaltada</option>
                      <option value="cocida final">Cocida Final</option>
                      <option value="concluida">Concluida</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] md:text-[13px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-3">OBSERVACIONES ADICIONALES</label>
                  <textarea 
                    value={form.extraCommentary} 
                    onChange={(e) => setForm({...form, extraCommentary: e.target.value})} 
                    className="w-full px-8 py-5 border border-red-50 rounded-[1.5rem] font-manrope font-extrabold text-[18px] md:text-[20px] focus:outline-none focus:border-[#E55B69] text-gray-800 placeholder:text-gray-200 min-h-[120px] resize-none" 
                    placeholder="Escribe comentarios extra aquí..." 
                  />
                </div>

                <div className="pt-4 flex flex-col items-center gap-6">
                  <button 
                    type="submit" 
                    className="w-full py-6 md:py-8 bg-[#E55B69] text-white rounded-[2rem] font-manrope font-extrabold shadow-xl uppercase tracking-widest text-[18px] md:text-[22px] hover:brightness-105 active:scale-[0.98] transition-all"
                  >
                    GUARDAR PIEZA
                  </button>
                  
                  {editingPiece && (
                    <button 
                      type="button" 
                      onClick={handleDelete} 
                      className="flex items-center gap-3 text-[#E55B69] font-manrope font-extrabold text-[14px] md:text-[16px] uppercase tracking-widest hover:opacity-70 transition-opacity"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      ELIMINAR PIEZA
                    </button>
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

export default PiecesToCollect;
