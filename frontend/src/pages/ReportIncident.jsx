import React, { useState, useRef, useEffect } from 'react';
import { INCIDENT_TYPES, INCIDENT_TYPE_LABELS, HELPLINE_NUMBERS } from '../constants/incidents.js';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Button from '../components/ui/Button.jsx';
import { Camera, MapPin, Navigation, Send, AlertTriangle, CheckCircle2, Phone, Sparkles, Zap } from 'lucide-react';
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

const createCheckpointIcon = () => {
    return L.divIcon({
        className: 'checkpoint-marker-container',
        html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto; cursor: grab;">
                <!-- Animated Target Pulse at exact tip -->
                <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 32px; height: 32px; background: rgba(239, 68, 68, 0.4); border-radius: 50%; animation: checkpointPulse 1.6s infinite ease-out;"></div>
                <div style="position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: #dc2626; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>

                <!-- Sleek Checkpoint Symbol Pin -->
                <div style="position: relative; width: 38px; height: 38px; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #ffffff; box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5), 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
                    <!-- Checkpoint Symbol (Crosshair Target) -->
                    <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="3" fill="#ffffff" />
                            <line x1="12" y1="1" x2="12" y2="5" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="1" y1="12" x2="5" y2="12" />
                            <line x1="19" y1="12" x2="23" y2="12" />
                        </svg>
                    </div>
                </div>
            </div>
            <style>
                @keyframes checkpointPulse {
                    0% { transform: translateX(-50%) scale(0.3); opacity: 1; }
                    100% { transform: translateX(-50%) scale(2.2); opacity: 0; }
                }
            </style>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });
};

const LocationPickerMap = ({ position, onLocationSelect }) => {
    const map = useMap();
    const markerRef = useRef(null);

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

    const eventHandlers = React.useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const latLng = marker.getLatLng();
                    onLocationSelect(latLng.lat, latLng.lng);
                }
            },
        }),
        [onLocationSelect]
    );

    const checkpointIcon = React.useMemo(() => createCheckpointIcon(), []);

    return position ? (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[position.lat, position.lng]}
            ref={markerRef}
            icon={checkpointIcon}
        />
    ) : null;
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (err) => reject(err);
    });
};

const CATEGORY_MAP = {
    FIRE: 'FIRE',
    FLAME: 'FIRE',
    SMOKE: 'FIRE',
    EXPLOSION: 'FIRE',

    MEDICAL: 'MEDICAL',
    AMBULANCE: 'MEDICAL',
    INJURY: 'MEDICAL',
    HEALTH: 'MEDICAL',

    ACCIDENT: 'ACCIDENT',
    CAR: 'ACCIDENT',
    COLLISION: 'ACCIDENT',
    VEHICLE: 'ACCIDENT',
    CRASH: 'ACCIDENT',

    FLOOD: 'FLOOD',
    FLOODING: 'FLOOD',
    WATER: 'FLOOD',
    SUBMERGED: 'FLOOD',
    WATERLOGGING: 'FLOOD',

    PUBLIC_DISTURBANCE: 'PUBLIC_DISTURBANCE',
    CROWD: 'PUBLIC_DISTURBANCE',
    PROTEST: 'PUBLIC_DISTURBANCE',
    RIOT: 'PUBLIC_DISTURBANCE',

    INFRASTRUCTURE: 'INFRASTRUCTURE',
    ROUTE_HAZARD: 'INFRASTRUCTURE',
    ROAD_HAZARD: 'INFRASTRUCTURE',
    HAZARD: 'INFRASTRUCTURE',
    BUILDING_DAMAGE: 'INFRASTRUCTURE',

    POWER_OUTAGE: 'POWER_OUTAGE',
    ELECTRIC: 'POWER_OUTAGE',
    BLACKOUT: 'POWER_OUTAGE',
    OUTAGE: 'POWER_OUTAGE',

    NATURAL_DISASTER: 'NATURAL_DISASTER',
    EARTHQUAKE: 'NATURAL_DISASTER',
    LANDSLIDE: 'NATURAL_DISASTER',
    STORM: 'NATURAL_DISASTER',
    CYCLONE: 'NATURAL_DISASTER',
    TSUNAMI: 'NATURAL_DISASTER',

    SUSPICIOUS: 'SUSPICIOUS',
    SECURITY: 'SUSPICIOUS',
    THEFT: 'SUSPICIOUS',

    OTHER: 'OTHER'
};

const normalizeCategory = (rawCategory) => {
    if (!rawCategory) return 'OTHER';
    const upper = rawCategory.toString().toUpperCase().trim().replace(/[\s-]/g, '_');
    if (CATEGORY_MAP[upper]) return CATEGORY_MAP[upper];

    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
        if (upper.includes(key) || key.includes(upper)) {
            return val;
        }
    }
    return 'OTHER';
};

const analyzeMediaWithGemini = async (file) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('Gemini API Key is missing. Please configure VITE_GEMINI_API_KEY in your frontend environment.');
    }

    const base64Data = await fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';

    const promptText = `Analyze this emergency incident photo or video for an emergency reporting platform.
Categorize the incident accurately based strictly on what is visually present in the image.

Select the "value" field from EXACTLY ONE of these permitted keys:
- "FIRE": Fire outbreak, flames, explosion, heavy smoke
- "MEDICAL": Medical emergency, injured person, health emergency
- "ACCIDENT": Vehicle accident, car/truck collision, traffic crash
- "FLOOD": Water leakage, flooding, heavy waterlogging, submerged roads/houses
- "PUBLIC_DISTURBANCE": Crowd disturbance, protest, riot, mob
- "INFRASTRUCTURE": Damaged road, fallen tree, broken bridge, building damage/collapse
- "POWER_OUTAGE": Power grid outage, fallen electrical wires/poles, electrical sparks
- "NATURAL_DISASTER": Landslide, earthquake, cyclone, extreme weather disaster
- "SUSPICIOUS": Suspicious activity, crime, security threat
- "OTHER": Any incident not fitting above categories

Return ONLY a valid raw JSON object (no markdown formatting, no code block backticks):
{
  "value": "FLOOD",
  "severity": "High",
  "confidence": 95,
  "tags": ["Tag1", "Tag2"],
  "summary": "Specific detailed 1-2 sentence description of what is visually visible in this photo.",
  "safetyMeasures": "Specific 1-2 sentence actionable safety advice for nearby citizens."
}`;

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    const errors = [];

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: promptText },
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Data
                                    }
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1
                    }
                })
            });

            if (res.ok) {
                const data = await res.json();
                const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanJson);

                    const categoryValue = normalizeCategory(parsed.value);
                    const categoryLabel = INCIDENT_TYPE_LABELS[categoryValue] || 'Incident Detected';

                    const fullDescription = `${parsed.summary || 'Visual analysis completed.'}\n\n⚠️ Safety Advisory: ${parsed.safetyMeasures || 'Maintain safe distance.'}`;

                    return {
                        value: categoryValue,
                        label: categoryLabel,
                        severity: parsed.severity || 'Medium',
                        confidence: parsed.confidence || 95,
                        tags: parsed.tags || ['Gemini AI Vision'],
                        summary: parsed.summary,
                        safetyMeasures: parsed.safetyMeasures,
                        suggestedDescription: fullDescription
                    };
                }
            } else {
                const errData = await res.json().catch(() => ({}));
                const errMsg = errData?.error?.message || `HTTP ${res.status} on ${model}`;
                console.warn(`Gemini model ${model} failed:`, errMsg);
                errors.push(`${model}: ${errMsg}`);
            }
        } catch (err) {
            console.warn(`Failed call to Gemini model ${model}:`, err);
            errors.push(`${model}: ${err.message}`);
        }
    }

    throw new Error(errors[0] || 'Gemini AI Vision analysis failed.');
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

    const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
    const [isAutoFilled, setIsAutoFilled] = useState(false);

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

    const handleAutoFillForm = (result = aiAnalysisResult) => {
        if (!result) return;

        // Populate Category, Severity, and Description with Summary & Safety Measures.
        // NOTE: Location is intentionally UNTOUCHED (user sets physical location manually).
        setFormData(prev => ({
            ...prev,
            type: result.value,
            severity: result.severity,
            description: result.suggestedDescription
                ? result.suggestedDescription
                : `${result.summary || 'Incident reported.'}\n\n⚠️ Safety Advisory: ${result.safetyMeasures || 'Exercise caution near the area.'}`
        }));

        setIsAutoFilled(true);
        setTimeout(() => setIsAutoFilled(false), 3000);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // Run Gemini Vision Media Analysis
            setIsAnalyzingAi(true);
            setAiAnalysisResult(null);
            setError(null);

            try {
                const result = await analyzeMediaWithGemini(file);
                setAiAnalysisResult(result);
                setIsAnalyzingAi(false);

                // Auto-fill Category, Severity & Description (Location remains untouched)
                handleAutoFillForm(result);
            } catch (err) {
                console.error('Gemini AI Vision analysis error:', err);
                setIsAnalyzingAi(false);
                setError(`Gemini AI Vision detection failed: ${err.message || 'Unable to process image'}`);
            }
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

            <main className="flex-grow py-8 md:py-12 px-4 bg-gray-50/50">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 rounded-3xl shadow-xl overflow-hidden text-white p-6 md:p-10 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="relative z-10 space-y-3">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase text-white shadow-xs">
                                <AlertTriangle className="w-4 h-4 text-yellow-300 animate-pulse" />
                                Real-Time Incident Reporting
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Report an Incident</h1>
                            <p className="text-white/90 text-sm md:text-base max-w-xl font-medium leading-relaxed">
                                Upload photos or videos for instant <strong className="text-yellow-300">Gemini AI Vision</strong> categorization, or manually submit emergency incident details to alert citizens and responders.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-xs">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Section 1: Media Upload & Gemini AI Vision Card */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-primary" />
                                    Step 1 • Media & Gemini AI Vision
                                </h2>
                                {aiAnalysisResult && (
                                    <span className="text-[11px] font-extrabold bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> AI Analyzed
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Media Uploader (5 cols) */}
                                <div className="lg:col-span-5 space-y-2">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="group relative h-52 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50/80 hover:bg-gray-100/80 hover:border-primary transition-all cursor-pointer overflow-hidden shadow-2xs"
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
                                            <div className="text-center p-4">
                                                <div className="w-12 h-12 bg-white text-primary rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Camera className="w-6 h-6" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-700">Click to upload media</p>
                                                <p className="text-[11px] text-gray-400 mt-1 font-semibold">JPG, PNG, MP4 (Max 10MB)</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*,video/*"
                                        />
                                    </div>
                                    <p className="text-[11px] font-semibold text-gray-400 text-center">
                                        📷 Uploading media automatically triggers Gemini AI Vision
                                    </p>
                                </div>

                                {/* AI Intelligence Result Card (7 cols) */}
                                <div className="lg:col-span-7 h-full">
                                    {isAnalyzingAi && (
                                        <div className="h-52 bg-purple-50/80 border-2 border-dashed border-purple-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                                            <Sparkles className="w-8 h-8 text-purple-600 animate-spin" />
                                            <div>
                                                <p className="text-sm font-black text-purple-900">Gemini AI Vision Analyzing Media...</p>
                                                <p className="text-xs text-purple-600 font-medium">Extracting incident category, severity & safety advisory...</p>
                                            </div>
                                        </div>
                                    )}

                                    {!aiAnalysisResult && !isAnalyzingAi && (
                                        <div className="h-52 bg-gray-50/60 border border-gray-200/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2">
                                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-700">AI Assistant Standby</p>
                                            <p className="text-[11px] text-gray-400 max-w-xs font-medium">
                                                Upload an incident photo or video to auto-categorize and generate safety advisories via Gemini AI.
                                            </p>
                                        </div>
                                    )}

                                    {aiAnalysisResult && !isAnalyzingAi && (
                                        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200/80 rounded-2xl p-4 space-y-3 shadow-sm animate-in fade-in duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-purple-600 text-white p-1 rounded-md shadow-xs">
                                                        <Sparkles className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-extrabold text-xs uppercase tracking-wider text-purple-900">
                                                        Gemini AI Vision Analysis
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-black bg-purple-200 text-purple-800 px-2.5 py-0.5 rounded-full">
                                                    {aiAnalysisResult.confidence}% Confidence
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-gray-800">
                                                <span className="bg-white px-3 py-1 rounded-lg border border-purple-100 text-purple-900 shadow-2xs">
                                                    Category: <strong className="text-purple-700">{aiAnalysisResult.label}</strong>
                                                </span>
                                                <span className="bg-white px-3 py-1 rounded-lg border border-purple-100 text-purple-900 shadow-2xs">
                                                    Suggested Severity: <strong className={aiAnalysisResult.severity === 'High' ? 'text-red-600' : 'text-amber-600'}>{aiAnalysisResult.severity}</strong>
                                                </span>
                                            </div>

                                            {aiAnalysisResult.summary && (
                                                <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100 text-xs space-y-0.5">
                                                    <p className="font-bold text-gray-900">Visual Summary:</p>
                                                    <p className="text-gray-600 font-medium leading-relaxed">{aiAnalysisResult.summary}</p>
                                                </div>
                                            )}

                                            {aiAnalysisResult.safetyMeasures && (
                                                <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-200/70 text-xs space-y-0.5">
                                                    <p className="font-bold text-amber-900 flex items-center gap-1">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                                        Nearby Safety Advisory:
                                                    </p>
                                                    <p className="text-amber-900 font-medium leading-relaxed">{aiAnalysisResult.safetyMeasures}</p>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleAutoFillForm(aiAnalysisResult)}
                                                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${isAutoFilled
                                                        ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/20'
                                                    }`}
                                            >
                                                {isAutoFilled ? (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                                                        <span>✓ Category & Description Auto-Filled!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="w-4 h-4 text-yellow-300 fill-current animate-pulse" />
                                                        <span>⚡ One-Tap Auto-Fill Category & Description</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Category & Severity Level */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                Step 2 • Classification
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                            Incident Type <span className="text-red-500">*</span>
                                        </label>
                                        {aiAnalysisResult && formData.type === aiAnalysisResult.value && (
                                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" /> AI Populated
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        className="block w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-semibold text-gray-800 cursor-pointer"
                                        value={formData.type}
                                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                        required
                                    >
                                        <option value="">Select Category...</option>
                                        {INCIDENT_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Severity Level
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { level: 'Low', color: 'border-blue-500 bg-blue-50 text-blue-700' },
                                            { level: 'Medium', color: 'border-amber-500 bg-amber-50 text-amber-700' },
                                            { level: 'High', color: 'border-red-500 bg-red-50 text-red-700' }
                                        ].map(({ level, color }) => (
                                            <button
                                                type="button"
                                                key={level}
                                                onClick={() => setFormData(prev => ({ ...prev, severity: level }))}
                                                className={`py-3 px-3 rounded-xl border-2 text-xs font-extrabold transition-all ${formData.severity === level
                                                        ? `${color} shadow-xs`
                                                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Location & Checkpoint Map */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Step 3 • Incident Location
                                </h2>
                                <span className="text-[11px] font-bold text-gray-400">
                                    Set via GPS or Map Pin
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative flex-grow">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Enter location address or coordinates..."
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-semibold text-gray-800"
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="flex-1 md:flex-none px-4 h-[50px] bg-white border border-gray-200 justify-center text-xs font-bold"
                                            onClick={() => {
                                                const nextShow = !showMap;
                                                setShowMap(nextShow);
                                                if (nextShow && !markerPosition) {
                                                    const [latStr, lngStr] = (formData.location || '').split(',').map(s => parseFloat(s.trim()));
                                                    const defaultLat = !isNaN(latStr) ? latStr : 37.7749;
                                                    const defaultLng = !isNaN(lngStr) ? lngStr : -122.4194;
                                                    setMarkerPosition({ lat: defaultLat, lng: defaultLng });
                                                    setFormData(prev => ({ ...prev, location: `${defaultLat.toFixed(4)}, ${defaultLng.toFixed(4)}` }));
                                                }
                                            }}
                                        >
                                            {showMap ? 'Hide Map' : '🗺️ Pick on Map'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="flex-1 md:flex-none px-4 h-[50px] bg-white border border-gray-200 justify-center text-xs font-bold"
                                            onClick={handleDetectLocation}
                                            isLoading={isLocating}
                                        >
                                            {!isLocating && <Navigation className="w-4 h-4 mr-1.5 text-primary" />}
                                            📍 Detect Location
                                        </Button>
                                    </div>
                                </div>

                                {showMap && (
                                    <div className="h-72 w-full rounded-2xl overflow-hidden border-2 border-gray-200 shadow-inner relative z-0 animate-in zoom-in-95 duration-200">
                                        <MapContainer
                                            center={markerPosition ? [markerPosition.lat, markerPosition.lng] : [37.7749, -122.4194]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; OpenStreetMap contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <LocationPickerMap position={markerPosition} onLocationSelect={handleLocationSelect} />
                                        </MapContainer>
                                        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3.5 py-2 rounded-xl text-xs z-[1000] font-extrabold text-gray-800 shadow-md border border-gray-200 flex items-center gap-2 pointer-events-none">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                                            📍 Click on map or drag checkpoint to mark location
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 4: Detailed Description */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Detailed Description <span className="text-red-500">*</span>
                                </label>
                                {aiAnalysisResult && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, description: aiAnalysisResult.suggestedDescription }))}
                                            className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-all"
                                        >
                                            ⚡ Apply AI Description
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, description: '' }))}
                                            className="text-[10px] font-bold text-gray-400 hover:text-red-500 px-1 py-1 transition-all"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}
                            </div>
                            <textarea
                                rows={5}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium text-gray-800 placeholder-gray-400 leading-relaxed"
                                placeholder="Provide comprehensive details about what happened, casualties, hazards, or immediate assistance needed..."
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>

                        {/* Section 5: Full Width Primary Submit Button */}
                        <div className="pt-2">
                            <Button
                                size="lg"
                                className="w-full py-4 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 text-base font-extrabold justify-center"
                                isLoading={isSubmitting}
                            >
                                <Send className="w-5 h-5 mr-2" />
                                Submit Incident Report
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ReportIncident;
