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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* Axis labels */}
        <div className="hidden md:block md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400/70 dark:text-red-500/50">
                Urgent
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400/70 dark:text-blue-500/50">
                Not Urgent
              </span>
            </div>
          </div>
        </div>

        {/* Row label + Q1 */}
        <div className="relative">
          <div className="hidden md:block absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90">
            <span className="text-xs font-bold uppercase tracking-widest text-green-400/70 dark:text-green-500/50 whitespace-nowrap">
              Important
            </span>
          </div>
          <Quadrant id="q1" />
        </div>

        <Quadrant id="q2" />

        {/* Row label + Q3 */}
        <div className="relative">
          <div className="hidden md:block absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-300/70 dark:text-gray-600/50 whitespace-nowrap">
              Not Important
            </span>
          </div>
          <Quadrant id="q3" />
        </div>

        <Quadrant id="q4" />
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
