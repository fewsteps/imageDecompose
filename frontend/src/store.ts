import { create } from 'zustand'
import type { CanvasObject } from './types'

interface AppState {
  objects: CanvasObject[]
  selectedObjectId: string | null
  addObject: (obj: CanvasObject) => void
  updateObjectPosition: (id: string, x: number, y: number) => void
  updateObjectSize: (id: string, width: number, height: number) => void
  removeObject: (id: string) => void
  selectObject: (id: string | null) => void
  clearCanvas: () => void
}

export const useStore = create<AppState>((set) => ({
  objects: [],
  selectedObjectId: null,

  addObject: (obj) =>
    set((state) => ({
      objects: [...state.objects, obj],
      selectedObjectId: obj.id, // Auto-select newly added objects
    })),

  updateObjectPosition: (id, x, y) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, x, y } : obj
      ),
    })),

  updateObjectSize: (id, width, height) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, width, height } : obj
      ),
    })),

  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    })),

  selectObject: (id) =>
    set(() => ({
      selectedObjectId: id,
    })),

  clearCanvas: () =>
    set(() => ({
      objects: [],
      selectedObjectId: null,
    })),
}))
