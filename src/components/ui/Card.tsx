import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, footer }) => {
  return (
    <div className={`bg-dark-light rounded-xl shadow-lg overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-dark-lighter">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
      )}
      
      <div className="p-4">{children}</div>
      
      {footer && (
        <div className="px-4 py-3 border-t border-dark-lighter bg-dark/30">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;