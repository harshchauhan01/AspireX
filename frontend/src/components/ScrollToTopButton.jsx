import React, { useState, useEffect } from 'react';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className="scroll-to-top-btn"
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 9999,
        display: visible ? 'block' : 'none',
        background: 'linear-gradient(90deg, #2196f3, #1565c0)',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        boxShadow: '0 2px 12px rgba(33,150,243,0.18)',
        cursor: 'pointer',
        fontSize: '1.7rem',
        transition: 'opacity 0.2s',
      }}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton; 