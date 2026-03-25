import { useState } from 'react';
import { useStore } from '../store';
import type { TimelineType } from '../types';

function formatTimeline(type: TimelineType, value: string): string {
  if (!value) return '';
  if (type === 'day') {
    const date = new Date(value + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  if (type === 'month') {
    const [year, month] = value.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  return value;
}

function getCountdown(type: TimelineType, value: string): { label: string; overdue: boolean } {
  if (!value) return { label: '', overdue: false };
  const now = new Date();

  if (type === 'day') {
    const target = new Date(value + 'T00:00:00');
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'Overdue', overdue: true };
    if (diff === 0) return { label: 'Today', overdue: false };
    if (diff === 1) return { label: 'Tomorrow', overdue: false };
    return { label: `In ${diff} days`, overdue: false };
  }

  if (type === 'month') {
    const [year, month] = value.split('-').map(Number);
    const diffMonths = (year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1));
    if (diffMonths < 0) return { label: 'Overdue', overdue: true };
    if (diffMonths === 0) return { label: 'This month', overdue: false };
    if (diffMonths === 1) return { label: 'Next month', overdue: false };
    return { label: `In ${diffMonths} months`, overdue: false };
  }

  const targetYear = Number(value);
  const diff = targetYear - now.getFullYear();
  if (diff < 0) return { label: 'Overdue', overdue: true };
  if (diff === 0) return { label: 'This year', overdue: false };
  if (diff === 1) return { label: 'Next year', overdue: false };
  return { label: `In ${diff} years`, overdue: false };
}

function TimelineInput({ type, value, onChange }: {
  type: TimelineType;
  value: string;
  onChange: (v: string) => void;
}) {
  const base = 'w-full rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600';
  if (type === 'day') {
    return <input type="date" value={value} onChange={e => onChange(e.target.value)} className={base} />;
  }
  if (type === 'month') {
    return <input type="month" value={value} onChange={e => onChange(e.target.value)} className={base} />;
  }
  const currentYear = new Date().getFullYear();
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={base}>
      <option value="">Select year</option>
      {Array.from({ length: 11 }, (_, i) => currentYear + i).map(y => (
        <option key={y} value={String(y)}>{y}</option>
      ))}
    </select>
  );
}

export default function GoalTracker() {
  const { state, dispatch } = useStore();
  const { goals } = state;

  const [draftText, setDraftText] = useState('');
  const [draftType, setDraftType] = useState<TimelineType>('month');
  const [draftValue, setDraftValue] = useState('');
  const [adding, setAdding] = useState(false);
  const [completedOpen, setCompletedOpen] = useState(false);

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  function handleAdd() {
    const text = draftText.trim();
    if (!text || !draftValue) return;
    dispatch({ type: 'ADD_GOAL', payload: { text, timelineType: draftType, timelineValue: draftValue } });
    setDraftText('');
    setDraftValue('');
    setAdding(false);
  }

  return (
    <div className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/30 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🎯</span>
          <h3 className="font-medium text-green-600 dark:text-green-400 text-xs tracking-wide uppercase">
            Goals
          </h3>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs text-green-600 dark:text-green-400 hover:underline"
          >
            + Add
          </button>
        )}
      </div>

      {adding && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            placeholder="What's your goal?"
            className="w-full rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 p-2 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600"
          />
          <div className="flex gap-2">
            {(['day', 'month', 'year'] as TimelineType[]).map(t => (
              <button
                key={t}
                onClick={() => { setDraftType(t); setDraftValue(''); }}
                className={`flex-1 text-xs rounded-lg py-1 border transition-colors ${
                  draftType === t
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-green-200 dark:border-green-700 hover:border-green-400'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <TimelineInput type={draftType} value={draftValue} onChange={setDraftValue} />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!draftText.trim() || !draftValue}
              className="flex-1 text-xs font-medium bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-1.5 transition-colors"
            >
              Save Goal
            </button>
            <button
              onClick={() => { setAdding(false); setDraftText(''); setDraftValue(''); }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline px-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeGoals.length === 0 && !adding && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">No active goals yet.</p>
      )}

      {activeGoals.length > 0 && (
        <ul className="flex flex-col gap-2">
          {activeGoals.map(goal => {
            const { label, overdue } = getCountdown(goal.timelineType, goal.timelineValue);
            return (
              <li key={goal.id} className="flex items-start gap-2 bg-white dark:bg-slate-800/50 rounded-lg p-2.5 border border-green-100 dark:border-green-900/40">
                <button
                  onClick={() => dispatch({ type: 'COMPLETE_GOAL', payload: goal.id })}
                  className="mt-0.5 shrink-0 w-4 h-4 rounded border border-green-400 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  title="Mark complete"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-gray-100 font-medium leading-snug">{goal.text}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimeline(goal.timelineType, goal.timelineValue)}
                    </span>
                    {label && (
                      <span className={`text-xs font-medium ${overdue ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        · {label}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })}
                  className="shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors mt-0.5"
                  title="Delete goal"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {completedGoals.length > 0 && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/50 overflow-hidden">
          <button
            onClick={() => setCompletedOpen(o => !o)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="font-medium">Completed ({completedGoals.length})</span>
            <span>{completedOpen ? '▲' : '▼'}</span>
          </button>
          {completedOpen && (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {completedGoals.map(goal => (
                <li key={goal.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="text-green-500 text-xs shrink-0">✓</span>
                  <p className="flex-1 text-xs text-gray-400 dark:text-gray-500 line-through leading-relaxed">{goal.text}</p>
                  <button
                    onClick={() => dispatch({ type: 'COMPLETE_GOAL', payload: goal.id })}
                    className="text-xs text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors shrink-0"
                    title="Restore goal"
                  >
                    ↩
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })}
                    className="shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Delete permanently"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
