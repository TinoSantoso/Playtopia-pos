import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'orange' | 'pink' | 'purple' | 'green';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  variant = 'pink',
  text = 'Loading...',
  fullScreen = false,
  className = ''
}) => {
  const getDotSize = () => {
    switch (size) {
      case 'sm': return '8px';
      case 'lg': return '16px';
      default: return '12px';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'small';
      case 'lg': return 'h5';
      default: return '';
    }
  };

  const getColor = () => {
    switch (variant) {
      case 'pink': return '#ff6b9d';
      case 'purple': return '#9b59b6';
      case 'green': return '#2ecc71';
      case 'orange': 
      default: return '#ff9500';
    }
  };

  const dotStyle = {
    width: getDotSize(),
    height: getDotSize(),
    backgroundColor: getColor(),
    borderRadius: '50%',
    display: 'inline-block',
    margin: '0 4px'
  };

  const content = (
    <div className={`d-flex flex-column align-items-center justify-content-center ${className}`}>
      <style>
        {`
          @keyframes sequentialScale {
            0%, 66.67%, 100% {
              transform: scale(0.3);
              opacity: 0.3;
            }
            33.33% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .dot-1 { animation: sequentialScale 1.5s infinite; animation-delay: 0s; }
          .dot-2 { animation: sequentialScale 1.5s infinite; animation-delay: 0.5s; }
          .dot-3 { animation: sequentialScale 1.5s infinite; animation-delay: 1s; }
        `}
      </style>
      <div className="mb-3">
        <div style={{...dotStyle}} className="dot-1"></div>
        <div style={{...dotStyle}} className="dot-2"></div>
        <div style={{...dotStyle}} className="dot-3"></div>
      </div>
      {text && (
        <div className={`${getTextSize()}`} style={{ color: getColor(), fontWeight: '600' }}>
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          zIndex: 9999,
          backdropFilter: 'blur(2px)'
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingIndicator;
