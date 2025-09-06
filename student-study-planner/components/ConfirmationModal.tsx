import React from 'react';
import Modal from './Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const primaryButtonStyles = "w-full px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200 text-sm";
  const secondaryButtonStyles = "w-full px-5 py-2.5 bg-surface-inset-light text-text-primary-light font-semibold rounded-lg hover:bg-border-light dark:bg-surface-inset-dark dark:text-text-primary-dark dark:hover:bg-border-dark transition-colors duration-200 text-sm";

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg font-semibold leading-6 text-text-primary-light dark:text-text-primary-dark">
            {title}
          </h3>
          <div className="mt-2">
            <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {message}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          className={secondaryButtonStyles}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={primaryButtonStyles}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
