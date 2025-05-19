import React, { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: ReactNode; // For <option> elements
  error?: string;
  wrapperClassName?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  children,
  error,
  className,
  wrapperClassName,
  ...props
}) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={id}
        name={id}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${error ? 'border-red-500 dark:border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Select;
