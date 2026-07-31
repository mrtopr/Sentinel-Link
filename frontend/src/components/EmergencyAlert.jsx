import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AlertTriangle, X } from 'lucide-react';

const EmergencyAlert = () => {
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000');

        socket.on('emergency:broadcast', (data) => {
            setMessage(data.message);
            setTimeout(() => setMessage(null), 30000);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (!message) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-500">
            <div className="bg-red-600 text-white shadow-2xl">
                <div className="container-custom py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 p-2 rounded-lg animate-pulse">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase tracking-wider mb-1">Emergency Broadcast</h3>
                            <p className="font-medium text-white/90 leading-relaxed text-lg">
                                {message}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setMessage(null)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmergencyAlert;
