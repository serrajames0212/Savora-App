import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
  return (
    <div
      style={{
        paddingTop: 0,
        paddingBottom: '80px',
        overflowY: 'auto',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      {children}
    </div>
  );
};

export default PageShell;
