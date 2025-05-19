import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  wrapperClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, type = 'text', className, wrapperClassName, ...props }) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                   focus:outline-none focus:ring-primary focus:border-primary 
                   sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                   disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400
                   ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'} 
                   ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
