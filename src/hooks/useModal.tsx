import { useState } from 'react'
import Modal from '../components/Modal'

interface ModalOptions {
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  showCancel?: boolean
}

export function useModal() {
  const [modalState, setModalState] = useState<ModalOptions & { isOpen: boolean }>({
    isOpen: false,
    message: ''
  })

  const showModal = (options: ModalOptions) => {
    setModalState({
      ...options,
      isOpen: true
    })
  }

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  const showSuccess = (message: string, title?: string) => {
    showModal({ message, title, type: 'success' })
  }

  const showError = (message: string, title?: string) => {
    showModal({ message, title, type: 'error' })
  }

  const showWarning = (message: string, title?: string) => {
    showModal({ message, title, type: 'warning' })
  }

  const showInfo = (message: string, title?: string) => {
    showModal({ message, title, type: 'info' })
  }

  const showConfirm = (message: string, onConfirm: () => void, title?: string) => {
    showModal({
      message,
      title,
      type: 'warning',
      showCancel: true,
      onConfirm
    })
  }

  const ModalComponent = () => (
    <Modal
      isOpen={modalState.isOpen}
      onClose={hideModal}
      title={modalState.title}
      message={modalState.message}
      type={modalState.type}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
      onConfirm={modalState.onConfirm}
      showCancel={modalState.showCancel}
    />
  )

  return {
    Modal: ModalComponent,
    showModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    hideModal
  }
}