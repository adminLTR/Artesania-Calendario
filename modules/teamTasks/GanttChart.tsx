
import React, { useMemo, useRef, useEffect } from 'react';
import { Tarea, EquipoMember } from './types';
import { getHoyMadrid, esAtrasada } from './utils';

interface GanttProps {
  tasks: Tarea[];
  members: EquipoMember[];
  onTaskClick: (task: Tarea) => void;
}

const GanttChart: React.FC<GanttProps> = ({ tasks, members, onTaskClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const DAY_WIDTH = 45;
  const ROW_HEIGHT = 56;
  const HEADER_HEIGHT = 90;

  const range = useMemo(() => {
    if (tasks.length === 0) {
      const start = new Date(getHoyMadrid());
      start.setDate(start.getDate() - 10);
      const end = new Date(start);
      end.setDate(end.getDate() + 30);
      return { start, end };
    }

    const startDates = tasks.map(t => new Date(t.fechaInicio).getTime());
    const endDates = tasks.map(t => new Date(t.fechaEntrega).getTime());
    
    const min = new Date(Math.min(...startDates));
    min.setDate(min.getDate() - 7);
    const max = new Date(Math.max(...endDates));
    max.setDate(max.getDate() + 7);
    
    return { start: min, end: max };
  }, [tasks]);

  const days = useMemo(() => {
    const arr = [];
    const current = new Date(range.start);
    while (current <= range.end) {
      arr.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return arr;
  }, [range]);

  const totalWidth = days.length * DAY_WIDTH;

  const hoyPos = useMemo(() => {
    const hoy = new Date(getHoyMadrid());
    const diff = hoy.getTime() - range.start.getTime();
    return (diff / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
  }, [range]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = hoyPos - containerRef.current.clientWidth / 2;
    }
  }, [hoyPos]);

  const getTaskStyles = (tarea: Tarea, memberColor: string) => {
    const start = new Date(tarea.fechaInicio);
    const end = new Date(tarea.fechaEntrega);
    
    const leftOffset = ((start.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
    const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const width = durationDays * DAY_WIDTH;

    let opacity = tarea.concluida ? '0.4' : '1';
    let borderStyle = esAtrasada(tarea) ? 'border-red-500' : 'border-transparent';

    return { 
      left: `${leftOffset}px`, 
      width: `${width}px`, 
      backgroundColor: memberColor,
      opacity,
      borderStyle
    };
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-[2rem] border border-red-50 overflow-hidden shadow-sm print-container">
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto relative select-none no-scrollbar gantt-scroll-container"
      >
        <div className="gantt-wrapper" style={{ width: `${totalWidth}px` }}>
          {/* Header */}
          <div className="sticky top-0 z-20 flex bg-white/90 backdrop-blur-md border-b border-red-50" style={{ width: `${totalWidth}px`, height: `${HEADER_HEIGHT}px` }}>
            {days.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = day.toLocaleDateString() === new Date().toLocaleDateString();
              return (
                <div 
                  key={i} 
                  className={`flex flex-col items-center justify-center border-r border-red-50 shrink-0 relative ${isWeekend ? 'bg-red-50/20' : ''}`}
                  style={{ width: `${DAY_WIDTH}px` }}
                >
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${isToday ? 'text-[#E55B69]' : 'text-gray-300'}`}>{day.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                  <span className={`text-[17px] font-black ${isToday ? 'text-[#E55B69]' : 'text-gray-800'}`}>{day.getDate()}</span>
                  {isToday && <div className="absolute bottom-0 w-1 h-1 bg-[#E55B69] rounded-full"></div>}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div className="relative" style={{ width: `${totalWidth}px` }}>
            {/* Today vertical bar */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-[#E55B69] z-10 pointer-events-none opacity-30 shadow-[0_0_10px_rgba(229,91,105,0.5)] no-print"
              style={{ left: `${hoyPos}px` }}
            />

            {/* Grid lines */}
            <div className="absolute inset-0 z-0 flex pointer-events-none">
              {days.map((_, i) => (
                <div key={i} className="border-r border-red-50/50 h-full shrink-0" style={{ width: `${DAY_WIDTH}px` }} />
              ))}
            </div>

            <div className="relative z-10 pt-10 pb-40">
              {members.map((member) => {
                const memberTasks = tasks.filter(t => t.responsableId === member.id);
                if (memberTasks.length === 0) return null;

                return (
                  <div key={member.id} className="mb-14 last:mb-0 group">
                    <div className="sticky left-6 flex items-center gap-3 bg-white/95 px-5 py-2.5 rounded-2xl shadow-xl border border-red-50 z-30 w-max mb-4 ml-6 transition-transform group-hover:scale-105">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-[10px]" style={{ backgroundColor: member.color }}>{member.nombre.charAt(0)}</div>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-800">{member.nombre}</span>
                    </div>
                    <div className="relative min-h-[40px]">
                      {memberTasks.map((tarea, tIdx) => {
                        const styles = getTaskStyles(tarea, member.color);
                        return (
                          <div 
                            key={tarea.id}
                            onClick={() => onTaskClick(tarea)}
                            className={`absolute h-10 rounded-xl flex items-center px-4 text-[10px] font-black text-white overflow-hidden shadow-lg transition-all hover:scale-[1.03] hover:z-40 cursor-pointer ${styles.borderStyle}`}
                            style={{ 
                              left: styles.left, 
                              width: styles.width, 
                              top: `${tIdx * ROW_HEIGHT}px`,
                              backgroundColor: styles.backgroundColor,
                              opacity: styles.opacity
                            }}
                          >
                            <span className="truncate uppercase tracking-wider">{tarea.titulo}</span>
                            <span className="ml-auto bg-black/20 px-2 py-0.5 rounded-md">{tarea.progreso}%</span>
                          </div>
                        );
                      })}
                      <div style={{ height: `${memberTasks.length * ROW_HEIGHT}px` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-5 bg-gray-50/50 border-t border-red-50 shrink-0 flex flex-wrap gap-8 items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 no-print">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded-lg" /> PENDIENTE
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#E55B69] opacity-40 rounded-lg" /> COMPLETADA
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-red-500 rounded-lg" /> ATRASADA
        </div>
        <div className="ml-auto text-gray-300">HAZ CLIC EN UNA TAREA PARA EDITARLA</div>
      </div>
    </div>
  );
};

export default GanttChart;
