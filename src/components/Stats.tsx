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

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const quadrants: QuadrantId[] = ['q1', 'q2', 'q3', 'q4'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6 animate-slide-up">
      {/* Progress card */}
      <div className="col-span-2 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/60 glass
        border border-gray-200/60 dark:border-slate-700/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Progress</span>
          <span className={`text-xl font-extrabold tabular-nums ${pct === 100 ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
            {pct}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              pct === 100
                ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                : 'bg-gradient-to-r from-blue-500 to-violet-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2.5 text-[11px] font-semibold">
          <span className="text-emerald-500">{completed} done</span>
          <span className="text-gray-400 dark:text-gray-500">{total - completed} left</span>
          {overdue > 0 && <span className="text-red-500">{overdue} overdue</span>}
        </div>
      </div>

      {/* Per-quadrant mini cards */}
      {quadrants.map(q => {
        const config = QUADRANT_CONFIG[q];
        const qTotal = tasks.filter(t => t.quadrant === q).length;
        const qDone = tasks.filter(t => t.quadrant === q && t.completed).length;
        const qActive = qTotal - qDone;
        return (
          <div
            key={q}
            className={`p-3 rounded-2xl border bg-white/60 dark:bg-slate-800/40 glass transition-all
              ${config.borderClass} ${config.darkBorderClass}
              hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">{config.icon}</span>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${config.colorClass}`}>
                {config.action}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{qActive}</span>
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">/ {qTotal}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
