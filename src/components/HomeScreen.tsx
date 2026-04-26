import { useState } from 'react';
import type { Analysis, WhyNodeData } from '../types';
import { storage } from '../lib/storage';

interface Props {
  analyses: Analysis[];
  onSelect: (analysis: Analysis) => void;
  onRefresh: () => void;
}

export function HomeScreen({ analyses, onSelect, onRefresh }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEvent, setNewEvent] = useState('');

  const handleCreate = () => {
    if (!newName.trim() || !newEvent.trim()) return;

    const rootNode: WhyNodeData = {
      id: crypto.randomUUID(),
      label: newEvent.trim(),
      weight: 'high',
      skipped: false,
      parentId: null,
    };

    const analysis: Analysis = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      nodes: [rootNode],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.save(analysis);
    onRefresh();
    setCreating(false);
    setNewName('');
    setNewEvent('');
    onSelect(analysis);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('この分析を削除しますか？')) return;
    storage.delete(id);
    onRefresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">なぜなぜ分析</h1>
          <p className="text-sm text-gray-500 mt-1">根本原因を体系的に掘り下げるためのツール</p>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
          データはお使いのブラウザのローカルストレージにのみ保存されます。他のユーザーや他のデバイスとは共有されません。ブラウザのデータを削除すると分析も失われますのでご注意ください。
        </div>

        {creating ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-700 mb-4">新規分析を作成</h2>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                分析名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="例：2026-04-25 本番障害"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                発生した事象 <span className="text-red-400">*</span>
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                rows={3}
                placeholder="例：本番環境でAPIサーバーが5分間ダウンした"
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setCreating(false); setNewName(''); setNewEvent(''); }}
                className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || !newEvent.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                作成して開く
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="w-full py-3 mb-6 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
          >
            + 新規分析を作成
          </button>
        )}

        {analyses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">分析はまだありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {analyses.map((a) => {
              const nodeCount = a.nodes.length;
              const depthCount = Math.max(...a.nodes.map((n) => {
                let d = 0;
                let cur = n;
                const map = new Map(a.nodes.map((x) => [x.id, x]));
                while (cur.parentId) {
                  d++;
                  cur = map.get(cur.parentId) ?? cur;
                }
                return d;
              }));

              return (
                <div
                  key={a.id}
                  onClick={() => onSelect(a)}
                  className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                        {a.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {a.nodes[0]?.label}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(a.id, e)}
                      className="ml-3 text-gray-300 hover:text-red-400 transition-colors text-sm p-1 rounded opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <span className="text-[11px] text-gray-400">
                      ノード {nodeCount}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      深さ {depthCount}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-auto">
                      {new Date(a.updatedAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
