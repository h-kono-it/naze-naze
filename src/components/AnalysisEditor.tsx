import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Analysis, WhyNodeData, VerifyState, VerificationStatus } from '../types';
import { storage } from '../lib/storage';
import { applyDagreLayout } from '../lib/layout';
import { getDescendantIds, getLeafIds, getPathToRoot, stepKey } from '../lib/treeUtils';
import { exportToCSV } from '../lib/csvExport';
import { WhyNode, type WhyNodePayload } from './WhyNode';
import { NodeModal } from './NodeModal';
import { VerificationPanel } from './VerificationPanel';

const nodeTypes = { whyNode: WhyNode };

interface ModalState {
  open: boolean;
  mode: 'add' | 'edit';
  parentId?: string;
  nodeId?: string;
}

interface Props {
  analysis: Analysis;
  onBack: () => void;
}

export function AnalysisEditor({ analysis: initialAnalysis, onBack }: Props) {
  const [analysis, setAnalysis] = useState<Analysis>(initialAnalysis);
  const [editorMode, setEditorMode] = useState<'edit' | 'verify'>('edit');
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add' });
  const [verifyState, setVerifyState] = useState<VerifyState | null>(null);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node<WhyNodePayload>>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const leafIds = useMemo(() => getLeafIds(analysis.nodes), [analysis.nodes]);

  const buildRFElements = useCallback(() => {
    const pathSet = new Set(verifyState?.pathIds ?? []);
    const currentId = verifyState ? verifyState.pathIds[verifyState.currentStep] : null;

    // editモードでもgap状態を保持して表示する
    const gapKeys = new Set(
      Object.entries(verifyState?.statuses ?? {})
        .filter(([, v]) => v === 'gap')
        .map(([k]) => k)
    );

    const nodes: Node<WhyNodePayload>[] = analysis.nodes.map((n) => ({
      id: n.id,
      type: 'whyNode' as const,
      position: { x: 0, y: 0 },
      data: {
        ...n,
        isRoot: n.parentId === null,
        isLeaf: leafIds.has(n.id),
        verifyHighlight: editorMode === 'verify' && pathSet.has(n.id)
          ? n.id === currentId
            ? 'current'
            : 'path'
          : 'none',
        gapWarning: editorMode === 'edit' && n.parentId !== null && gapKeys.has(stepKey(n.id, n.parentId)),
        mode: editorMode,
        onAddChild: (id: string) => setModal({ open: true, mode: 'add', parentId: id }),
        onEdit: (id: string) => setModal({ open: true, mode: 'edit', nodeId: id }),
        onDelete: handleDeleteNode,
        onStartVerify: handleStartVerify,
      },
    }));

    const edges: Edge[] = analysis.nodes
      .filter((n) => n.parentId !== null)
      .map((n) => {
        const isGap = editorMode === 'edit' && gapKeys.has(stepKey(n.id, n.parentId!));
        const isPath = editorMode === 'verify' && pathSet.has(n.id) && pathSet.has(n.parentId!);
        return {
          id: `${n.parentId}-${n.id}`,
          source: n.parentId!,
          target: n.id,
          style: {
            stroke: isGap ? '#ef4444' : isPath ? '#f97316' : '#cbd5e1',
            strokeWidth: isGap ? 2.5 : isPath ? 3 : 1.5,
            strokeDasharray: isGap ? '6 3' : undefined,
          },
        };
      });

    const laidOut = applyDagreLayout(nodes, edges) as Node<WhyNodePayload>[];
    setRfNodes(laidOut);
    setRfEdges(edges);
  }, [analysis.nodes, editorMode, verifyState, leafIds]);

  useEffect(() => {
    buildRFElements();
  }, [buildRFElements]);

  useEffect(() => {
    const updated = { ...analysis, updatedAt: new Date().toISOString() };
    storage.save(updated);
  }, [analysis]);

  const handleDeleteNode = useCallback((id: string) => {
    setAnalysis((prev) => {
      const toRemove = new Set([id, ...getDescendantIds(prev.nodes, id)]);
      return { ...prev, nodes: prev.nodes.filter((n) => !toRemove.has(n.id)) };
    });
    setVerifyState(null);
  }, []);

  const handleStartVerify = useCallback((leafId: string) => {
    setAnalysis((prev) => {
      const path = getPathToRoot(prev.nodes, leafId);
      setVerifyState({ pathIds: path, currentStep: 0, statuses: {} });
      return prev;
    });
  }, []);

  const handleSaveNode = (data: Partial<WhyNodeData>) => {
    if (modal.mode === 'add' && modal.parentId !== undefined) {
      const newNode: WhyNodeData = {
        id: crypto.randomUUID(),
        label: data.label!,
        weight: data.weight ?? 'high',
        skipped: data.skipped ?? false,
        parentId: modal.parentId,
        note: data.note,
      };
      setAnalysis((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    } else if (modal.mode === 'edit' && modal.nodeId) {
      setAnalysis((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === modal.nodeId ? { ...n, ...data } : n
        ),
      }));
    }
    setVerifyState(null);
  };

  const handleModeSwitch = (mode: 'edit' | 'verify') => {
    setEditorMode(mode);
    if (mode === 'verify') setVerifyState(null);
  };

  const handleVerifyStatusUpdate = (key: string, status: VerificationStatus) => {
    setVerifyState((prev) =>
      prev ? { ...prev, statuses: { ...prev.statuses, [key]: status } } : null
    );
  };

  const handleVerifyStepChange = (step: number) => {
    setVerifyState((prev) => (prev ? { ...prev, currentStep: step } : null));
  };

  const modalNode = modal.nodeId ? analysis.nodes.find((n) => n.id === modal.nodeId) : undefined;
  const parentNode = modal.parentId ? analysis.nodes.find((n) => n.id === modal.parentId) : undefined;

  const hasLeaves = analysis.nodes.some((n) => leafIds.has(n.id) && n.parentId !== null);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* トップバー */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          ← 戻る
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-800 truncate">{analysis.name}</h1>
          <p className="text-[11px] text-gray-400">
            {analysis.nodes.length} ノード
            ·
            更新 {new Date(analysis.updatedAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <button
          onClick={() => exportToCSV(analysis)}
          disabled={analysis.nodes.length <= 1}
          className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          CSV出力
        </button>

        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => handleModeSwitch('edit')}
            className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
              editorMode === 'edit'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            編集
          </button>
          <button
            onClick={() => handleModeSwitch('verify')}
            disabled={!hasLeaves}
            className={`px-3 py-1.5 text-sm rounded-md transition-all font-medium ${
              editorMode === 'verify'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            因果検証
          </button>
        </div>
      </div>

      {/* キャンバス + パネル */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          {editorMode === 'verify' && !verifyState && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-orange-100 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm font-semibold text-gray-700">葉ノードの「このパスを検証する」をクリック</p>
                <p className="text-xs text-gray-400 mt-1">根本原因から事象まで因果をたどります</p>
              </div>
            </div>
          )}

          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 0.85 }}
            minZoom={0.2}
            maxZoom={2}
          >
            <Background color="#e2e8f0" gap={24} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(n) => {
                const d = n.data as WhyNodePayload;
                if (d.isRoot) return '#3b82f6';
                if (d.verifyHighlight === 'current') return '#f97316';
                if (d.verifyHighlight === 'path') return '#fdba74';
                if (d.skipped) return '#d1d5db';
                return d.weight === 'high' ? '#fca5a5' : d.weight === 'medium' ? '#fcd34d' : '#86efac';
              }}
              maskColor="rgba(248,249,250,0.7)"
            />
          </ReactFlow>
        </div>

        {editorMode === 'verify' && verifyState && (
          <VerificationPanel
            analysis={analysis}
            verifyState={verifyState}
            onUpdateStatus={handleVerifyStatusUpdate}
            onStepChange={handleVerifyStepChange}
            onClose={() => handleModeSwitch('edit')}
          />
        )}
      </div>

      {modal.open && (
        <NodeModal
          mode={modal.mode}
          initial={modalNode}
          parentLabel={parentNode?.label}
          onSave={handleSaveNode}
          onClose={() => setModal({ open: false, mode: 'add' })}
        />
      )}
    </div>
  );
}
