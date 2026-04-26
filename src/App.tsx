import { useState, useEffect } from 'react';
import type { Analysis } from './types';
import { storage } from './lib/storage';
import { HomeScreen } from './components/HomeScreen';
import { AnalysisEditor } from './components/AnalysisEditor';

export default function App() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [current, setCurrent] = useState<Analysis | null>(null);

  const refresh = () => setAnalyses(storage.loadAll());

  useEffect(() => {
    refresh();
  }, []);

  if (current) {
    return (
      <AnalysisEditor
        key={current.id}
        analysis={current}
        onBack={() => { setCurrent(null); refresh(); }}
      />
    );
  }

  return (
    <HomeScreen
      analyses={analyses}
      onSelect={setCurrent}
      onRefresh={refresh}
    />
  );
}
