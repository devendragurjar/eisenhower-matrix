import type { QuadrantId } from '../types';
import { QUADRANT_CONFIG } from '../types';
import { useStore } from '../store';

export default function Stats() {
  const { activeBoard } = useStore();
  if (!activeBoard) return null;

  const tasks = activeBoard.tasks;
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const overdue = tasks.filter(t => t.deadline && !t.completed && new Date(t.deadline) < new Date(new Date().toDateString())).length;

  if (total === 0) return null;

  const quadrants: QuadrantId[] = ['q1', 'q2', 'q3', 'q4'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
      {/* Overall stats */}
      <div className="col-span-2 md:col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{completed} done</span>
          <span>{total - completed} remaining</span>
          {overdue > 0 && <span className="text-red-500">{overdue} overdue</span>}
        </div>
      </div>

      {/* Per-quadrant */}
      {quadrants.map(q => {
        const config = QUADRANT_CONFIG[q];
        const qTotal = tasks.filter(t => t.quadrant === q).length;
        const qDone = tasks.filter(t => t.quadrant === q && t.completed).length;
        return (
          <div
            key={q}
            className={`p-3 rounded-2xl border ${config.bgClass} ${config.borderClass} ${config.darkBgClass} ${config.darkBorderClass}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{config.icon}</span>
              <span className={`text-xs font-bold ${config.colorClass}`}>{config.action}</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{qTotal - qDone}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                / {qTotal}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
