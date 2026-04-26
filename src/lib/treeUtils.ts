import type { WhyNodeData } from '../types';

export function getDescendantIds(nodes: WhyNodeData[], id: string): string[] {
  const children = nodes.filter((n) => n.parentId === id);
  return children.flatMap((c) => [c.id, ...getDescendantIds(nodes, c.id)]);
}

export function getLeafIds(nodes: WhyNodeData[]): Set<string> {
  const hasChildren = new Set(
    nodes.filter((n) => n.parentId !== null).map((n) => n.parentId!)
  );
  return new Set(nodes.filter((n) => !hasChildren.has(n.id)).map((n) => n.id));
}

export function getPathToRoot(nodes: WhyNodeData[], leafId: string): string[] {
  const map = new Map(nodes.map((n) => [n.id, n]));
  const path: string[] = [];
  let cur = map.get(leafId);
  while (cur) {
    path.push(cur.id);
    if (cur.parentId === null) break;
    cur = map.get(cur.parentId);
  }
  return path; // [leafId, ..., rootId]
}

export function stepKey(causeId: string, effectId: string): string {
  return `${causeId}→${effectId}`;
}
