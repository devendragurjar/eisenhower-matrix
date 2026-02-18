import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { QuadrantId } from '../types';
import { QUADRANT_CONFIG } from '../types';
import { useStore } from '../store';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

interface QuadrantProps {
  id: QuadrantId;
}

export default function Quadrant({ id }: QuadrantProps) {
  const { getFilteredTasks, dispatch } = useStore();
  const [showForm, setShowForm] = useState(false);

  const config = QUADRANT_CONFIG[id];
  const tasks = getFilteredTasks(id);

  const { setNodeRef, isOver } = useDroppable({ id });

  const handleAdd = (data: {
    title: string;
    description: string;
    quadrant: QuadrantId;
    deadline: string | null;
    tags: string[];
  }) => {
    dispatch({ type: 'ADD_TASK', payload: data });
    setShowForm(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`quadrant-panel flex flex-col rounded-2xl border transition-all min-h-[260px]
        bg-white/70 dark:bg-slate-800/60 glass
        ${isOver
          ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-400/30 dark:ring-blue-500/20 scale-[1.01]'
          : 'border-gray-200/80 dark:border-slate-700/80'}`}
    >
      {/* Header */}
      <div className={`px-4 pt-4 pb-3 border-b ${config.borderClass} dark:border-slate-700/60`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg
              ${config.bgClass} ${config.darkBgClass}`}>
              {config.icon}
            </div>
            <div>
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${config.colorClass}`}>
                {config.action}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium">{config.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg
              ${config.bgClass} ${config.darkBgClass} ${config.colorClass}`}>
              {tasks.length}
            </span>
            <button
              onClick={() => setShowForm(true)}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all
                text-gray-400 dark:text-gray-500
                hover:${config.bgClass} ${config.darkBgClass} hover:${config.colorClass}
                hover:bg-opacity-100 active:scale-95`}
              title="Add task"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-340px)]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-gray-300 dark:text-gray-600">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 opacity-50
              ${config.bgClass} ${config.darkBgClass}`}>
              {config.icon}
            </div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">{config.subtitle}</p>
            <button
              onClick={() => setShowForm(true)}
              className={`mt-3 text-xs font-semibold px-4 py-1.5 rounded-lg transition-all
                ${config.bgClass} ${config.darkBgClass} ${config.colorClass}
                hover:opacity-80 active:scale-95`}
            >
              + Add a task
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <TaskForm
          defaultQuadrant={id}
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
