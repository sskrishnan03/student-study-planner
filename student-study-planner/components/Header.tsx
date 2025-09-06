import React from 'react';
import AIIcon from './AIIcon';

interface HeaderProps {
    onOpenChatbot: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenChatbot }) => {
    const today = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <header className="flex-shrink-0 flex items-center justify-between p-4 bg-surface-light/80 dark:bg-surface-dark/60 backdrop-blur-lg border-b border-border-light dark:border-border-dark h-[73px]">
            <div>
                <h1 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">Welcome Back!</h1>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{today}</p>
            </div>
            <button 
                onClick={onOpenChatbot}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5"
            >
                <AIIcon className="h-5 w-5" />
                <span>Ask AI</span>
            </button>
        </header>
    );
};

export default Header;