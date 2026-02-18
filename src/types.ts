export type QuadrantId = 'q1' | 'q2' | 'q3' | 'q4';

export interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: QuadrantId;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  deadline: string | null;
  tags: string[];
  order: number;
}

export interface Board {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: string;
}

export interface AppState {
  boards: Board[];
  activeBoardId: string;
  darkMode: boolean;
  searchQuery: string;
  undoStack: Board[];
}

export const QUADRANT_CONFIG: Record<QuadrantId, {
  label: string;
  subtitle: string;
  action: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  darkBgClass: string;
  darkBorderClass: string;
  icon: string;
}> = {
  q1: {
    label: 'Urgent & Important',
    subtitle: 'Crisis, deadlines, problems',
    action: 'DO FIRST',
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    darkBgClass: 'dark:bg-red-950/30',
    darkBorderClass: 'dark:border-red-800/50',
    icon: '🔥',
  },
  q2: {
    label: 'Not Urgent & Important',
    subtitle: 'Planning, growth, prevention',
    action: 'SCHEDULE',
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    darkBgClass: 'dark:bg-blue-950/30',
    darkBorderClass: 'dark:border-blue-800/50',
    icon: '📅',
  },
  q3: {
    label: 'Urgent & Not Important',
    subtitle: 'Interruptions, meetings',
    action: 'DELEGATE',
    colorClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    darkBgClass: 'dark:bg-amber-950/30',
    darkBorderClass: 'dark:border-amber-800/50',
    icon: '📤',
  },
  q4: {
    label: 'Not Urgent & Not Important',
    subtitle: 'Time wasters, distractions',
    action: 'ELIMINATE',
    colorClass: 'text-gray-600 dark:text-gray-400',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    darkBgClass: 'dark:bg-gray-800/30',
    darkBorderClass: 'dark:border-gray-700/50',
    icon: '🗑️',
  },
};

export type Action =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'order'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'MOVE_TASK'; payload: { id: string; quadrant: QuadrantId } }
  | { type: 'REORDER_TASKS'; payload: { quadrant: QuadrantId; taskIds: string[] } }
  | { type: 'ADD_BOARD'; payload: string }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'RENAME_BOARD'; payload: { id: string; name: string } }
  | { type: 'SET_ACTIVE_BOARD'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'UNDO' }
  | { type: 'IMPORT_DATA'; payload: Board[] };
