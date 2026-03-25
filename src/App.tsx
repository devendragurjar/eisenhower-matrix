import { useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import Header from './components/Header';
import Stats from './components/Stats';
import Matrix from './components/Matrix';
import DoneSection from './components/DoneSection';
import ThoughtOfDay from './components/ThoughtOfDay';
import GoalTracker from './components/GoalTracker';

function AppContent() {
  const { dispatch } = useStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <Header />
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <Stats />
        <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
          <div className="flex-1 min-w-0">
            <Matrix />
          </div>
          <div className="flex flex-col gap-3 w-full lg:w-64 lg:shrink-0">
            <ThoughtOfDay />
            <GoalTracker />
          </div>
        </div>
        <DoneSection />
        <footer className="mt-8 pb-4 text-center text-xs text-gray-400 dark:text-gray-600">
          Drag tasks between quadrants &middot; Ctrl+Z to undo &middot; Data saved locally
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
