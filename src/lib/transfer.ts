import type { Analysis } from '../types';

export function exportToJSON(analysis: Analysis): void {
  const json = JSON.stringify(analysis, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${analysis.name}_なぜなぜ分析.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const VALID_WEIGHTS = new Set(['high', 'medium', 'low']);

function isValidNode(n: unknown): boolean {
  if (!n || typeof n !== 'object') return false;
  const node = n as Record<string, unknown>;
  return (
    typeof node.id === 'string' && node.id.length > 0 &&
    typeof node.label === 'string' &&
    VALID_WEIGHTS.has(node.weight as string) &&
    typeof node.skipped === 'boolean' &&
    (node.parentId === null || typeof node.parentId === 'string')
  );
}

function hasCycle(nodes: { id: string; parentId: string | null }[]): boolean {
  const parentMap = new Map(nodes.map((n) => [n.id, n.parentId]));
  for (const node of nodes) {
    const visited = new Set<string>();
    let cur: string | null = node.id;
    while (cur !== null) {
      if (visited.has(cur)) return true;
      visited.add(cur);
      cur = parentMap.get(cur) ?? null;
    }
  }
  return false;
}

function isValidAnalysis(data: unknown): data is Analysis {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (
    typeof d.id !== 'string' ||
    typeof d.name !== 'string' ||
    !Array.isArray(d.nodes) ||
    typeof d.createdAt !== 'string' ||
    typeof d.updatedAt !== 'string'
  ) return false;

  if (!d.nodes.every(isValidNode)) return false;

  const nodes = d.nodes as { id: string; parentId: string | null }[];

  // IDの重複チェック
  const ids = new Set(nodes.map((n) => n.id));
  if (ids.size !== nodes.length) return false;

  // parentId が存在しないIDを参照していないかチェック
  for (const node of nodes) {
    if (node.parentId !== null && !ids.has(node.parentId)) return false;
  }

  // 循環参照チェック
  if (hasCycle(nodes)) return false;

  return true;
}

export function importFromJSON(file: File): Promise<Analysis> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!isValidAnalysis(parsed)) {
          reject(new Error('有効ななぜなぜ分析ファイルではありません'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('JSONの読み込みに失敗しました'));
      }
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });
}
