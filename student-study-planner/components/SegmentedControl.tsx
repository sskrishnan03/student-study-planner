import React from 'react';

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

const SegmentedControl = <T extends string>({ options, value, onChange }: SegmentedControlProps<T>) => {
  return (
    <div className="flex items-center p-1 rounded-lg bg-surface-inset-light dark:bg-surface-inset-dark space-x-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors duration-300 relative ${
            value === option.value
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-white/60 dark:hover:bg-black/10'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;