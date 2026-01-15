
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import StudentList from './components/StudentList';
import PiecesToCollect from './components/PiecesToCollect';
import GiftCardView from './components/GiftCardView';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import TeamTasksModule from './modules/teamTasks/TeamTasksModule';
import { AppView, Student, ClassSession, CeramicPiece, GiftCard, AttendanceRecord, Client } from './types';
import apiService from './services/api';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [pieces, setPieces] = useState<CeramicPiece[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde la API al iniciar
  useEffect(() => {
    if (isLoggedIn) {
      loadAllData();
    }
  }, [isLoggedIn]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [studentsData, sessionsData, piecesData, giftcardsData, clientsData] = await Promise.all([
        apiService.getStudents(),
        apiService.getSessions(),
        apiService.getPieces(),
        apiService.getGiftCards(),
        apiService.getClients()
      ]);
      
      setStudents(studentsData);
      setSessions(sessionsData);
      setPieces(piecesData);
      setGiftCards(giftcardsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Mostrar arrays vacíos si hay error
      setStudents([]);
      setSessions([]);
      setPieces([]);
      setGiftCards([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = useMemo(() => sessions.filter(s => s.date === todayStr), [sessions, todayStr]);

  const markAttendance = async (sessionId: string, studentName: string, status: 'present' | 'absent' | 'none') => {
    try {
      // Llamar al backend que maneja toda la lógica (actualizar asistencia, decrementar clases, etc.)
      const response = await apiService.updateAttendance(sessionId, studentName, status);
      
      // Actualizar la sesión con los datos retornados por el backend
      if (response.session) {
        setSessions(prev => prev.map(s => s.id === sessionId ? response.session : s));
      }
      
      // Recargar estudiantes para reflejar las clases restantes actualizadas
      const updatedStudents = await apiService.getStudents();
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Error al actualizar asistencia:', error);
      // En caso de error, recargar todos los datos para mantener sincronización
      loadAllData();
    }
  };

  const addStudent = async (newStudent: Omit<Student, 'id'>) => {
    try {
      const createdStudent = await apiService.saveStudent({ ...newStudent, attendanceHistory: [] } as Student);
      setStudents([...students, createdStudent]);
    } catch (error) {
      console.error('Error al agregar estudiante:', error);
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const student = students.find(s => s.id === id);
      if (student) {
        const updatedStudent = await apiService.saveStudent({ ...student, ...updates });
        setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
      }
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      // Recargar datos en caso de error para mantener sincronización
      loadAllData();
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await apiService.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      // Recargar datos en caso de error para mantener sincronización
      loadAllData();
    }
  };

  const renewStudent = async (id: string, numClasses: number = 4) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, classesRemaining: (s.classesRemaining || 0) + numClasses, status: 'regular' } : s));
    const student = students.find(s => s.id === id);
    if (student) {
      try {
        await apiService.saveStudent({ ...student, classesRemaining: (student.classesRemaining || 0) + numClasses, status: 'regular' });
      } catch (error) {
        console.error('Error al renovar estudiante:', error);
      }
    }
  };

  const addSession = async (newSession: Omit<ClassSession, 'id'>) => {
    try {
      const createdSession = await apiService.saveSession(newSession as any);
      setSessions([...sessions, createdSession]);
    } catch (error) {
      console.error('Error al agregar sesión:', error);
    }
  };

  const updateSession = async (id: string, updates: Partial<ClassSession>) => {
    try {
      const session = sessions.find(s => s.id === id);
      if (session) {
        const updatedSession = await apiService.saveSession({ ...session, ...updates });
        setSessions(prev => prev.map(s => s.id === id ? updatedSession : s));
      }
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      loadAllData();
    }
  };

  const deleteSession = async (id: string) => {
    setSessions(prev => prev.filter(p => p.id !== id));
    try {
      await apiService.deleteSession(id);
    } catch (error) {
      console.error('Error al eliminar sesión:', error);
    }
  };

  const addPiece = async (newPiece: Omit<CeramicPiece, 'id'>) => {
    try {
      const createdPiece = await apiService.savePiece(newPiece);
      setPieces([...pieces, createdPiece]);
    } catch (error) {
      console.error('Error al agregar pieza:', error);
    }
  };

  const updatePiece = async (id: string, updates: Partial<CeramicPiece>) => {
    try {
      const piece = pieces.find(p => p.id === id);
      if (piece) {
        const updatedPiece = await apiService.savePiece({ ...piece, ...updates });
        setPieces(prev => prev.map(p => p.id === id ? updatedPiece : p));
      }
    } catch (error) {
      console.error('Error al actualizar pieza:', error);
      // Recargar datos en caso de error para mantener sincronización
      loadAllData();
    }
  };

  const deletePiece = async (id: string) => {
    try {
      await apiService.deletePiece(id);
      setPieces(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar pieza:', error);
      // Recargar datos en caso de error para mantener sincronización
      loadAllData();
    }
  };

  const addGiftCard = async (newCard: Omit<GiftCard, 'id' | 'createdAt'>) => {
    try {
      const savedCard = await apiService.saveGiftCard(newCard);
      setGiftCards([...giftCards, savedCard]);
    } catch (error) {
      console.error('Error al agregar gift card:', error);
    }
  };

  const updateGiftCard = async (id: string, updates: Partial<GiftCard>) => {
    try {
      const giftCard = giftCards.find(c => c.id === id);
      if (giftCard) {
        const updatedCard = await apiService.saveGiftCard({ ...giftCard, ...updates });
        setGiftCards(prev => prev.map(c => c.id === id ? updatedCard : c));
      }
    } catch (error) {
      console.error('Error al actualizar gift card:', error);
    }
  };

  const deleteGiftCard = async (id: string) => {
    try {
      await apiService.deleteGiftCard(id);
      setGiftCards(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error al eliminar gift card:', error);
    }
  };

  // Funciones para clientes
  const addClient = async (newClient: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const savedClient = await apiService.saveClient(newClient);
      setClients([...clients, savedClient]);
      return savedClient;
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      throw error;
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.CALENDAR:
        return (
          <CalendarView 
            sessions={sessions} 
            onAddSession={addSession} 
            onUpdateSession={updateSession} 
            onDeleteSession={deleteSession} 
            students={students}
            onMarkAttendance={markAttendance}
          />
        );
      case AppView.STUDENTS:
        return <StudentList students={students} pieces={pieces} onAddStudent={addStudent} onRenew={renewStudent} onUpdate={updateStudent} onDeleteStudent={deleteStudent} />;
      case AppView.PIECES:
        return <PiecesToCollect pieces={pieces} onAddPiece={addPiece} onUpdatePiece={updatePiece} onDeletePiece={deletePiece} students={students} />;
      case AppView.GIFTCARDS:
        return <GiftCardView giftCards={giftCards} clients={clients} onAddGiftCard={addGiftCard} onUpdateGiftCard={updateGiftCard} onDeleteGiftCard={deleteGiftCard} onAddClient={addClient} />;
      case AppView.SETTINGS:
        return <SettingsView />;
      case AppView.TEAM_TASKS:
        return <TeamTasksModule />;
      case AppView.DASHBOARD:
        return (
          <div className="h-full flex flex-col items-center bg-[#FDF2F2] overflow-y-auto custom-scrollbar pt-4 pb-20 md:pt-8 px-4 md:px-6">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
              <div className="text-center mb-8 md:mb-12 space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-manrope font-extrabold text-[#1e2330] tracking-tight">Bienvenido, Alexander</h2>
                <p className="text-sm md:text-lg text-gray-400">Gestiona tu taller de cerámica artesanal.</p>
              </div>

              {todaySessions.length > 0 && (
                <div className="w-full max-w-2xl mb-12 animate-fade-in">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h4 className="text-[12px] font-manrope font-extrabold text-[#E55B69] uppercase tracking-widest">Clases de Hoy</h4>
                    <span className="text-[11px] font-manrope font-extrabold text-gray-300 uppercase">{todaySessions.length} SESIONES</span>
                  </div>
                  <div className="space-y-4">
                    {todaySessions.map(session => (
                      <div key={session.id} className="bg-white p-6 rounded-[2rem] border border-red-50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#E55B69] shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div>
                            <p className="font-manrope font-extrabold text-gray-800 text-lg leading-tight">{session.startTime} - {session.endTime}</p>
                            <p className="text-[10px] font-manrope font-extrabold text-gray-400 uppercase tracking-widest mt-0.5">
                              {session.attendanceConfirmed?.length || 0} / {(session.students || []).length} ASISTENCIAS
                            </p>
                            {/* Mostrar nombres de los alumnos en el dashboard */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {(session.students || []).map((name, i) => (
                                <span key={i} className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setCurrentView(AppView.CALENDAR); }}
                          className="px-6 py-3 bg-[#E55B69] text-white rounded-xl text-[11px] font-manrope font-extrabold uppercase tracking-widest shadow-lg shadow-red-100 ml-4 shrink-0"
                        >
                          PASAR LISTA
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:gap-6 w-full max-w-2xl px-2">
                 <button onClick={() => setCurrentView(AppView.CALENDAR)} className="flex items-center gap-6 p-8 bg-[#FF8A8A] rounded-[2rem] md:rounded-[3rem] shadow-xl text-white group hover:scale-[1.01] transition-all">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">AGENDA</span>
                      <p className="text-xl md:text-2xl font-black">Calendario de Clases</p>
                    </div>
                 </button>

                 <button onClick={() => setCurrentView(AppView.TEAM_TASKS)} className="flex items-center gap-6 p-8 bg-[#6366f1] rounded-[2rem] md:rounded-[3rem] shadow-xl text-white group hover:scale-[1.01] transition-all">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">EQUIPO</span>
                      <p className="text-xl md:text-2xl font-black">Tareas y Seguimiento</p>
                    </div>
                 </button>

                 <button onClick={() => setCurrentView(AppView.STUDENTS)} className="flex items-center gap-6 p-8 bg-[#B22234] rounded-[2rem] md:rounded-[3rem] shadow-xl text-white group hover:scale-[1.01] transition-all">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-80">ALUMNOS</span>
                      <p className="text-xl md:text-2xl font-black">Control de Bonos</p>
                    </div>
                 </button>
              </div>
            </div>
          </div>
        );
      default:
        return <CalendarView sessions={sessions} onAddSession={addSession} onUpdateSession={updateSession} onDeleteSession={deleteSession} students={students} onMarkAttendance={markAttendance} />;
    }
  };

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#FDF2F2]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E55B69] mx-auto mb-4"></div>
          <p className="text-gray-600 font-manrope font-bold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#FDF2F2] overflow-hidden">
      <div className="hidden lg:block h-full py-6 pl-6 shrink-0 no-print">
        <Sidebar currentView={currentView} setView={setCurrentView} onLogout={() => setIsLoggedIn(false)} />
      </div>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-[80px] lg:pb-0">
        <header className="flex justify-between items-center py-4 px-4 md:px-8 shrink-0 bg-[#FDF2F2] z-20 no-print">
           <div className="flex flex-col">
              <p className="text-gray-400 text-[10px] md:text-xs font-manrope font-extrabold uppercase tracking-[0.2em]">Estudio de Cerámica</p>
              <h2 className="text-lg md:text-2xl font-manrope font-extrabold text-gray-800 leading-tight">Panel de Control</h2>
           </div>
        </header>
        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>
      </main>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-red-50 flex justify-around items-center h-[80px] px-2 z-50 no-print">
        {[
          { id: AppView.DASHBOARD, label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { id: AppView.CALENDAR, label: 'Agenda', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { id: AppView.STUDENTS, label: 'Alumnos', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { id: AppView.TEAM_TASKS, label: 'Equipo', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        ].map(item => (
          <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${currentView === item.id ? 'text-[#E55B69]' : 'text-gray-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
            <span className="text-[10px] font-manrope font-extrabold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
