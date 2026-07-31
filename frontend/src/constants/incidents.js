import { Flame, Ambulance, Car, Megaphone, CloudLightning, AlertTriangle, Droplets, Zap, Eye, HelpCircle } from 'lucide-react';

export const INCIDENT_TYPES = [
    { value: 'FIRE', label: 'Fire Outbreak', icon: Flame },
    { value: 'MEDICAL', label: 'Medical Emergency', icon: Ambulance },
    { value: 'ACCIDENT', label: 'Vehicle Accident', icon: Car },
    { value: 'FLOOD', label: 'Water Leak / Flood', icon: Droplets },
    { value: 'PUBLIC_DISTURBANCE', label: 'Crowd Disturbance', icon: Megaphone },
    { value: 'INFRASTRUCTURE', label: 'Route Hazard', icon: AlertTriangle },
    { value: 'POWER_OUTAGE', label: 'Power Outage', icon: Zap },
    { value: 'NATURAL_DISASTER', label: 'Natural Disaster', icon: CloudLightning },
    { value: 'SUSPICIOUS', label: 'Suspicious Activity', icon: Eye },
    { value: 'OTHER', label: 'Other', icon: HelpCircle },
];

export const INCIDENT_TYPE_LABELS = INCIDENT_TYPES.reduce((acc, curr) => {
    acc[curr.value] = curr.label;
    return acc;
}, {});

export const INCIDENT_TYPE_ICONS = INCIDENT_TYPES.reduce((acc, curr) => {
    acc[curr.value] = curr.icon;
    return acc;
}, {});

export const HELPLINE_NUMBERS = {
    FIRE: { name: 'Fire Department', number: '101', description: 'For fire emergencies and rescue operations' },
    MEDICAL: { name: 'Ambulance / Medical Emergency', number: '108', description: 'For medical emergencies and ambulance services' },
    ACCIDENT: { name: 'Road Accident Emergency', number: '1073', description: 'National Highway Authority helpline for road accidents' },
    FLOOD: { name: 'Water Emergency', number: '1916', description: 'Municipal water supply and flood control' },
    PUBLIC_DISTURBANCE: { name: 'Police Control Room', number: '100', description: 'For law and order emergencies' },
    INFRASTRUCTURE: { name: 'Municipal Corporation', number: '1800-111-555', description: 'For infrastructure issues and road hazards' },
    POWER_OUTAGE: { name: 'Electricity Helpline', number: '1912', description: 'For power outages and electrical emergencies' },
    NATURAL_DISASTER: { name: 'NDRF / Disaster Response', number: '1078', description: 'National Disaster Response Force helpline' },
    SUSPICIOUS: { name: 'Police Control Room', number: '100', description: 'For reporting suspicious activities' },
    OTHER: { name: 'Emergency Services', number: '112', description: 'Unified emergency helpline for all emergencies' },
};
