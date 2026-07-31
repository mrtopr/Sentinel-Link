import React from 'react';

const Badge = ({ label, type = 'type', value, className = '' }) => {
    const getStyles = () => {
        if (type === 'severity') {
            switch (value) {
                case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
                case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
                case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
                case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
                default: return 'bg-gray-100 text-gray-700 border-gray-200';
            }
        }

        if (type === 'status') {
            switch (value) {
                case 'OPEN': return 'text-orange-500 bg-orange-50/50 border-orange-100';
                case 'IN_PROGRESS': return 'text-primary bg-primary/5 border-primary-light/20';
                case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-100';
                case 'CLOSED': return 'text-gray-500 bg-gray-50 border-gray-100';
                default: return 'bg-gray-100 text-gray-700 border-gray-200';
            }
        }

        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyles()} ${className}`}>
            {label}
        </span>
    );
};

export default Badge;
