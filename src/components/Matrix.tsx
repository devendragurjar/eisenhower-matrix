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
      <div className="flex gap-4">
        {/* Left axis labels */}
        <div className="hidden md:flex flex-col shrink-0 w-7 pt-12">
          <div className="flex-1 flex items-center justify-center">
            <span className="axis-label axis-label-vertical text-green-500/70 dark:text-green-500/50">
              Important
            </span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="axis-label axis-label-vertical text-gray-400/70 dark:text-gray-600/50">
              Not Important
            </span>
          </div>
        </div>

        {/* Grid area */}
        <div className="flex-1 min-w-0">
          {/* Top axis labels */}
          <div className="hidden md:grid grid-cols-2 gap-4 mb-3">
            <div className="text-center py-1.5">
              <span className="axis-label text-red-400/70 dark:text-red-500/50">
                Urgent
              </span>
            </div>
            <div className="text-center py-1.5">
              <span className="axis-label text-blue-400/70 dark:text-blue-500/50">
                Not Urgent
              </span>
            </div>
          </div>

          {/* 2x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Quadrant id="q1" />
            <Quadrant id="q2" />
            <Quadrant id="q3" />
            <Quadrant id="q4" />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="p-3 rounded-xl border bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-600 shadow-xl rotate-2 opacity-90">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{activeTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
