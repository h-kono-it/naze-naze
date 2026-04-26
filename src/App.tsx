import { useState, useEffect } from 'react';
import type { Analysis } from './types';
import { storage } from './lib/storage';
import { HomeScreen } from './components/HomeScreen';
import { AnalysisEditor } from './components/AnalysisEditor';
import { GuidePage } from './components/GuidePage';

type View = 'home' | 'guide' | 'editor';

export default function App() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [view, setView] = useState<View>('home');
  const [current, setCurrent] = useState<Analysis | null>(null);

  const refresh = () => setAnalyses(storage.loadAll());

  useEffect(() => {
    refresh();
  }, []);

  if (view === 'editor' && current) {
    return (
      <AnalysisEditor
        key={current.id}
        analysis={current}
        onBack={() => { setView('home'); setCurrent(null); refresh(); }}
      />
    );
  }

  if (view === 'guide') {
    return <GuidePage onBack={() => setView('home')} />;
  }

  return (
    <HomeScreen
      analyses={analyses}
      onSelect={(a) => { setCurrent(a); setView('editor'); }}
      onRefresh={refresh}
      onGuide={() => setView('guide')}
    />
  );
}
