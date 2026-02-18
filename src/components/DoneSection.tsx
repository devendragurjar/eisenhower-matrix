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
    <div className="mt-6 rounded-2xl border-2 border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-950/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-green-700 dark:text-green-400">
            Done
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40
            text-green-700 dark:text-green-400">
            {completedTasks.length}
          </span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-green-600 dark:text-green-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="flex justify-end mb-3">
            <button
              onClick={clearAll}
              className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Clear all completed
            </button>
          </div>
          <div className="space-y-2">
            {completedTasks.map(task => {
              const config = QUADRANT_CONFIG[task.quadrant];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800
                    border border-green-100 dark:border-slate-700 group"
                >
                  <button
                    onClick={() => handleUncomplete(task.id)}
                    className="shrink-0 w-5 h-5 rounded-md bg-green-500 border-2 border-green-500
                      flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-through">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${config.colorClass}`}>{config.icon} {config.action}</span>
                      {task.completedAt && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(task.completedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50
                      dark:hover:bg-red-900/20 dark:hover:text-red-400
                      opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
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
