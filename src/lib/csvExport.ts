import type { Analysis } from '../types';
import { getPathToRoot, getLeafIds } from './treeUtils';

const WEIGHT_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' };

export function exportToCSV(analysis: Analysis): void {
  const leafIds = getLeafIds(analysis.nodes);
  const nodeMap = new Map(analysis.nodes.map((n) => [n.id, n]));

  // 根→葉の順でパスを構築（ルートのみのツリーは除外）
  const paths = Array.from(leafIds)
    .filter((id) => nodeMap.get(id)?.parentId !== null)
    .map((leafId) =>
      getPathToRoot(analysis.nodes, leafId)
        .reverse()
        .map((id) => nodeMap.get(id)!)
    );

  if (paths.length === 0) return;

  const maxDepth = Math.max(...paths.map((p) => p.length));

  // ヘッダー行
  const depthHeaders = Array.from({ length: maxDepth }, (_, i) =>
    i === 0 ? '事象（根）' : `なぜ${i}`
  );
  const headers = ['パス', ...depthHeaders, '根本原因の重み'];

  const rows = paths.map((path, i) => {
    const labels = path.map((n) => (n.skipped ? `${n.label}（スキップ）` : n.label));
    const padded = [...labels, ...Array(maxDepth - path.length).fill('')];

    const leaf = path[path.length - 1];
    const weight = leaf.parentId !== null ? WEIGHT_LABEL[leaf.weight] : '';

    return [`パス${i + 1}`, ...padded, weight];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  // BOM付きUTF-8にするとExcelで文字化けしない
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${analysis.name}_なぜなぜ分析.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
