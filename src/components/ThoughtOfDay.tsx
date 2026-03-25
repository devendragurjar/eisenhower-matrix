import { useState } from 'react';
import { useStore } from '../store';

export default function ThoughtOfDay() {
  const { state, dispatch } = useStore();
  const { currentThought, erasedThoughts } = state;

  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(!currentThought);
  const [erasedOpen, setErasedOpen] = useState(false);

  function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    dispatch({ type: 'SET_THOUGHT', payload: trimmed });
    setDraft('');
    setEditing(false);
  }

  function handleErase() {
    dispatch({ type: 'ERASE_THOUGHT' });
    setEditing(true);
  }

  function handleEditCurrent() {
    setDraft(currentThought ?? '');
    setEditing(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-950/30 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">💭</span>
          <h3 className="font-medium text-purple-500 dark:text-purple-400 text-xs tracking-wide uppercase">
            Thought of the Day
          </h3>
        </div>

        {currentThought && !editing ? (
          <div className="flex flex-col gap-2">
            <p className="text-gray-800 dark:text-gray-100 text-xl font-bold leading-snug whitespace-pre-wrap">
              {currentThought}
            </p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={handleEditCurrent}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={handleErase}
                className="text-xs text-red-500 dark:text-red-400 hover:underline"
              >
                Erase
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Write your thought for today..."
              rows={4}
              className="w-full rounded-lg border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 p-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!draft.trim()}
                className="flex-1 text-xs font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg py-1.5 transition-colors"
              >
                Save
              </button>
              {currentThought && (
                <button
                  onClick={() => { setDraft(''); setEditing(false); }}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:underline px-1"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {erasedThoughts.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800/50 overflow-hidden">
          <button
            onClick={() => setErasedOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="font-medium">Erased thoughts ({erasedThoughts.length})</span>
            <span className="text-xs">{erasedOpen ? '▲' : '▼'}</span>
          </button>
          {erasedOpen && (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {erasedThoughts.map(t => (
                <li key={t.id} className="flex items-start gap-2 px-4 py-2.5">
                  <p className="flex-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {t.text}
                  </p>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_ERASED_THOUGHT', payload: t.id })}
                    className="shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors mt-0.5"
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
