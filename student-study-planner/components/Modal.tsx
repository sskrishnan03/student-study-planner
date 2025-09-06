import React, { ReactNode, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;
  
  const sizeClasses: Record<string, string> = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl'
  };

  const modalSize = sizeClasses[size] || sizeClasses['md'];

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
    >
      <div 
        className={`bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl w-full flex flex-col ${modalSize} animate-scale-in border border-border-light dark:border-border-dark`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 pt-5 pb-4 flex-shrink-0 border-b border-border-light dark:border-border-dark">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-text-muted-light dark:text-text-muted-dark hover:bg-surface-inset-light dark:hover:bg-surface-inset-dark transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6 pt-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;