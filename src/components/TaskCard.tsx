import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, QuadrantId } from '../types';
import { QUADRANT_CONFIG } from '../types';
import { useStore } from '../store';
import TaskForm from './TaskForm';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = task.deadline && !task.completed && new Date(task.deadline) < new Date(new Date().toDateString());

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: task.id });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
    setShowMenu(false);
  };

  const handleEdit = (data: {
    title: string;
    description: string;
    quadrant: QuadrantId;
    deadline: string | null;
    tags: string[];
  }) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: { id: task.id, updates: data },
    });
    setEditing(false);
  };

  const formatDeadline = (date: string) => {
    const d = new Date(date);
    const today = new Date(new Date().toDateString());
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff <= 7) return `${diff}d left`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`task-card group relative p-3 rounded-xl border bg-white dark:bg-slate-800/80
          ${isOverdue
            ? 'border-red-200 dark:border-red-800/60 bg-red-50/40 dark:bg-red-950/20'
            : 'border-gray-100 dark:border-slate-700/60'}
          ${task.completed ? 'opacity-50' : ''}`}
      >
        <div className="flex items-start gap-2.5">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-200 dark:text-slate-600
              hover:text-gray-400 dark:hover:text-slate-400 shrink-0 transition-colors"
          >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
              <circle cx="2.5" cy="1.5" r="1.2"/>
              <circle cx="7.5" cy="1.5" r="1.2"/>
              <circle cx="2.5" cy="7" r="1.2"/>
              <circle cx="7.5" cy="7" r="1.2"/>
              <circle cx="2.5" cy="12.5" r="1.2"/>
              <circle cx="7.5" cy="12.5" r="1.2"/>
            </svg>
          </button>

          {/* Checkbox */}
          <button
            onClick={handleToggle}
            className={`mt-0.5 shrink-0 w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center
              transition-all duration-200
              ${task.completed
                ? 'bg-emerald-500 border-emerald-500 text-white scale-105'
                : 'border-gray-300 dark:border-slate-500 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
          >
            {task.completed && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6l3 3 5-5" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] font-semibold text-gray-800 dark:text-gray-100 leading-snug
              ${task.completed ? 'strikethrough' : ''}`}>
              {task.title}
            </p>
            {task.description && (
              <p className={`text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2 leading-relaxed
                ${task.completed ? 'strikethrough' : ''}`}>
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {task.deadline && (
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold
                  ${isOverdue
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'}`}>
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14A6 6 0 118 2a6 6 0 010 12zm.5-9H7v5l4.3 2.5.7-1.2-3.5-2V5z"/>
                  </svg>
                  {formatDeadline(task.deadline)}
                </span>
              )}
              {task.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-500 dark:text-violet-400
                    rounded-md font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-gray-300 dark:text-slate-600
                hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-500 dark:hover:text-slate-300
                opacity-0 group-hover:opacity-100 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5"/>
                <circle cx="8" cy="8" r="1.5"/>
                <circle cx="8" cy="13" r="1.5"/>
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-750 rounded-xl shadow-xl
                  shadow-black/10 dark:shadow-black/40
                  border border-gray-200 dark:border-slate-600 py-1.5 min-w-[160px] animate-fade-in">
                  <button
                    onClick={() => { setEditing(true); setShowMenu(false); }}
                    className="w-full text-left px-3.5 py-2 text-[13px] text-gray-600 dark:text-gray-300
                      hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="text-gray-400">
                      <path d="M12.1 1.3a1 1 0 011.4 0l1.2 1.2a1 1 0 010 1.4l-9 9L2 14l1.1-3.7 9-9zM11 4l1 1-7.5 7.5-.7-.3-.3-.7L11 4z"/>
                    </svg>
                    Edit
                  </button>
                  <div className="mx-2 my-1 border-t border-gray-100 dark:border-slate-600"></div>
                  {(Object.keys(QUADRANT_CONFIG) as QuadrantId[])
                    .filter(q => q !== task.quadrant)
                    .map(q => (
                      <button
                        key={q}
                        onClick={() => {
                          dispatch({ type: 'MOVE_TASK', payload: { id: task.id, quadrant: q } });
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-[13px] text-gray-600 dark:text-gray-300
                          hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2.5 font-medium"
                      >
                        <span className="text-sm">{QUADRANT_CONFIG[q].icon}</span>
                        Move to {QUADRANT_CONFIG[q].action}
                      </button>
                    ))}
                  <div className="mx-2 my-1 border-t border-gray-100 dark:border-slate-600"></div>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3.5 py-2 text-[13px] text-red-500 dark:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 font-medium"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M5.5 1h5a.5.5 0 01.5.5V3H5V1.5a.5.5 0 01.5-.5zM3 3V1.5A1.5 1.5 0 014.5 0h7A1.5 1.5 0 0113 1.5V3h2.5a.5.5 0 010 1H14v10a2 2 0 01-2 2H4a2 2 0 01-2-2V4h-.5a.5.5 0 010-1H3zm1 1v10a1 1 0 001 1h6a1 1 0 001-1V4H4z"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <TaskForm
          initialData={task}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
        />
      )}
    </>
  );
}
