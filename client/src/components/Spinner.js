import React from 'react';

const Spinner = ({ fullPage = false, text = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '16px',
          color: 'var(--clr-text-500)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        <div className="spinner" />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
      <span>{text}</span>
    </div>
  );
};

export default Spinner;
