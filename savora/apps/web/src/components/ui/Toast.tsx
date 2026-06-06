import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../stores/useToastStore';
import type { ToastVariant } from '../../stores/useToastStore';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const variantStyles: Record<ToastVariant, React.CSSProperties> = {
  success: {
    backgroundColor: 'rgba(20, 50, 30, 0.95)',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    color: 'rgba(134, 239, 172, 1)',
  },
  error: {
    backgroundColor: 'rgba(50, 20, 20, 0.95)',
    border: '1px solid rgba(252, 165, 165, 0.3)',
    color: 'rgba(252, 165, 165, 1)',
  },
  info: {
    backgroundColor: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border-medium)',
    color: 'var(--color-text-secondary)',
  },
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckIcon />,
  error: <XIcon />,
  info: <InfoIcon />,
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              ...variantStyles[toast.variant],
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: 500,
              backdropFilter: 'blur(8px)',
              boxShadow: 'var(--shadow-elevated)',
              minWidth: '220px',
              maxWidth: '360px',
              pointerEvents: 'auto',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span style={{ flexShrink: 0 }}>{variantIcons[toast.variant]}</span>
            <span style={{ flex: 1 }}>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
