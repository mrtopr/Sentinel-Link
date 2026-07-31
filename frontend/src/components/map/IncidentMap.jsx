import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { incidentApi } from '../../api/incidents.js';
import IncidentMarker from './IncidentMarker.jsx';
import MapFilters from './MapFilters.jsx';
import { Loader2, Navigation } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

const RecenterMap = ({ lat, lng, zoom = 13 }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], zoom);
    }, [lat, lng, zoom, map]);
    return null;
};

const AutoFitBounds = ({ incidents, disabled }) => {
    const map = useMap();

    useEffect(() => {
        if (!disabled && incidents.length > 0) {
            const group = new L.FeatureGroup(
                incidents
                    .filter(i => i.latitude && i.longitude)
                    .map(i => L.marker([Number(i.latitude), Number(i.longitude)]))
            );
            const bounds = group.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [incidents, map, disabled]);

    return null;
};

const IncidentMap = () => {
    const [incidents, setIncidents] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        radius: 50,
        severity: ['HIGH', 'MEDIUM', 'LOW'],
        type: 'ALL'
    });
    const [socketConnected, setSocketConnected] = useState(false);
    const [searchParams] = useSearchParams();
    const highlightId = searchParams.get('incidentId');

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await incidentApi.getIncidents();
                setIncidents(response.data || []);
            } catch (error) {
                console.error('Failed to load incidents:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!highlightId && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Location access denied, using default center', error);
                }
            );
        }

        loadData();
    }, [highlightId]);

    useEffect(() => {
        if (highlightId && incidents.length > 0) {
            const targetedIncident = incidents.find(i => i.id === highlightId);
            if (targetedIncident && targetedIncident.latitude && targetedIncident.longitude) {
                setMapCenter({
                    lat: targetedIncident.latitude,
                    lng: targetedIncident.longitude,
                    zoom: 16
                });
            }
        }
    }, [highlightId, incidents]);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_BASE_URL
            ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
            : 'http://localhost:3000';

        const socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log('Connected to socket server');
            setSocketConnected(true);
        });

        socket.on('incident:new', (newIncident) => {
            const incident = newIncident.data || newIncident;
            console.log('New Incident received:', incident);
            setIncidents((prev) => [incident, ...prev]);
        });

        socket.on('incident:update', (updatedIncident) => {
            const incident = updatedIncident.data || updatedIncident;
            console.log('Incident update received:', incident);
            setIncidents((prev) =>
                prev.map((inc) => inc.id === incident.id ? incident : inc)
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const filteredIncidents = useMemo(() => {
        return incidents.filter((incident) => {
            if (highlightId && incident.id === highlightId) {
                return true;
            }

            if (incident.status === 'RESOLVED') {
                return false;
            }

            if (filters.type !== 'ALL' && incident.incidentType !== filters.type && incident.type !== filters.type) {
                return false;
            }

            if (!filters.severity.includes(incident.severity)) {
                return false;
            }

            if (userLocation) {
                const dist = getDistanceFromLatLonInKm(
                    userLocation.lat,
                    userLocation.lng,
                    incident.latitude,
                    incident.longitude
                );
                if (dist > filters.radius) {
                    return false;
                }
            }

            return true;
        });
    }, [incidents, filters, userLocation, highlightId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium">Initializing Map System...</p>
            </div>
        );
    }

    const centerLat = mapCenter?.lat || userLocation?.lat || DEFAULT_CENTER.lat;
    const centerLng = mapCenter?.lng || userLocation?.lng || DEFAULT_CENTER.lng;
    const initialZoom = mapCenter?.zoom || 13;

    return (
        <div className="relative h-full w-full bg-gray-100 overflow-hidden">
            <MapFilters filters={filters} onChange={setFilters} />

            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-gray-100 flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-bold text-gray-700">
                    {socketConnected ? 'LIVE FEED ACTIVE' : 'CONNECTING...'}
                </span>
            </div>

            <MapContainer
                center={[centerLat, centerLng]}
                zoom={initialZoom}
                className="w-full h-full z-0"
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredIncidents.map((incident) => (
                    incident.latitude && incident.longitude ? (
                        <IncidentMarker
                            key={incident.id}
                            incident={incident}
                            isHighlighted={highlightId === incident.id}
                        />
                    ) : null
                ))}

                {filteredIncidents.length > 0 && !highlightId && !mapCenter && <AutoFitBounds incidents={filteredIncidents} disabled={!!highlightId} />}

                {(mapCenter || userLocation) && (
                    <RecenterMap
                        lat={mapCenter?.lat || userLocation?.lat || DEFAULT_CENTER.lat}
                        lng={mapCenter?.lng || userLocation?.lng || DEFAULT_CENTER.lng}
                        zoom={mapCenter?.zoom || 13}
                    />
                )}
            </MapContainer>

            {userLocation && (
                <button
                    onClick={() => {
                        setMapCenter(null);
                    }}
                    className="absolute bottom-6 right-6 z-[1000] p-3 bg-white rounded-full shadow-xl hover:bg-gray-50 transition-colors"
                >
                    <Navigation className="w-6 h-6 text-primary" />
                </button>
            )}
        </div>
    );
};

export default IncidentMap;
