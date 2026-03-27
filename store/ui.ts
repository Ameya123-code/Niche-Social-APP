import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

export type EditorTab = 'avatar' | 'banner' | 'theme' | 'bio' | 'decorations' | 'card';

type UIState = {
  editorTab: EditorTab;
  editorOpen: boolean;
  previewMode: boolean;
};

type UIActions = {
  setEditorTab: (tab: EditorTab) => void;
  openEditor: (tab?: EditorTab) => void;
  closeEditor: () => void;
  setPreviewMode: (on: boolean) => void;
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const useUIStore = create<UIState & UIActions>()((set) => ({
  editorTab: 'avatar',
  editorOpen: false,
  previewMode: false,

  setEditorTab: (tab) => set({ editorTab: tab }),

  openEditor: (tab = 'avatar') => set({ editorOpen: true, editorTab: tab }),

  closeEditor: () => set({ editorOpen: false }),

  setPreviewMode: (on) => set({ previewMode: on }),
}));
