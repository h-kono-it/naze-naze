export type Weight = 'high' | 'medium' | 'low';
export type VerificationStatus = 'unreviewed' | 'ok' | 'gap';

export interface WhyNodeData {
  id: string;
  label: string;
  weight: Weight;
  skipped: boolean;
  parentId: string | null;
  note?: string;
}

export interface Analysis {
  id: string;
  name: string;
  nodes: WhyNodeData[];
  createdAt: string;
  updatedAt: string;
}

export interface VerifyState {
  pathIds: string[];       // leaf → root の順
  currentStep: number;     // 0-indexed: pathIds[step] → pathIds[step+1] の因果を検証中
  statuses: Record<string, VerificationStatus>; // key = `${causeId}→${effectId}`
}
