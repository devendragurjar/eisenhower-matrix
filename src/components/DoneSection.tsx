import { useState } from 'react';
import { QUADRANT_CONFIG } from '../types';
import { useStore } from '../store';

export default function DoneSection() {
  const { completedTasks, dispatch } = useStore();
  const [expanded, setExpanded] = useState(true);

  if (completedTasks.length === 0) return null;

  const handleUncomplete = (id: string) => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const clearAll = () => {
    completedTasks.forEach(t => dispatch({ type: 'DELETE_TASK', payload: t.id }));
  };

  return (
    <div className="mt-6 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/30
      bg-white/60 dark:bg-slate-800/40 glass animate-slide-up">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
              <path d="M2 8l4 4 8-8" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Completed
            </h3>
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-0.5">
              {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} finished
            </p>
          </div>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`text-gray-300 dark:text-gray-600 transition-transform duration-200
            group-hover:text-gray-400 dark:group-hover:text-gray-500
            ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <div className="flex justify-end mb-3">
            <button
              onClick={clearAll}
              className="text-[11px] text-red-400 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400
                font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {completedTasks.map(task => {
              const config = QUADRANT_CONFIG[task.quadrant];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-slate-800/60
                    border border-gray-100 dark:border-slate-700/50 group transition-all hover:border-gray-200 dark:hover:border-slate-600"
                >
                  <button
                    onClick={() => handleUncomplete(task.id)}
                    className="shrink-0 w-[18px] h-[18px] rounded-md bg-emerald-500 border-2 border-emerald-500
                      flex items-center justify-center text-white hover:bg-emerald-600 hover:border-emerald-600 transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-400 dark:text-gray-500 line-through font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold ${config.colorClass}`}>{config.icon} {config.action}</span>
                      {task.completedAt && (
                        <span className="text-[10px] text-gray-300 dark:text-gray-600 font-medium">
                          {new Date(task.completedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-lg text-gray-300 dark:text-gray-600
                      hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400
                      opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
