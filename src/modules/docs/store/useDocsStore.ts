import { create } from "zustand";
import { ApiDocumentation } from "@/modules/ai/types";

interface GeneratedDoc {
  id: string;
  title: string;
  description: string;
  documentation: ApiDocumentation;
  metadata: {
    requestId: string;
    requestName: string;
    collectionName: string;
    workspaceName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  generatedAt: Date;
}

interface DocsStore {
  generatedDocs: GeneratedDoc[];
  addGeneratedDoc: (doc: Omit<GeneratedDoc, "id" | "generatedAt">) => string;
  removeGeneratedDoc: (id: string) => void;
  clearAllDocs: () => void;
  getDocById: (id: string) => GeneratedDoc | undefined;
}

export const useDocsStore = create<DocsStore>((set, get) => ({
  generatedDocs: [],

  addGeneratedDoc: (doc) => {
    const id = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDoc: GeneratedDoc = {
      ...doc,
      id,
      generatedAt: new Date(),
    };

    set((state) => ({
      generatedDocs: [newDoc, ...state.generatedDocs],
    }));

    return id;
  },

  removeGeneratedDoc: (id) => {
    set((state) => ({
      generatedDocs: state.generatedDocs.filter((doc) => doc.id !== id),
    }));
  },

  clearAllDocs: () => {
    set({ generatedDocs: [] });
  },

  getDocById: (id) => {
    return get().generatedDocs.find((doc) => doc.id === id);
  },
}));
