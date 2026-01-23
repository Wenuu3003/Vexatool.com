import { useState, useCallback } from 'react';
import { AnyElement, PageInfo, HistoryState } from './types';

const MAX_HISTORY = 50;

export const useEditorHistory = (
  elements: AnyElement[],
  pages: PageInfo[],
  setElements: (elements: AnyElement[]) => void,
  setPages: (pages: PageInfo[]) => void
) => {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  const saveToHistory = useCallback(() => {
    if (isUndoRedo) {
      setIsUndoRedo(false);
      return;
    }

    const newState: HistoryState = {
      elements: JSON.parse(JSON.stringify(elements)),
      pages: pages.map(p => ({ ...p, canvas: undefined })),
    };

    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      
      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        return newHistory.slice(-MAX_HISTORY);
      }
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [elements, pages, historyIndex, isUndoRedo]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    
    setIsUndoRedo(true);
    const prevState = history[historyIndex - 1];
    if (prevState) {
      setElements(prevState.elements);
      // Restore page rotations but keep canvas references
      setPages(pages.map((p, i) => ({
        ...p,
        rotation: prevState.pages[i]?.rotation ?? p.rotation,
        deleted: prevState.pages[i]?.deleted ?? p.deleted,
      })));
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, pages, setElements, setPages]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    
    setIsUndoRedo(true);
    const nextState = history[historyIndex + 1];
    if (nextState) {
      setElements(nextState.elements);
      setPages(pages.map((p, i) => ({
        ...p,
        rotation: nextState.pages[i]?.rotation ?? p.rotation,
        deleted: nextState.pages[i]?.deleted ?? p.deleted,
      })));
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex, pages, setElements, setPages]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const resetHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  };
};
