import React, { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...rest }) => {
  const cursorClass = onClick ? 'cursor-pointer' : '';
  return (
    <div 
      className={`bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark transition-all duration-300 p-6 relative group shadow-sm hover:shadow-xl hover:shadow-primary-950/10 dark:hover:shadow-black/20 ${className} ${cursorClass}`}
      onClick={onClick}
      {...rest}
    >
       <div className="absolute -inset-px rounded-2xl border-2 border-transparent opacity-0 group-hover:opacity-100 group-hover:border-primary-400/50 transition-opacity duration-300 pointer-events-none" style={{
         background: 'radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(251, 113, 133, 0.15), transparent 40%)'
       }} />
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default Card;