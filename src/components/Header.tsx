import { useState, useRef } from 'react';
import { useStore } from '../store';

export default function Header() {
  const { state, dispatch } = useStore();
  const { darkMode, searchQuery, boards, activeBoardId } = state;
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId);

  const handleAddBoard = () => {
    const name = newBoardName.trim();
    if (name) {
      dispatch({ type: 'ADD_BOARD', payload: name });
      setNewBoardName('');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(boards, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrix-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data)) {
          dispatch({ type: 'IMPORT_DATA', payload: data });
        }
      } catch {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 glass border-b border-gray-200/60 dark:border-slate-700/60 sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo + Board selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-500
                flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-blue-500/25">
                M
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-extrabold text-gray-900 dark:text-white leading-none">Metrix</h1>
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 leading-none mt-0.5">Eisenhower Matrix</p>
              </div>
            </div>

            <div className="w-px h-7 bg-gray-200 dark:bg-slate-700 hidden sm:block" />

            {/* Board selector */}
            <div className="relative">
              <button
                onClick={() => setShowBoardMenu(!showBoardMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl
                  bg-gray-50 dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700
                  text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700
                  transition-all text-sm font-semibold active:scale-[0.98]"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="text-gray-400 dark:text-gray-500">
                  <path d="M0 2a2 2 0 012-2h5l2 2h5a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V2z"/>
                </svg>
                <span className="max-w-[120px] truncate">{activeBoard?.name || 'Board'}</span>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>

              {showBoardMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => { setShowBoardMenu(false); setEditingBoardId(null); }} />
                  <div className="absolute left-0 top-12 z-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-black/10
                    dark:shadow-black/40 border border-gray-200 dark:border-slate-700 py-2 min-w-[240px] animate-fade-in">
                    <div className="px-3 pb-2 mb-1 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Boards</p>
                    </div>
                    {boards.map(b => (
                      <div key={b.id} className="flex items-center group">
                        {editingBoardId === b.id ? (
                          <form
                            className="flex-1 px-3 py-1"
                            onSubmit={e => {
                              e.preventDefault();
                              if (editName.trim()) {
                                dispatch({ type: 'RENAME_BOARD', payload: { id: b.id, name: editName.trim() } });
                              }
                              setEditingBoardId(null);
                            }}
                          >
                            <input
                              autoFocus
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              onBlur={() => setEditingBoardId(null)}
                              className="w-full px-2.5 py-1.5 text-sm rounded-lg border-2 border-blue-400 dark:border-blue-500
                                bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none"
                            />
                          </form>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                dispatch({ type: 'SET_ACTIVE_BOARD', payload: b.id });
                                setShowBoardMenu(false);
                              }}
                              className={`flex-1 text-left px-3 py-2.5 text-sm font-medium rounded-lg mx-1 transition-all
                                ${b.id === activeBoardId
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                            >
                              {b.name}
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-2 font-semibold tabular-nums">
                                {b.tasks.length}
                              </span>
                            </button>
                            <button
                              onClick={() => { setEditingBoardId(b.id); setEditName(b.name); }}
                              className="p-1.5 mr-0.5 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-300
                                opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                              title="Rename"
                            >
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M12.1 1.3a1 1 0 011.4 0l1.2 1.2a1 1 0 010 1.4l-9 9L2 14l1.1-3.7 9-9z"/>
                              </svg>
                            </button>
                            {boards.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${b.name}"?`)) {
                                    dispatch({ type: 'DELETE_BOARD', payload: b.id });
                                  }
                                }}
                                className="p-1.5 mr-1 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400
                                  opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                title="Delete"
                              >
                                <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    <div className="px-3 pt-2 mt-1 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newBoardName}
                          onChange={e => setNewBoardName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddBoard()}
                          placeholder="New board name..."
                          className="flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600
                            bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none
                            focus:ring-2 focus:ring-blue-500 placeholder-gray-400 font-medium"
                        />
                        <button
                          onClick={handleAddBoard}
                          disabled={!newBoardName.trim()}
                          className="px-3.5 py-2 text-sm bg-blue-600 text-white rounded-xl
                            hover:bg-blue-700 transition-all disabled:opacity-30 font-semibold active:scale-95"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <div className="relative hidden sm:block">
              <svg
                width="13" height="13" viewBox="0 0 16 16" fill="currentColor"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              >
                <path d="M11.7 10.3a7 7 0 10-1.4 1.4l4 4a1 1 0 001.4-1.4l-4-4zM7 12A5 5 0 117 2a5 5 0 010 10z"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                placeholder="Search tasks..."
                className="pl-9 pr-4 py-2 w-44 lg:w-56 rounded-xl border border-gray-200/80 dark:border-slate-700
                  bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-white font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 dark:focus:border-blue-500
                  placeholder-gray-400 dark:placeholder-gray-500 transition-all"
              />
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {/* Action buttons */}
            {[
              { title: 'Undo', onClick: () => dispatch({ type: 'UNDO' }), disabled: state.undoStack.length === 0, icon: (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 3a5 5 0 11-4.5 2.8.75.75 0 00-1.3-.75A6.5 6.5 0 108 1.5V0L5 2.5 8 5V3z"/>
                </svg>
              )},
              { title: 'Export', onClick: handleExport, icon: (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 9.9a.5.5 0 01.5.5v2.5A1.1 1.1 0 002.1 14h11.8a1.1 1.1 0 001.1-1.1V10.4a.5.5 0 011 0v2.5A2.1 2.1 0 0113.9 15H2.1A2.1 2.1 0 010 12.9V10.4a.5.5 0 01.5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z"/>
                </svg>
              )},
              { title: 'Import', onClick: () => fileInputRef.current?.click(), icon: (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 9.9a.5.5 0 01.5.5v2.5A1.1 1.1 0 002.1 14h11.8a1.1 1.1 0 001.1-1.1V10.4a.5.5 0 011 0v2.5A2.1 2.1 0 0113.9 15H2.1A2.1 2.1 0 010 12.9V10.4a.5.5 0 01.5-.5z"/>
                  <path d="M7.646 1.146a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L8.5 2.707V11.5a.5.5 0 01-1 0V2.707L5.354 4.854a.5.5 0 11-.708-.708l3-3z"/>
                </svg>
              )},
            ].map(btn => (
              <button
                key={btn.title}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className="p-2 rounded-xl text-gray-400 dark:text-gray-500
                  hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-300
                  transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
                title={btn.title}
              >
                {btn.icon}
              </button>
            ))}
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

            {/* Dark mode */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
              className="p-2 rounded-xl text-gray-400 dark:text-gray-500
                hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-300
                transition-all active:scale-90"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 1zm0 10a3 3 0 100-6 3 3 0 000 6zm6.5-2.5a.5.5 0 010-1h1a.5.5 0 010 1h-1zm-13 0a.5.5 0 010-1h1a.5.5 0 010 1h-1zm11.157-4.843a.5.5 0 010 .707l-.707.707a.5.5 0 01-.707-.707l.707-.707a.5.5 0 01.707 0zm-9.9 9.9a.5.5 0 010 .707l-.707.707a.5.5 0 01-.707-.707l.707-.707a.5.5 0 01.707 0zm9.9 0a.5.5 0 01-.707 0l-.707-.707a.5.5 0 01.707-.707l.707.707a.5.5 0 010 .707zM3.757 3.757a.5.5 0 01-.707 0l-.707-.707a.5.5 0 01.707-.707l.707.707a.5.5 0 010 .707zM8 13a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 13z"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
