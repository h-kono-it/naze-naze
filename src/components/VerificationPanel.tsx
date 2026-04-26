import type { Analysis, VerifyState, VerificationStatus } from '../types';
import { stepKey } from '../lib/treeUtils';

interface Props {
  analysis: Analysis;
  verifyState: VerifyState;
  onUpdateStatus: (key: string, status: VerificationStatus) => void;
  onStepChange: (step: number) => void;
  onClose: () => void;
}

const STATUS_STYLE: Record<VerificationStatus, { label: string; cls: string }> = {
  unreviewed: { label: '未確認', cls: 'bg-gray-100 text-gray-500' },
  ok: { label: 'OK', cls: 'bg-green-100 text-green-700' },
  gap: { label: '飛躍あり', cls: 'bg-red-100 text-red-600' },
};

export function VerificationPanel({ analysis, verifyState, onUpdateStatus, onStepChange, onClose }: Props) {
  const nodeMap = new Map(analysis.nodes.map((n) => [n.id, n]));
  const { pathIds, currentStep, statuses } = verifyState;

  const totalSteps = pathIds.length - 1;
  const isFinished = currentStep >= totalSteps;

  const causeId = pathIds[currentStep];
  const effectId = pathIds[currentStep + 1];
  const causeLabel = nodeMap.get(causeId)?.label ?? '';
  const effectLabel = nodeMap.get(effectId)?.label ?? '';
  const currentKey = causeId && effectId ? stepKey(causeId, effectId) : '';
  const currentStatus = statuses[currentKey] ?? 'unreviewed';

  const allStatuses = Array.from({ length: totalSteps }, (_, i) => {
    const cId = pathIds[i];
    const eId = pathIds[i + 1];
    const key = stepKey(cId, eId);
    return { key, status: statuses[key] ?? 'unreviewed', cLabel: nodeMap.get(cId)?.label ?? '', eLabel: nodeMap.get(eId)?.label ?? '' };
  });

  const reviewedCount = allStatuses.filter((s) => s.status !== 'unreviewed').length;
  const hasGap = allStatuses.some((s) => s.status === 'gap');

  const markAndNext = (status: VerificationStatus) => {
    onUpdateStatus(currentKey, status);
    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1);
    } else {
      onStepChange(totalSteps);
    }
  };

  return (
    <div className="w-[360px] bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-gray-800">因果検証モード</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {reviewedCount} / {totalSteps} ステップ確認済み
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!isFinished ? (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  ステップ {currentStep + 1} / {totalSteps}
                </span>
              </div>

              <div className="bg-gradient-to-b from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                <div className="flex flex-col gap-2">
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <p className="text-[10px] text-orange-500 font-semibold mb-1">原因</p>
                    <p className="text-sm font-medium text-gray-800 leading-snug">{causeLabel}</p>
                  </div>
                  <div className="text-center text-orange-400 text-lg">↓</div>
                  <div className="bg-white rounded-lg p-3 border border-amber-200">
                    <p className="text-[10px] text-amber-500 font-semibold mb-1">結果</p>
                    <p className="text-sm font-medium text-gray-800 leading-snug">{effectLabel}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-orange-200">
                  <p className="text-[11px] text-gray-500 mb-1">因果文</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    「<span className="font-semibold text-orange-700">{causeLabel}</span>」だったから、
                    「<span className="font-semibold text-amber-700">{effectLabel}</span>」となった。
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">この因果関係は成立しますか？</p>
              <div className="flex gap-2">
                <button
                  onClick={() => markAndNext('ok')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    currentStatus === 'ok'
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  ✓ 成立する
                </button>
                <button
                  onClick={() => markAndNext('gap')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    currentStatus === 'gap'
                      ? 'bg-red-100 border-red-400 text-red-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  ⚠ 飛躍あり
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onStepChange(currentStep - 1)}
                disabled={currentStep === 0}
                className="flex-1 py-2 text-sm text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← 前のステップ
              </button>
              <button
                onClick={() => onStepChange(currentStep + 1)}
                disabled={currentStep >= totalSteps - 1}
                className="flex-1 py-2 text-sm text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                次のステップ →
              </button>
            </div>
          </>
        ) : (
          <div className="py-4">
            <div className={`rounded-xl p-4 mb-4 ${hasGap ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm font-bold mb-1 ${hasGap ? 'text-red-700' : 'text-green-700'}`}>
                {hasGap ? '⚠ 飛躍が検出されました' : '✓ 因果チェーン成立'}
              </p>
              <p className="text-xs text-gray-600">
                {hasGap
                  ? 'マークした箇所の論理的つながりを見直してください。'
                  : 'すべてのステップで因果関係が確認できました。'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">全ステップ一覧</p>
          <div className="space-y-1.5">
            {allStatuses.map((s, i) => {
              const st = STATUS_STYLE[s.status];
              return (
                <button
                  key={s.key}
                  onClick={() => onStepChange(i)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors ${
                    i === currentStep && !isFinished
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-gray-400">ステップ {i + 1}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-gray-700 truncate">{s.cLabel} → {s.eLabel}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isFinished && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => onStepChange(0)}
            className="w-full py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
          >
            最初から見直す
          </button>
        </div>
      )}
    </div>
  );
}
