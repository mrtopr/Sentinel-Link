import React, { useState, useEffect } from 'react';
import { Filter, Activity } from 'lucide-react';
import { INCIDENT_TYPES, INCIDENT_TYPE_ICONS } from '../../constants/incidents.js';

const MapFilters = ({ filters, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (window.innerWidth >= 768) {
            setIsOpen(true);
        }
    }, []);

    const handleRadiusChange = (e) => {
        onChange({ ...filters, radius: parseInt(e.target.value) });
    };

    const handleSeverityToggle = (level) => {
        const current = filters.severity;
        const next = current.includes(level)
            ? current.filter(l => l !== level)
            : [...current, level];
        onChange({ ...filters, severity: next });
    };

    const handleTypeChange = (type) => {
        onChange({ ...filters, type });
    };

    return (
        <div
            className={`absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 ease-in-out scrollbar-hide ${isOpen ? 'w-72 max-h-[80vh] p-4 overflow-y-auto' : 'w-12 h-12 p-0 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-50'
                }`}
        >
            <div className={`flex items-center justify-between ${isOpen ? 'mb-4 border-b border-gray-100 pb-2' : ''}`}>
                {isOpen && (
                    <div className="flex items-center gap-2 text-gray-800">
                        <Filter className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm uppercase tracking-wider">Filters</h3>
                    </div>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className={`text-gray-500 hover:text-primary transition-colors ${!isOpen ? 'w-full h-full flex items-center justify-center' : ''}`}
                >
                    <Filter className={isOpen ? "w-4 h-4" : "w-5 h-5"} />
                </button>
            </div>

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-gray-500">Radius</label>
                            <span className="text-xs font-bold text-primary">{filters.radius} km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={filters.radius}
                            onChange={handleRadiusChange}
                            className="w-full text-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>1km</span>
                            <span>50km</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="text-xs font-bold text-gray-500 block mb-3">Severity</label>
                        <div className="flex flex-wrap gap-2">
                            {['HIGH', 'MEDIUM', 'LOW'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => handleSeverityToggle(level)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filters.severity.includes(level)
                                        ? level === 'HIGH' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm'
                                            : level === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 shadow-sm'
                                                : 'bg-green-50 text-green-600 border-green-200 shadow-sm'
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 block mb-3">Incident Type</label>
                        <div className="space-y-1">
                            <button
                                key="ALL"
                                onClick={() => handleTypeChange('ALL')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${filters.type === 'ALL'
                                    ? 'bg-primary/5 text-primary font-bold'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Activity className="w-4 h-4" />
                                All Incidents
                            </button>
                            {INCIDENT_TYPES.map((type) => {
                                const Icon = INCIDENT_TYPE_ICONS[type.value];
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => handleTypeChange(type.value)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${filters.type === type.value
                                            ? 'bg-primary/5 text-primary font-bold'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapFilters;
