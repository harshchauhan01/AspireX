import React from 'react';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#fff',
  borderRadius: '16px',
  maxWidth: '500px',
  width: '90%',
  padding: '32px 24px 24px 24px',
  boxShadow: '0 8px 32px rgba(16,137,211,0.10), 0 1.5px 6px rgba(16,137,211,0.08)',
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '12px',
  right: '16px',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#1089d3',
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <button style={closeButtonStyle} onClick={onClose} aria-label="Close">×</button>
        {title && <h2 style={{marginTop:0, marginBottom:'18px', color:'#1089d3'}}>{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal; 