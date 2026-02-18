import { createContext, useContext, useReducer, useEffect, type ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Action, Board, Task, QuadrantId } from './types';

const STORAGE_KEY = 'metrix-app-data';
const MAX_UNDO = 20;

function createDefaultBoard(): Board {
  return {
    id: uuidv4(),
    name: 'My Matrix',
    tasks: [],
    createdAt: new Date().toISOString(),
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        searchQuery: '',
        undoStack: [],
      };
    }
  } catch {
    // ignore
  }
  const board = createDefaultBoard();
  return {
    boards: [board],
    activeBoardId: board.id,
    darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    searchQuery: '',
    undoStack: [],
  };
}

function saveState(state: AppState) {
  try {
    const { searchQuery: _, undoStack: __, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    // ignore
  }
}

function getActiveBoard(state: AppState): Board | undefined {
  return state.boards.find(b => b.id === state.activeBoardId);
}

function updateActiveBoard(state: AppState, updater: (board: Board) => Board): AppState {
  const board = getActiveBoard(state);
  if (!board) return state;

  const snapshot = JSON.parse(JSON.stringify(board)) as Board;
  const undoStack = [...state.undoStack, snapshot].slice(-MAX_UNDO);

  return {
    ...state,
    undoStack,
    boards: state.boards.map(b => b.id === state.activeBoardId ? updater(b) : b),
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK': {
      const board = getActiveBoard(state);
      if (!board) return state;
      const tasksInQuadrant = board.tasks.filter(t => t.quadrant === action.payload.quadrant);
      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
        order: tasksInQuadrant.length,
      };
      return updateActiveBoard(state, b => ({
        ...b,
        tasks: [...b.tasks, newTask],
      }));
    }

    case 'UPDATE_TASK':
      return updateActiveBoard(state, b => ({
        ...b,
        tasks: b.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      }));

    case 'DELETE_TASK':
      return updateActiveBoard(state, b => ({
        ...b,
        tasks: b.tasks.filter(t => t.id !== action.payload),
      }));

    case 'TOGGLE_COMPLETE':
      return updateActiveBoard(state, b => ({
        ...b,
        tasks: b.tasks.map(t =>
          t.id === action.payload
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : null,
              }
            : t
        ),
      }));

    case 'MOVE_TASK':
      return updateActiveBoard(state, b => ({
        ...b,
        tasks: b.tasks.map(t =>
          t.id === action.payload.id
            ? { ...t, quadrant: action.payload.quadrant, completed: false, completedAt: null }
            : t
        ),
      }));

    case 'REORDER_TASKS':
      return updateActiveBoard(state, b => ({
        ...b,
        tasks: b.tasks.map(t => {
          if (t.quadrant !== action.payload.quadrant) return t;
          const idx = action.payload.taskIds.indexOf(t.id);
          return idx >= 0 ? { ...t, order: idx } : t;
        }),
      }));

    case 'ADD_BOARD': {
      const newBoard: Board = {
        id: uuidv4(),
        name: action.payload,
        tasks: [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        boards: [...state.boards, newBoard],
        activeBoardId: newBoard.id,
      };
    }

    case 'DELETE_BOARD': {
      if (state.boards.length <= 1) return state;
      const remaining = state.boards.filter(b => b.id !== action.payload);
      return {
        ...state,
        boards: remaining,
        activeBoardId: state.activeBoardId === action.payload
          ? remaining[0].id
          : state.activeBoardId,
        undoStack: [],
      };
    }

    case 'RENAME_BOARD':
      return {
        ...state,
        boards: state.boards.map(b =>
          b.id === action.payload.id ? { ...b, name: action.payload.name } : b
        ),
      };

    case 'SET_ACTIVE_BOARD':
      return { ...state, activeBoardId: action.payload, undoStack: [], searchQuery: '' };

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        undoStack: state.undoStack.slice(0, -1),
        boards: state.boards.map(b => b.id === previous.id ? previous : b),
      };
    }

    case 'IMPORT_DATA':
      return {
        ...state,
        boards: action.payload,
        activeBoardId: action.payload[0]?.id || state.activeBoardId,
        undoStack: [],
      };

    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeBoard: Board | undefined;
  getFilteredTasks: (quadrant: QuadrantId) => Task[];
  completedTasks: Task[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  const activeBoard = getActiveBoard(state);

  const getFilteredTasks = useCallback((quadrant: QuadrantId): Task[] => {
    if (!activeBoard) return [];
    const query = state.searchQuery.toLowerCase();
    return activeBoard.tasks
      .filter(t => t.quadrant === quadrant && !t.completed)
      .filter(t => !query || t.title.toLowerCase().includes(query) || t.tags.some(tag => tag.toLowerCase().includes(query)))
      .sort((a, b) => a.order - b.order);
  }, [activeBoard, state.searchQuery]);

  const completedTasks = activeBoard
    ? activeBoard.tasks
        .filter(t => t.completed)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    : [];

  return (
    <StoreContext.Provider value={{ state, dispatch, activeBoard, getFilteredTasks, completedTasks }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
