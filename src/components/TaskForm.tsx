import { useState, useEffect, useRef } from 'react';
import type { Task, QuadrantId } from '../types';
import { QUADRANT_CONFIG } from '../types';

interface TaskFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    quadrant: QuadrantId;
    deadline: string | null;
    tags: string[];
  }) => void;
  onCancel: () => void;
  initialData?: Task;
  defaultQuadrant?: QuadrantId;
}

export default function TaskForm({ onSubmit, onCancel, initialData, defaultQuadrant = 'q1' }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [quadrant, setQuadrant] = useState<QuadrantId>(initialData?.quadrant || defaultQuadrant);
  const [deadline, setDeadline] = useState(initialData?.deadline || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      quadrant,
      deadline: deadline || null,
      tags,
    });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600
                  bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="What needs to be done?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600
                  bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                placeholder="Add more details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quadrant
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(QUADRANT_CONFIG) as QuadrantId[]).map(q => {
                  const config = QUADRANT_CONFIG[q];
                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuadrant(q)}
                      className={`p-3 rounded-xl border-2 text-left transition-all text-sm
                        ${quadrant === q
                          ? `${config.bgClass} ${config.borderClass} ${config.darkBgClass} ${config.darkBorderClass}`
                          : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                        }`}
                    >
                      <span className="mr-1">{config.icon}</span>
                      <span className={`font-semibold ${quadrant === q ? config.colorClass : 'text-gray-700 dark:text-gray-300'}`}>
                        {config.action}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-6">{config.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600
                  bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600
                    bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Add tag & press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-gray-200
                    rounded-xl hover:bg-gray-200 dark:hover:bg-slate-500 transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40
                        text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600
                  text-gray-700 dark:text-gray-300 rounded-xl
                  hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl
                  hover:bg-blue-700 transition-colors font-medium
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {initialData ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
