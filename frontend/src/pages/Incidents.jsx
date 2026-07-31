import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Badge from '../components/ui/Badge.jsx';
import {
    Search,
    MapPin,
    Calendar,
    AlertCircle,
    X,
    Car,
    Flame,
    Droplets,
    Users,
    Zap,
    Trees,
    Eye,
    Megaphone,
    Clock,
    CheckCircle2
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { incidentApi } from '../api/incidents.js';

const Incidents = () => {
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [, setError] = useState(null);

    const [selectedType, setSelectedType] = useState('All Types');
    const [selectedTimeRange, setSelectedTimeRange] = useState('Anytime');
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    const [votedIncidents, setVotedIncidents] = useState(() => {
        const saved = localStorage.getItem('voted_incidents');
        if (saved) {
            try {
                return new Set(JSON.parse(saved));
            } catch (e) {
                return new Set();
            }
        }
        return new Set();
    });

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await incidentApi.getIncidents();
            setIncidents(data.data || []);
        } catch (err) {
            console.error('Error fetching incidents:', err);
            setError('Failed to load incidents. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpvote = async (e, id) => {
        e.stopPropagation();

        if (votedIncidents.has(id)) {
            return;
        }

        try {
            const response = await incidentApi.upvoteIncident(id);

            if (response.success) {
                setVotedIncidents(prev => {
                    const newSet = new Set(prev).add(id);
                    localStorage.setItem('voted_incidents', JSON.stringify(Array.from(newSet)));
                    return newSet;
                });

                if (!response.message.includes('already')) {
                    const updatedIncident = response.data;

                    setIncidents(prev => prev.map(inc =>
                        inc.id === id ? updatedIncident : inc
                    ));

                    if (selectedIncident?.id === id) {
                        setSelectedIncident(updatedIncident);
                    }
                }
            }
        } catch (err) {
            console.error('Error upvoting:', err);
        }
    };

    const filterIncidents = () => {
        let filtered = [...incidents];

        if (selectedType !== 'All Types') {
            filtered = filtered.filter(inc => {
                const incType = (inc.incidentType || inc.type || '').toLowerCase();
                if (selectedType === 'Vehicle Accident') return incType.includes('accident') || incType.includes('vehicle') || incType.includes('crash');
                if (selectedType === 'Fire Outbreak') return incType.includes('fire');
                if (selectedType === 'Water Leak') return incType.includes('water') || incType.includes('flood') || incType.includes('leak');
                if (selectedType === 'Crowd Disturbance') return incType.includes('crowd') || incType.includes('disturbance') || incType.includes('protest');
                if (selectedType === 'Power Outage') return incType.includes('power') || incType.includes('outage') || incType.includes('electric');
                if (selectedType === 'Fallen Tree') return incType.includes('tree');
                if (selectedType === 'Suspicious Activity') return incType.includes('suspicious');
                return true;
            });
        }

        const now = new Date();
        if (selectedTimeRange === 'Last 24 Hours') {
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            filtered = filtered.filter(inc => new Date(inc.createdAt || inc.reportedAt) >= oneDayAgo);
        } else if (selectedTimeRange === 'Last 7 Days') {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(inc => new Date(inc.createdAt || inc.reportedAt) >= sevenDaysAgo);
        } else if (selectedTimeRange === 'Last 30 Days') {
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(inc => new Date(inc.createdAt || inc.reportedAt) >= thirtyDaysAgo);
        }

        if (activeTab === 'resolved') {
            filtered = filtered.filter(inc => inc.status === 'RESOLVED');
        } else {
            filtered = filtered.filter(inc => inc.status !== 'RESOLVED');
        }

        return filtered;
    };

    const filteredIncidentsList = filterIncidents();

    const activeCount = incidents.filter(inc => inc.status !== 'RESOLVED').length;
    const resolvedCount = incidents.filter(inc => inc.status === 'RESOLVED').length;

    const incidentTypes = [
        { label: 'Vehicle Accident', icon: Car },
        { label: 'Fire Outbreak', icon: Flame },
        { label: 'Water Leak', icon: Droplets },
        { label: 'Crowd Disturbance', icon: Users },
        { label: 'Route Hazard (Pothole)', icon: Megaphone },
        { label: 'Power Outage', icon: Zap },
        { label: 'Fallen Tree', icon: Trees },
        { label: 'Suspicious Activity', icon: Eye },
    ];

    const timeRanges = [
        'Anytime',
        'Last 24 Hours',
        'Last 7 Days',
        'Last 30 Days'
    ];

    const getIconForType = (type) => {
        const lowerType = (type || '').toLowerCase();
        if (lowerType.includes('vehicle') || lowerType.includes('accident')) return <Car className="w-4 h-4" />;
        if (lowerType.includes('fire')) return <Flame className="w-4 h-4" />;
        if (lowerType.includes('water') || lowerType.includes('leak')) return <Droplets className="w-4 h-4" />;
        if (lowerType.includes('crowd')) return <Users className="w-4 h-4" />;
        if (lowerType.includes('power')) return <Zap className="w-4 h-4" />;
        if (lowerType.includes('tree')) return <Trees className="w-4 h-4" />;
        if (lowerType.includes('suspicious')) return <Eye className="w-4 h-4" />;
        return <AlertCircle className="w-4 h-4 red" />;
    };

    const getTimeString = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans">
            <Navbar />

            <main className="flex-grow max-w-[1600px] mx-auto px-6 py-8 w-full">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
                        <div className="lg:hidden mb-4">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => setShowFilters(!showFilters)}
                                className="bg-white border text-gray-700"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {showFilters ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                                    {showFilters ? 'Hide Filters' : 'Show Filters & Search'}
                                </div>
                            </Button>
                        </div>

                        <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-6 sticky top-24`}>
                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-purple-600 font-bold bg-purple-50 inline-block px-3 py-1 rounded-lg mb-4 text-xs uppercase tracking-wider border border-purple-100">Incident Type</h3>
                                <button
                                    onClick={() => setSelectedType('All Types')}
                                    className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${selectedType === 'All Types' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    All Types
                                </button>
                                <div className="space-y-1">
                                    {incidentTypes.map((type) => (
                                        <button
                                            key={type.label}
                                            onClick={() => setSelectedType(type.label)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${selectedType === type.label ? 'bg-gray-100 text-gray-900 ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                        >
                                            <type.icon className="w-4 h-4" />
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-gray-900 font-bold mb-3 ml-1 text-sm">Time Range</h3>
                                <div className="space-y-1">
                                    {timeRanges.map((range) => (
                                        <button
                                            key={range}
                                            onClick={() => setSelectedTimeRange(range)}
                                            className={`w-full text-left px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${selectedTimeRange === range ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                <Link to="/map">
                                    <Button variant="secondary" fullWidth className="bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 py-3 h-auto rounded-xl">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        View on Map
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-grow w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">
                                    {activeTab === 'resolved' ? 'Resolved Incidents' : 'Live Incident Feed'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    {activeTab === 'resolved' ? 'Previously reported issues that have been addressed' : 'Real-time reports from the community'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Active ({activeCount})
                                </button>
                                <button
                                    onClick={() => setActiveTab('resolved')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'resolved' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Resolved ({resolvedCount})
                                </button>
                            </div>
                        </div>

                        <div className="flex-1">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6 h-64 animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                filteredIncidentsList.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
                                        {filteredIncidentsList.map((incident) => (
                                            <div
                                                key={incident.id}
                                                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer"
                                                onClick={() => setSelectedIncident(incident)}
                                            >
                                                <div className="relative w-full pt-[56.25%] overflow-hidden bg-gray-900">
                                                    <div className="absolute inset-0">
                                                        {incident.mediaUrl ? (
                                                            (incident.mediaUrl?.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                                                                <video
                                                                    src={incident.mediaUrl}
                                                                    className="w-full h-full object-cover"
                                                                    muted
                                                                    loop
                                                                    onMouseOver={e => e.currentTarget.play()}
                                                                    onMouseOut={e => e.currentTarget.pause()}
                                                                />
                                                            ) : (
                                                                <img
                                                                    src={incident.mediaUrl || incident.image}
                                                                    alt={incident.incidentType}
                                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                                />
                                                            )
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                                <AlertCircle className="w-10 h-10 text-gray-300" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-40% to-black/90"></div>
                                                    </div>

                                                    <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                                                                {getIconForType(incident.incidentType)}
                                                                <span className="font-bold text-sm">{incident.incidentType || 'Incident'}</span>
                                                            </div>
                                                            <Badge
                                                                label={incident.severity}
                                                                type="severity"
                                                                value={incident.severity}
                                                                className={`border-none shadow-sm ${incident.severity === 'HIGH' ? 'bg-red-500 text-white' : incident.severity === 'MEDIUM' ? 'bg-orange-500 text-white' : 'bg-gray-500/80 backdrop-blur-md text-white'}`}
                                                            />
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 text-xs font-medium text-white/90">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {getTimeString(incident.createdAt || incident.reportedAt)}
                                                                </span>
                                                                {incident.status === 'VERIFIED' && (
                                                                    <span className="flex items-center gap-1 bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded border border-green-500/30">
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        Verified
                                                                    </span>
                                                                )}
                                                                {incident.status === 'IN_PROGRESS' && (
                                                                    <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/30">
                                                                        <Clock className="w-3 h-3" />
                                                                        In Progress
                                                                    </span>
                                                                )}
                                                                {incident.status === 'RESOLVED' && (
                                                                    <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        Resolved
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div>
                                                                <p className="text-sm font-medium text-white line-clamp-1 mb-3 opacity-90">
                                                                    {incident.description}
                                                                </p>
                                                                <button
                                                                    onClick={(e) => handleUpvote(e, incident.id)}
                                                                    disabled={votedIncidents.has(incident.id)}
                                                                    className={`w-full font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-lg active:scale-95 ${votedIncidents.has(incident.id)
                                                                        ? 'bg-green-100 text-green-700 cursor-default'
                                                                        : 'bg-white hover:bg-gray-50 text-blue-600'
                                                                        }`}
                                                                >
                                                                    {votedIncidents.has(incident.id) ? (
                                                                        <>
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                            Confirmed ({incident.upvoteCount || 0})
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <div className="flex items-center gap-1">
                                                                                <span>Confirm / Upvote</span>
                                                                                <span className="bg-blue-100/50 text-blue-600 px-1.5 py-0.5 rounded text-xs ml-1">
                                                                                    {incident.upvoteCount || 0}
                                                                                </span>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <Search className="w-12 h-12 text-gray-300 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900">No matching incidents</h3>
                                        <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {selectedIncident && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                            <div
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
                                onClick={() => setSelectedIncident(null)}
                            />
                            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300">
                                {selectedIncident.mediaUrl && (
                                    <div className="w-full md:w-1/2 bg-gray-100 relative min-h-[300px] md:min-h-full flex items-center justify-center overflow-hidden">
                                        {selectedIncident.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                                            <video
                                                src={selectedIncident.mediaUrl}
                                                className="w-full h-full object-contain"
                                                controls
                                                autoPlay
                                            />
                                        ) : (
                                            <img
                                                src={selectedIncident.mediaUrl}
                                                alt={selectedIncident.incidentType}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedIncident(null)}
                                    className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition-colors z-10 backdrop-blur-sm shadow-sm"
                                >
                                    <X className="w-5 h-5 text-gray-900" />
                                </button>
                                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-full bg-white">
                                    <div className="mb-2">
                                        <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4 capitalize">
                                            {selectedIncident.incidentType.replace(/_/g, ' ').toLowerCase()}
                                        </h2>
                                        <p className="text-gray-600 text-base leading-relaxed mb-6">
                                            {selectedIncident.description}
                                        </p>
                                    </div>

                                    <div className="space-y-6 mb-8 flex-grow">
                                        <div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                                    <MapPin className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">Location</h4>
                                                    <p className="text-gray-500 text-sm mt-0.5">{selectedIncident.location}</p>
                                                    {(selectedIncident.latitude && selectedIncident.longitude) && (
                                                        <p className="text-gray-400 text-xs mt-1 font-mono bg-gray-50 inline-block px-1.5 py-0.5 rounded">
                                                            {selectedIncident.latitude.toFixed(6)}, {selectedIncident.longitude.toFixed(6)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg shrink-0">
                                                    <Calendar className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">Reported</h4>
                                                    <p className="text-gray-500 text-sm mt-0.5">
                                                        {new Date(selectedIncident.createdAt || selectedIncident.reportedAt).toLocaleString(undefined, {
                                                            dateStyle: 'long',
                                                            timeStyle: 'short'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto pt-6 border-t border-gray-100">
                                        <Link to={`/map?incidentId=${selectedIncident.id}`} className="w-full">
                                            <Button variant="secondary" fullWidth className="bg-white border-2 border-gray-100 hover:border-gray-200">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                View on Map
                                            </Button>
                                        </Link>
                                        <Button
                                            fullWidth
                                            onClick={(e) => handleUpvote(e, selectedIncident.id)}
                                            disabled={votedIncidents.has(selectedIncident.id)}
                                            className={votedIncidents.has(selectedIncident.id) ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                                        >
                                            {votedIncidents.has(selectedIncident.id) ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Confirmed ({selectedIncident.upvoteCount || 0})
                                                </>
                                            ) : (
                                                `Confirm Incident (${selectedIncident.upvoteCount || 0})`
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Incidents;
