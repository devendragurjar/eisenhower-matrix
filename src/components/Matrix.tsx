import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import type { QuadrantId, Task } from '../types';
import { QUADRANT_CONFIG } from '../types';
import { useStore } from '../store';
import Quadrant from './Quadrant';

export default function Matrix() {
  const { dispatch, activeBoard } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = activeBoard?.tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const quadrants: QuadrantId[] = ['q1', 'q2', 'q3', 'q4'];
    if (quadrants.includes(overId as QuadrantId)) {
      dispatch({ type: 'MOVE_TASK', payload: { id: taskId, quadrant: overId as QuadrantId } });
      return;
    }

    const overTask = activeBoard?.tasks.find(t => t.id === overId);
    if (overTask && overTask.quadrant) {
      const task = activeBoard?.tasks.find(t => t.id === taskId);
      if (task && task.quadrant !== overTask.quadrant) {
        dispatch({ type: 'MOVE_TASK', payload: { id: taskId, quadrant: overTask.quadrant } });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3">
        {/* Left axis: IMPORTANT / NOT IMPORTANT */}
        <div className="hidden md:flex flex-col shrink-0 w-7 pt-10">
          <div className="flex-1 flex items-center justify-center">
            <span className="axis-label axis-label-vertical bg-gradient-to-b from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
              Important
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="axis-label axis-label-vertical bg-gradient-to-b from-slate-400 to-slate-300 bg-clip-text text-transparent dark:from-slate-500 dark:to-slate-600">
              Not Important
            </span>
          </div>
        </div>

        {/* Grid area */}
        <div className="flex-1 min-w-0">
          {/* Top axis: URGENT / NOT URGENT */}
          <div className="hidden md:grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center justify-center py-2 rounded-xl bg-red-500/5 dark:bg-red-500/10 border border-red-200/50 dark:border-red-800/30">
              <span className="axis-label bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                Urgent
              </span>
            </div>
            <div className="flex items-center justify-center py-2 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-800/30">
              <span className="axis-label bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Not Urgent
              </span>
            </div>
          </div>

          {/* 2x2 quadrant grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Quadrant id="q1" />
            <Quadrant id="q2" />
            <Quadrant id="q3" />
            <Quadrant id="q4" />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="p-3 rounded-xl border-2 bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-500
            shadow-2xl shadow-blue-500/20 rotate-2 max-w-[280px]">
            <div className="flex items-center gap-2">
              <span className="text-sm">{QUADRANT_CONFIG[activeTask.quadrant].icon}</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activeTask.title}</p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
