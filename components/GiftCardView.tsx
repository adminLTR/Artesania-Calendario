
import React, { useState } from 'react';
import { GiftCard, Client } from '../types';

interface GiftCardViewProps {
  giftCards: GiftCard[];
  clients: Client[];
  onAddGiftCard: (card: Omit<GiftCard, 'id' | 'createdAt'>) => void;
  onUpdateGiftCard: (id: string, updates: Partial<GiftCard>) => void;
  onDeleteGiftCard: (id: string) => void;
  onAddClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
}

const GiftCardItem: React.FC<{ 
  card: GiftCard; 
  theme: { bg: string; border: string; text: string; accent: string }; 
  onEdit: (card: GiftCard) => void;
  formatDateOnly: (isoString: string) => string;
}> = ({ card, theme, onEdit, formatDateOnly }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const COMMENT_LIMIT = 85;
  const hasLongComment = (card.extraCommentary?.length || 0) > COMMENT_LIMIT;
  const displayText = isExpanded 
    ? card.extraCommentary 
    : card.extraCommentary?.slice(0, COMMENT_LIMIT) + (hasLongComment ? '...' : '');

  return (
    <div 
      onClick={() => onEdit(card)} 
      className={`p-8 md:p-10 rounded-[3rem] ${theme.bg} flex flex-col justify-between relative overflow-hidden group min-h-[420px] cursor-pointer hover:shadow-2xl hover:bg-white transition-all border-2 border-transparent hover:border-white shadow-sm`}
    >
       <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
             <span className={`px-5 py-1.5 ${card.type === 'torno' ? 'bg-blue-500' : 'bg-[#E55B69]'} text-white rounded-full text-[11px] font-manrope font-extrabold tracking-widest uppercase shadow-sm`}>
                {card.type.toUpperCase()}
             </span>
             <span className="text-[14px] md:text-[16px] font-manrope font-extrabold text-gray-200 uppercase tracking-widest">#{card.id}</span>
          </div>
          
          <div className="space-y-6 mb-8">
             <div>
                <p className={`text-[10px] md:text-[11px] ${theme.text} font-manrope font-extrabold uppercase tracking-[0.2em] mb-1.5`}>COMPRADOR:</p>
                <p className="font-manrope font-extrabold text-[22px] md:text-[26px] text-gray-800 truncate leading-tight">{card.buyer?.name || 'N/A'}</p>
             </div>
             <div>
                <p className={`text-[10px] md:text-[11px] ${theme.accent} font-manrope font-extrabold uppercase tracking-[0.2em] mb-1.5`}>PARA:</p>
                <p className="font-manrope font-light text-[18px] md:text-[22px] text-gray-500 truncate leading-tight">{card.recipient?.name || 'N/A'}</p>
             </div>
          </div>

          {card.extraCommentary && (
            <div className="mb-6 p-5 bg-white/50 rounded-2xl border border-white/60">
              <p className={`text-[9px] font-manrope font-extrabold ${theme.text} uppercase tracking-widest mb-2`}>COMENTARIOS:</p>
              <p className="text-[13px] md:text-[14px] font-manrope font-light text-gray-500 leading-snug">
                {displayText}
              </p>
              {hasLongComment && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className="mt-2 text-[10px] font-manrope font-extrabold text-[#E55B69] uppercase tracking-tighter hover:underline block"
                >
                  {isExpanded ? 'VER MENOS' : 'VER MÁS'}
                </button>
              )}
            </div>
          )}
       </div>

       <div className={`flex justify-between items-end border-t border-white/40 pt-8 relative z-10 mt-auto`}>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-[34px] md:text-[40px] font-manrope font-extrabold text-gray-800 leading-none">{card.numClasses}</span>
              <span className="text-[11px] md:text-[12px] font-manrope font-extrabold text-gray-400 uppercase tracking-tight">CLASES</span>
            </div>
            <p className="text-[9px] md:text-[10px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mt-2">
              EMITIDO: <span className="text-gray-600">{formatDateOnly(card.createdAt)}</span>
            </p>
          </div>

          {card.scheduledDate ? (
            <div className="text-right">
               <p className="text-[10px] md:text-[11px] text-green-500 font-manrope font-extrabold uppercase tracking-widest mb-1">CITA:</p>
               <p className="text-[18px] md:text-[22px] font-manrope font-extrabold text-gray-800">{new Date(card.scheduledDate).toLocaleDateString()}</p>
            </div>
          ) : (
            <div className="px-5 py-2.5 bg-white text-[#E55B69] rounded-xl text-[11px] font-manrope font-extrabold uppercase tracking-widest border border-red-50 shadow-sm hover:bg-red-50 transition-colors">
              ASIGNAR
            </div>
          )}
       </div>
    </div>
  );
};

const GiftCardView: React.FC<GiftCardViewProps> = ({ giftCards, clients, onAddGiftCard, onUpdateGiftCard, onDeleteGiftCard, onAddClient }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<GiftCard | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState<'buyer' | 'recipient' | null>(null);
  const [newClientName, setNewClientName] = useState('');

  const initialFormState = { buyerId: '', recipientId: '', numClasses: 4, type: 'modelado' as GiftCard['type'], scheduledDate: '', extraCommentary: '' };
  const [form, setForm] = useState(initialFormState);

  const cardThemes = [
    { bg: 'bg-[#FDF2F2]', border: 'border-red-50', text: 'text-[#E55B69]', accent: 'text-red-400' },
    { bg: 'bg-[#F0F7FF]', border: 'border-blue-50', text: 'text-blue-500', accent: 'text-blue-400' },
    { bg: 'bg-[#F2FAF5]', border: 'border-green-50', text: 'text-green-500', accent: 'text-green-400' },
    { bg: 'bg-[#FFF9F2]', border: 'border-orange-50', text: 'text-orange-500', accent: 'text-orange-400' },
    { bg: 'bg-[#F5F3FF]', border: 'border-purple-50', text: 'text-purple-500', accent: 'text-purple-400' },
  ];

  const handleEditClick = (card: GiftCard) => {
    setEditingCard(card);
    setForm({ 
      buyerId: card.buyerId, 
      recipientId: card.recipientId, 
      numClasses: card.numClasses, 
      type: card.type, 
      scheduledDate: card.scheduledDate ? card.scheduledDate.split('T')[0] : '',
      extraCommentary: card.extraCommentary || ''
    });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingCard(null);
    setForm(initialFormState);
    setShowModal(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editingCard?.id && window.confirm('¿Estás seguro de que deseas eliminar esta tarjeta regalo?')) {
      onDeleteGiftCard(editingCard.id);
      setShowModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = { ...form, scheduledDate: form.scheduledDate ? `${form.scheduledDate}T10:00:00` : undefined };
    if (editingCard?.id) onUpdateGiftCard(editingCard.id, cardData);
    else onAddGiftCard(cardData);
    setShowModal(false);
  };

  const handleQuickAddClient = async (type: 'buyer' | 'recipient') => {
    if (!newClientName.trim()) return;
    try {
      const newClient = await onAddClient({ name: newClientName.trim() });
      if (type === 'buyer') {
        setForm({ ...form, buyerId: newClient.id });
      } else {
        setForm({ ...form, recipientId: newClient.id });
      }
      setNewClientName('');
      setShowNewClientForm(null);
    } catch (error) {
      console.error('Error al crear cliente:', error);
      alert('Error al crear el cliente');
    }
  };

  const formatDateOnly = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden px-4 md:px-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-[36px] md:text-[48px] font-manrope font-extrabold text-gray-800 tracking-tight uppercase leading-none">
            TARJETAS DE <span className="text-[#E55B69]">REGALO</span>
          </h2>
          <p className="text-[13px] md:text-[15px] text-gray-400 font-manrope font-extrabold mt-3 uppercase tracking-[0.25em]">
            GESTIÓN DE BONOS ESPECIALES
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
          <div className="text-center md:text-right">
            <p className="text-[18px] md:text-[22px] font-manrope font-extrabold text-gray-800 leading-none">¿Nuevo regalo?</p>
            <p className="text-[12px] md:text-[14px] text-gray-400 font-manrope font-regular">Crea un bono personalizado ahora</p>
          </div>
          <button 
            onClick={handleCreateClick} 
            className="w-full md:w-auto px-10 py-4.5 bg-[#E55B69] text-white rounded-[1.5rem] text-[13px] font-manrope font-extrabold hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-red-100 uppercase tracking-widest"
          >
            GENERAR TARJETA
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
          {giftCards.map((card, index) => (
            <GiftCardItem 
              key={card.id} 
              card={card} 
              theme={cardThemes[index % cardThemes.length]} 
              onEdit={handleEditClick}
              formatDateOnly={formatDateOnly}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative animate-fade-in my-8">
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-gray-200 hover:text-gray-400 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-[28px] md:text-[32px] font-manrope font-extrabold text-[#1e2330] mb-2 tracking-tight uppercase leading-none">
              {editingCard ? 'EDITAR TARJETA' : 'GENERAR TARJETA'}
            </h3>
            <p className="text-gray-400 text-[14px] md:text-[16px] mb-8 font-manrope font-regular leading-tight">Define los datos del bono de regalo y asígnale una fecha si ya la tiene.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Comprador */}
              <div>
                <label className="block text-[11px] md:text-[12px] font-manrope font-extrabold text-[#E55B69] uppercase tracking-widest mb-2">COMPRADOR</label>
                <select 
                  required 
                  value={form.buyerId} 
                  onChange={(e) => setForm({...form, buyerId: e.target.value})} 
                  className="w-full px-6 py-4 bg-white border-2 border-red-50 rounded-[1.2rem] focus:outline-none focus:border-[#E55B69] text-[16px] md:text-[18px] font-manrope font-extrabold appearance-none"
                >
                  <option value="">Seleccionar comprador...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setShowNewClientForm(showNewClientForm === 'buyer' ? null : 'buyer')}
                  className="mt-2 text-[10px] font-manrope font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wide"
                >
                  {showNewClientForm === 'buyer' ? 'Cancelar' : '+ Agregar nuevo comprador'}
                </button>
                {showNewClientForm === 'buyer' && (
                  <div className="mt-3 flex gap-2">
                    <input 
                      type="text" 
                      value={newClientName} 
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Nombre del comprador"
                      className="flex-1 px-4 py-3 border-2 border-blue-100 rounded-xl text-[14px] font-manrope focus:outline-none focus:border-blue-400"
                    />
                    <button 
                      type="button"
                      onClick={() => handleQuickAddClient('buyer')}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl text-[12px] font-manrope font-bold hover:bg-blue-600"
                    >
                      Crear
                    </button>
                  </div>
                )}
              </div>

              {/* Destinatario */}
              <div>
                <label className="block text-[11px] md:text-[12px] font-manrope font-extrabold text-[#E55B69] uppercase tracking-widest mb-2">DESTINATARIO</label>
                <select 
                  required 
                  value={form.recipientId} 
                  onChange={(e) => setForm({...form, recipientId: e.target.value})} 
                  className="w-full px-6 py-4 bg-white border-2 border-red-50 rounded-[1.2rem] focus:outline-none focus:border-[#E55B69] text-[16px] md:text-[18px] font-manrope font-extrabold appearance-none"
                >
                  <option value="">Seleccionar destinatario...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <button 
                  type="button"
                  onClick={() => setShowNewClientForm(showNewClientForm === 'recipient' ? null : 'recipient')}
                  className="mt-2 text-[10px] font-manrope font-bold text-blue-500 hover:text-blue-600 uppercase tracking-wide"
                >
                  {showNewClientForm === 'recipient' ? 'Cancelar' : '+ Agregar nuevo destinatario'}
                </button>
                {showNewClientForm === 'recipient' && (
                  <div className="mt-3 flex gap-2">
                    <input 
                      type="text" 
                      value={newClientName} 
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Nombre del destinatario"
                      className="flex-1 px-4 py-3 border-2 border-blue-100 rounded-xl text-[14px] font-manrope focus:outline-none focus:border-blue-400"
                    />
                    <button 
                      type="button"
                      onClick={() => handleQuickAddClient('recipient')}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl text-[12px] font-manrope font-bold hover:bg-blue-600"
                    >
                      Crear
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] md:text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-2">Nº CLASES</label>
                  <input type="number" value={form.numClasses} onChange={(e) => setForm({...form, numClasses: parseInt(e.target.value)})} className="w-full px-4 py-4 border-2 border-red-50 rounded-[1.2rem] font-manrope font-extrabold text-[16px] focus:outline-none focus:border-[#E55B69]" />
                </div>
                <div>
                  <label className="block text-[10px] md:text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-2">TIPO</label>
                  <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value as GiftCard['type']})} className="w-full px-4 py-4 border-2 border-red-50 rounded-[1.2rem] font-manrope font-extrabold text-[16px] focus:outline-none focus:border-[#E55B69] appearance-none bg-white">
                    <option value="modelado">Modelado</option>
                    <option value="torno">Torno</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-[11px] font-manrope font-extrabold text-[#E55B69] uppercase tracking-widest mb-2">FECHA DE CITA (OPCIONAL)</label>
                <input type="date" value={form.scheduledDate} onChange={(e) => setForm({...form, scheduledDate: e.target.value})} className="w-full px-6 py-4 bg-white border-2 border-red-50 rounded-[1.2rem] focus:outline-none focus:border-[#E55B69] text-[16px] font-manrope font-extrabold" />
              </div>

              <div>
                <label className="block text-[10px] md:text-[11px] font-manrope font-extrabold text-gray-300 uppercase tracking-widest mb-2">OBSERVACIONES ADICIONALES</label>
                <textarea 
                  value={form.extraCommentary} 
                  onChange={(e) => setForm({...form, extraCommentary: e.target.value})} 
                  className="w-full px-6 py-4 border-2 border-red-50 rounded-[1.2rem] font-manrope font-extrabold text-[16px] focus:outline-none focus:border-[#E55B69] text-gray-800 placeholder:text-gray-200 min-h-[100px] resize-none" 
                  placeholder="Ej: Es para un regalo especial de aniversario..." 
                />
              </div>

              <div className="pt-4 space-y-4">
                <button type="submit" className="w-full py-5 bg-[#E55B69] text-white rounded-[1.5rem] font-manrope font-extrabold shadow-xl uppercase tracking-widest text-[16px] md:text-[18px] hover:scale-[1.02] active:scale-95 transition-all">
                  {editingCard ? 'GUARDAR CAMBIOS' : 'CONFIRMAR Y GENERAR'}
                </button>
                {editingCard && (
                  <button type="button" onClick={handleDelete} className="w-full flex items-center justify-center gap-3 text-[#E55B69] font-manrope font-extrabold text-[13px] md:text-[14px] uppercase tracking-widest hover:opacity-70 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar Tarjeta
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardView;
