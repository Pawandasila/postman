import { create } from "zustand";

interface HistoryEntry {
  id: string;
  requestName: string;
  method: string;
  url: string;
  workspaceName: string;
  collectionName?: string;
  statusCode?: number;
  statusText?: string;
  responseTime?: number;
  executedAt: Date;
}

interface HistoryStore {
  shouldRefetch: boolean;
  triggerRefetch: () => void;
  resetRefetch: () => void;
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  shouldRefetch: false,
  triggerRefetch: () => set({ shouldRefetch: true }),
  resetRefetch: () => set({ shouldRefetch: false }),
}));
