import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 50,
            }}
          />
          {/* Desktop: centered modal */}
          <motion.div
            className="hidden md:flex"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 51,
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-medium)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-elevated)',
              padding: 'var(--space-8)',
              minWidth: '420px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {title && (
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                {title}
              </h2>
            )}
            {children}
          </motion.div>
          {/* Mobile: bottom sheet */}
          <motion.div
            className="flex md:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 51,
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-medium)',
              borderTopLeftRadius: 'var(--radius-xl)',
              borderTopRightRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-elevated)',
              padding: 'var(--space-8)',
              paddingBottom: 'calc(var(--space-8) + env(safe-area-inset-bottom))',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '4px',
                backgroundColor: 'var(--color-border-medium)',
                borderRadius: '2px',
                margin: '0 auto var(--space-6)',
              }}
            />
            {title && (
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
