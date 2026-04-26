import type { Analysis } from '../types';

const KEY = 'naze-naze-analyses';

export const storage = {
  loadAll(): Analysis[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Analysis[]) : [];
    } catch {
      return [];
    }
  },

  save(analysis: Analysis): void {
    const all = this.loadAll();
    const idx = all.findIndex((a) => a.id === analysis.id);
    if (idx >= 0) {
      all[idx] = analysis;
    } else {
      all.unshift(analysis);
    }
    localStorage.setItem(KEY, JSON.stringify(all));
  },

  delete(id: string): void {
    const all = this.loadAll().filter((a) => a.id !== id);
    localStorage.setItem(KEY, JSON.stringify(all));
  },
};
