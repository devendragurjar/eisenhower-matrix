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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100
      dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <Stats />
        <Matrix />
        <DoneSection />
        <footer className="mt-10 pb-6 text-center">
          <p className="text-[11px] font-medium text-gray-300 dark:text-gray-700">
            Drag tasks between quadrants &middot; Ctrl+Z to undo &middot; Data saved locally
          </p>
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
