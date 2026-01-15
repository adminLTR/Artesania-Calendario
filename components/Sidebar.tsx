
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onLogout }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Resumen', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    )},
    { id: AppView.CALENDAR, label: 'Calendario', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )},
    { id: AppView.STUDENTS, label: 'Alumnos', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    )},
    { id: AppView.PIECES, label: 'Piezas', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )},
    { id: AppView.GIFTCARDS, label: 'Bonos Regalo', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
    )},
    { id: AppView.TEAM_TASKS, label: 'Tareas Equipo', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    )},
  ];

  return (
    <div className="w-64 xl:w-72 bg-white flex flex-col h-full rounded-[3rem] shadow-sm border border-transparent overflow-hidden animate-fade-in">
      <div className="p-10 flex flex-col h-full">
        {/* Profile Section */}
        <div className="flex items-center space-x-4 mb-14">
          <div className="w-14 h-14 bg-[#E55B69] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-100/30">A</div>
          <div className="overflow-hidden">
            <h1 className="text-xl font-bold text-[#1e2330] leading-tight truncate">Alexander</h1>
            <p className="text-[11px] text-[#94a3b8] uppercase font-bold tracking-[0.15em] mt-0.5">Gestor de Taller</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-4 flex-1 overflow-y-auto no-scrollbar py-2">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center space-x-4 p-3 rounded-2xl transition-all duration-200 group ${
                  isActive 
                  ? 'text-[#1e2330]' 
                  : 'text-[#94a3b8] hover:text-[#1e2330]'
                }`}
              >
                <div className={`shrink-0 transition-colors ${isActive ? 'text-[#1e2330]' : 'text-[#94a3b8] group-hover:text-[#1e2330]'}`}>
                  {item.icon}
                </div>
                <span className={`text-[17px] font-bold tracking-tight truncate ${isActive ? 'text-[#1e2330]' : 'text-[#94a3b8] group-hover:text-[#1e2330]'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions Section */}
        <div className="mt-6 pt-8 border-t border-gray-100 space-y-5 shrink-0">
          <button 
            onClick={() => setView(AppView.SETTINGS)}
            className={`w-full flex items-center space-x-4 px-3 py-2 transition-colors group ${currentView === AppView.SETTINGS ? 'text-[#E55B69]' : 'text-[#E55B69]'}`}
          >
             <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             <span className="text-[17px] font-bold">Ajustes</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-4 px-3 py-2 text-[#94a3b8] hover:text-[#1e2330] transition-colors group"
          >
             <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             <span className="text-[17px] font-bold">Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
