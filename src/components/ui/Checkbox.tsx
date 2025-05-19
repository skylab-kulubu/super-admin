import React, { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  id: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, error, className, ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-center">
        <input
          id={id}
          name={id}
          type="checkbox"
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 dark:border-gray-600 rounded"
          {...props}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Checkbox;
