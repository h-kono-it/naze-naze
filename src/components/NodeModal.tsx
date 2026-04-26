import { useState, useEffect } from 'react';
import type { Weight, WhyNodeData } from '../types';

interface Props {
  mode: 'add' | 'edit';
  initial?: WhyNodeData;
  parentLabel?: string;
  onSave: (data: Partial<WhyNodeData>) => void;
  onClose: () => void;
}

const WEIGHTS: { value: Weight; label: string; desc: string }[] = [
  { value: 'high', label: '高', desc: '主因として深掘り必須' },
  { value: 'medium', label: '中', desc: '関連性あり、要確認' },
  { value: 'low', label: '低', desc: '影響は小さい' },
];

export function NodeModal({ mode, initial, parentLabel, onSave, onClose }: Props) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [weight, setWeight] = useState<Weight>(initial?.weight ?? 'high');
  const [skipped, setSkipped] = useState(initial?.skipped ?? false);
  const [note, setNote] = useState(initial?.note ?? '');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = () => {
    if (!label.trim()) return;
    onSave({ label: label.trim(), weight, skipped, note: note.trim() || undefined });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-[440px] max-w-[95vw] p-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          {mode === 'add' ? '原因を追加' : 'ノードを編集'}
        </h2>

        {parentLabel && mode === 'add' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-500 mb-1">上位ノード</p>
            <p className="text-sm text-blue-800 font-medium">{parentLabel}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            原因・事象の内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={3}
            placeholder="例：オペレーターが手順書を確認しなかった"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-2">重み</label>
          <div className="flex gap-2">
            {WEIGHTS.map((w) => (
              <button
                key={w.value}
                onClick={() => setWeight(w.value)}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  weight === w.value
                    ? w.value === 'high'
                      ? 'bg-red-100 border-red-400 text-red-700'
                      : w.value === 'medium'
                        ? 'bg-amber-100 border-amber-400 text-amber-700'
                        : 'bg-green-100 border-green-400 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {w.label}
                <span className="block text-[10px] font-normal mt-0.5 opacity-70">{w.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1">メモ（任意）</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="根拠データや補足情報など"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 mb-5 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-gray-500"
            checked={skipped}
            onChange={(e) => setSkipped(e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            深掘りをスキップ（根本原因として扱う）
          </span>
        </label>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!label.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {mode === 'add' ? '追加' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
