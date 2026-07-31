import React, { useState, useRef, useEffect } from 'react';
import { INCIDENT_TYPES, HELPLINE_NUMBERS } from '../constants/incidents.js';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Button from '../components/ui/Button.jsx';
import { Camera, MapPin, Navigation, Send, AlertTriangle, CheckCircle2, Phone } from 'lucide-react';
import { incidentApi } from '../api/incidents.js';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPickerMap = ({ position, onLocationSelect }) => {
    const map = useMap();

    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (position) {
            map.setView([position.lat, position.lng], map.getZoom());
        }
    }, [position, map]);

    return position ? <Marker position={[position.lat, position.lng]} /> : null;
};

const ReportIncident = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [markerPosition, setMarkerPosition] = useState(null);

    const [formData, setFormData] = useState({
        type: '',
        severity: 'Medium',
        location: '',
        description: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleDetectLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData(prev => ({ ...prev, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
                    setMarkerPosition({ lat: latitude, lng: longitude });
                    setShowMap(true);
                    setIsLocating(false);
                },
                (err) => {
                    console.error('Location error:', err);
                    const defaultLat = 37.7749;
                    const defaultLng = -122.4194;
                    setFormData(prev => ({ ...prev, location: `${defaultLat}, ${defaultLng} (Manual)` }));
                    setMarkerPosition({ lat: defaultLat, lng: defaultLng });
                    setIsLocating(false);
                }
            );
        } else {
            setIsLocating(false);
        }
    };

    const handleLocationSelect = (lat, lng) => {
        setMarkerPosition({ lat, lng });
        setFormData(prev => ({ ...prev, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.type || !formData.location || !formData.description) {
            setError('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const data = new FormData();

            data.append('incidentType', formData.type);
            data.append('severity', formData.severity.toUpperCase());
            data.append('description', formData.description);
            data.append('location', formData.location);

            const [lat, lng] = formData.location.split(',').map(s => s.trim());
            if (lat && lng) {
                data.append('latitude', lat);
                data.append('longitude', lng);
            } else {
                throw new Error('Invalid location format. Please use "Lat, Lng".');
            }

            if (selectedFile) {
                data.append('media', selectedFile);
            }

            await incidentApi.createIncident(data);
            setIsSuccess(true);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const helpline = HELPLINE_NUMBERS[formData.type] || HELPLINE_NUMBERS['OTHER'];

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl border border-gray-100 max-w-lg w-full text-center space-y-6 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Report Submitted!</h1>
                            <p className="text-gray-500 font-medium text-sm">Thank you for helping keep the community safe.</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-center gap-2 text-blue-700">
                                <Phone className="w-5 h-5" />
                                <span className="font-bold text-sm uppercase tracking-wide">Emergency Helpline</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-900 font-bold text-lg">{helpline.name}</p>
                                <p className="text-gray-500 text-xs">{helpline.description}</p>
                            </div>
                            <a
                                href={`tel:${helpline.number}`}
                                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/25"
                            >
                                <Phone className="w-6 h-6" />
                                {helpline.number}
                            </a>
                        </div>

                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => navigate('/incidents')}
                            className="mt-4"
                        >
                            View Live Incidents
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
            <Navbar />

            <main className="flex-grow py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="bg-primary px-8 py-10 text-white relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
                            <div className="relative z-10 space-y-2">
                                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Urgent Platform
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight">Report an Incident</h1>
                                <p className="text-primary-light/80 text-sm max-w-md">
                                    Provide detailed information to help citizens and authorities coordinate efficiently.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="mx-8 mt-8 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form className="p-6 md:p-12 space-y-8" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                            Incident Type
                                        </label>
                                        <select
                                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none text-gray-700 cursor-pointer"
                                            value={formData.type}
                                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select an option...</option>
                                            {INCIDENT_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                            Severity Level
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Low', 'Medium', 'High'].map((level) => (
                                                <button
                                                    type="button"
                                                    key={level}
                                                    onClick={() => setFormData(prev => ({ ...prev, severity: level }))}
                                                    className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${formData.severity === level
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                                        }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                            Incident Media
                                        </label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="group relative h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                                        >
                                            {previewUrl ? (
                                                selectedFile?.type.startsWith('video/') ? (
                                                    <video
                                                        src={previewUrl}
                                                        className="w-full h-full object-cover"
                                                        controls
                                                    />
                                                ) : (
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                )
                                            ) : (
                                                <>
                                                    <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                                        <Camera className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <p className="mt-3 text-sm font-medium text-gray-500">Click to upload photo or video</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Max 10MB • JPG, PNG, MP4</p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept="image/*,video/*"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Location
                                </label>
                                <div className="space-y-3">
                                    <div className="flex flex-col md:flex-row gap-2">
                                        <div className="relative flex-grow">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Enter location or drop a pin"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                value={formData.location}
                                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="flex-1 md:flex-none md:w-32 h-[50px] bg-white border border-gray-200 justify-center"
                                                onClick={() => setShowMap(!showMap)}
                                            >
                                                {showMap ? 'Hide Map' : 'Pick on Map'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="flex-1 md:flex-none px-4 h-[50px] bg-white border border-gray-200 justify-center"
                                                onClick={handleDetectLocation}
                                                isLoading={isLocating}
                                            >
                                                {!isLocating && <Navigation className="w-5 h-5" />}
                                                {isLocating && <span className="ml-2 md:hidden">Locating...</span>}
                                            </Button>
                                        </div>
                                    </div>

                                    {showMap && (
                                        <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner relative z-0">
                                            <MapContainer
                                                center={markerPosition ? [markerPosition.lat, markerPosition.lng] : [28.6139, 77.2090]}
                                                zoom={13}
                                                style={{ height: '100%', width: '100%' }}
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <LocationPickerMap position={markerPosition} onLocationSelect={handleLocationSelect} />
                                            </MapContainer>
                                            <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded-md text-[10px] z-[1000] font-bold text-gray-500 pointer-events-none">
                                                Click map to set location
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                                    Detailed Description
                                </label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                                    placeholder="Tell us more about the incident..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    size="lg"
                                    className="w-full md:w-auto px-12 py-4 h-auto shadow-lg shadow-primary/30 disabled:opacity-70 justify-center"
                                    isLoading={isSubmitting}
                                >
                                    <Send className="w-5 h-5 mr-2" />
                                    Submit Report
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ReportIncident;
