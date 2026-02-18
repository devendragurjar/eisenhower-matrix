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
      className={`flex flex-col rounded-2xl border-2 transition-colors min-h-[280px]
        ${config.bgClass} ${config.borderClass} ${config.darkBgClass} ${config.darkBorderClass}
        ${isOver ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wide ${config.colorClass}`}>
                {config.action}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{config.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20
              text-gray-600 dark:text-gray-300">
              {tasks.length}
            </span>
            <button
              onClick={() => setShowForm(true)}
              className="p-1.5 rounded-lg transition-colors text-gray-500 dark:text-gray-400
                hover:bg-white/60 dark:hover:bg-black/20 hover:text-gray-700 dark:hover:text-gray-200"
              title="Add task"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v10M3 8h10" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
            <p className="text-sm">{config.subtitle}</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400
                dark:hover:text-blue-300 font-medium"
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
