import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full space-y-1.5">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                className={`
          block w-full px-4 py-2 text-gray-900 placeholder-gray-400 bg-white border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
          ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
        </div>
    );
};

export default Input;
