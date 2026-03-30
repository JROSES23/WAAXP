'use client'

/**
 * Modal Store — Context global para rastrear si hay algún modal/drawer abierto.
 * Usa un contador en lugar de booleano para soportar múltiples overlays anidados:
 * cada apertura suma 1, cada cierre resta 1.
 * El bottom nav lee `isModalOpen` para ocultarse automáticamente.
 */

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

interface ModalStoreContextValue {
  /** true cuando al menos un modal o drawer está abierto */
  isModalOpen: boolean
  /** Llamar al abrir cualquier modal/drawer */
  openModal: () => void
  /** Llamar al cerrar cualquier modal/drawer */
  closeModal: () => void
}

const ModalStoreContext = createContext<ModalStoreContextValue>({
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
})

export function ModalStoreProvider({ children }: { children: ReactNode }) {
  // Contador de overlays activos — soporta stacking (modal dentro de modal)
  const [openCount, setOpenCount] = useState(0)

  const openModal  = useCallback(() => setOpenCount((c) => c + 1), [])
  const closeModal = useCallback(() => setOpenCount((c) => Math.max(0, c - 1)), [])

  return (
    <ModalStoreContext.Provider value={{ isModalOpen: openCount > 0, openModal, closeModal }}>
      {children}
    </ModalStoreContext.Provider>
  )
}

/** Hook para leer/controlar el estado global de modales */
export function useModalStore() {
  return useContext(ModalStoreContext)
}
