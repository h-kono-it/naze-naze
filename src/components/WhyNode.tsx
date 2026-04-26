import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { Weight } from '../types';

const WEIGHT_STYLE: Record<Weight, { label: string; cls: string; edge: string }> = {
  high: { label: '高', cls: 'bg-red-100 text-red-700 border-red-300', edge: 'border-red-400' },
  medium: { label: '中', cls: 'bg-amber-100 text-amber-700 border-amber-300', edge: 'border-amber-400' },
  low: { label: '低', cls: 'bg-green-100 text-green-700 border-green-300', edge: 'border-green-400' },
};

export type WhyNodePayload = {
  id: string;
  label: string;
  weight: Weight;
  skipped: boolean;
  note?: string;
  isRoot: boolean;
  isLeaf: boolean;
  verifyHighlight: 'none' | 'path' | 'current';
  gapWarning: boolean;
  mode: 'edit' | 'verify';
  onAddChild: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStartVerify: (id: string) => void;
};

export type WhyNodeType = Node<WhyNodePayload, 'whyNode'>;

export const WhyNode = memo(function WhyNode({ data }: NodeProps<WhyNodeType>) {
  const wStyle = WEIGHT_STYLE[data.weight];

  const borderCls = data.isRoot
    ? 'border-blue-500'
    : data.verifyHighlight === 'current'
      ? 'border-orange-500 shadow-orange-200 shadow-lg'
      : data.verifyHighlight === 'path'
        ? 'border-orange-300'
        : data.gapWarning
          ? 'border-red-400 shadow-red-100 shadow-md'
          : data.skipped
            ? 'border-dashed border-gray-300'
            : wStyle.edge;

  const bgCls = data.verifyHighlight === 'current'
    ? 'bg-orange-50'
    : data.verifyHighlight === 'path'
      ? 'bg-orange-50/50'
      : 'bg-white';

  return (
    <div
      className={`
        relative rounded-xl border-2 p-3 w-[240px] shadow-sm transition-all
        ${borderCls} ${bgCls}
        ${data.skipped ? 'opacity-65' : ''}
        ${data.mode === 'edit' ? 'cursor-pointer hover:shadow-md' : ''}
      `}
      onClick={data.mode === 'edit' ? () => data.onEdit(data.id) : undefined}
    >
      {!data.isRoot && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2 !h-2 !bg-gray-400 !border-0"
        />
      )}

      <div className="flex items-center gap-1.5 mb-1.5">
        {data.isRoot ? (
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
            事象
          </span>
        ) : (
          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${wStyle.cls}`}>
            重み：{wStyle.label}
          </span>
        )}
        {data.skipped && (
          <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            スキップ
          </span>
        )}
        {data.verifyHighlight === 'current' && (
          <span className="text-[11px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded animate-pulse">
            検証中
          </span>
        )}
        {data.gapWarning && (
          <span className="text-[11px] text-red-600 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded">
            ⚠ 飛躍
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-gray-800 leading-snug min-h-[2.5rem] mb-2">
        {data.label}
      </p>

      {data.note && (
        <p className="text-xs text-gray-400 italic mb-2 leading-snug">{data.note}</p>
      )}

      {data.mode === 'edit' && (
        <div className="flex gap-1 flex-wrap">
          {!data.skipped && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onAddChild(data.id); }}
              className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              + なぜ
            </button>
          )}
          {!data.isRoot && (
            <button
              onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
              className="text-[11px] px-2 py-0.5 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
            >
              削除
            </button>
          )}
        </div>
      )}

      {data.mode === 'verify' && data.isLeaf && !data.isRoot && (
        <button
          onClick={(e) => { e.stopPropagation(); data.onStartVerify(data.id); }}
          className="text-[11px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded border border-orange-200 hover:bg-orange-100 transition-colors w-full text-center"
        >
          このパスを検証する
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-gray-400 !border-0"
      />
    </div>
  );
});
