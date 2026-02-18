import { useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import Header from './components/Header';
import Stats from './components/Stats';
import Matrix from './components/Matrix';
import DoneSection from './components/DoneSection';

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
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <Stats />
        <Matrix />
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
