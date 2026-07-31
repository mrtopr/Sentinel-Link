import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    AlertCircle,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    LogOut,
    Settings,
    MessageSquare,
    FileText,
    Shield,
    X,
    Menu,
    Search,
    Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { incidentApi } from '../api/incidents.js';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/users.js';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const [managedIncident, setManagedIncident] = useState(null);
    const [newNote, setNewNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'CITIZEN' });

    const stats = [
        { label: 'Total Incidents', value: incidents.length, icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Review', value: incidents.filter(i => i.status === 'REPORTED').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Active Tasks', value: incidents.filter(i => i.status === 'IN_PROGRESS').length, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/5' },
        { label: 'Resolved Today', value: incidents.filter(i => i.status === 'RESOLVED').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token || user.role !== 'ADMIN') {
            navigate('/admin/login');
        }

        fetchIncidents();
        fetchUsers();
    }, [navigate]);

    const fetchIncidents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await incidentApi.getIncidents();
            setIncidents(data.data || []);
        } catch (err) {
            console.error('Error fetching incidents:', err);
            setError('Failed to load incidents.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await incidentApi.updateIncidentStatus(id, newStatus);
            setIncidents((prev) => prev.map((inc) =>
                inc.id === id ? { ...inc, status: newStatus } : inc
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Make sure you are authorized.');
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await userApi.getUsers();
            setUsers(data.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await userApi.deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('Failed to delete user.');
        }
    };

    const handleRoleUpdate = async (id, newRole) => {
        try {
            await userApi.updateUserRole(id, newRole);
            setUsers((prev) => prev.map((u) =>
                u.id === id ? { ...u, role: newRole } : u
            ));
        } catch (err) {
            console.error('Error updating role:', err);
            alert('Failed to update role. Ensure you have permission.');
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await userApi.createUser(newUser);
            if (response.success && response.data) {
                setUsers(prev => [response.data.user || response.data, ...prev]);
                setShowAddUserModal(false);
                setNewUser({ name: '', email: '', password: '', role: 'CITIZEN' });
                alert('User created successfully!');
            }
        } catch (err) {
            console.error('Error creating user:', err);
            const message = err.response?.data?.message || 'Failed to create user';
            const details = err.response?.data?.details;

            if (details && Array.isArray(details)) {
                const detailedMessage = details.map((d) => `${d.field}: ${d.message}`).join('\n');
                alert(`${message}\n\n${detailedMessage}`);
            } else {
                alert(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenManage = async (id) => {
        try {
            setIsLoading(true);
            const data = await incidentApi.getIncidentById(id);
            setManagedIncident(data.data);
            setNewNote('');
        } catch (err) {
            console.error('Error fetching incident details:', err);
            alert('Failed to load incident details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!managedIncident || !newNote.trim()) return;
        setIsUpdating(true);
        try {
            const response = await incidentApi.addNote(managedIncident.id, newNote);
            if (response.success && response.data) {
                setManagedIncident(response.data);
                setNewNote('');
            } else {
                const data = await incidentApi.getIncidentById(managedIncident.id);
                setManagedIncident(data.data);
                setNewNote('');
            }
        } catch (err) {
            console.error('Error adding note:', err);
            alert('Failed to add note');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSeverityUpdate = async (newSeverity) => {
        if (!managedIncident) return;
        setIsUpdating(true);
        try {
            await incidentApi.updateSeverity(managedIncident.id, newSeverity);
            setManagedIncident(prev => prev ? { ...prev, severity: newSeverity } : null);
            setIncidents(prev => prev.map(inc => inc.id === managedIncident.id ? { ...inc, severity: newSeverity } : inc));
        } catch (err) {
            console.error('Error updating severity:', err);
            alert('Failed to update severity');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleManageStatusUpdate = async (newStatus) => {
        if (!managedIncident) return;
        setIsUpdating(true);
        try {
            await incidentApi.updateIncidentStatus(managedIncident.id, newStatus);
            setManagedIncident(prev => prev ? { ...prev, status: newStatus } : null);
            setIncidents(prev => prev.map(inc => inc.id === managedIncident.id ? { ...inc, status: newStatus } : inc));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteIncident = async (id) => {
        if (!window.confirm('Are you sure you want to delete this flagged incident? This action cannot be undone.')) return;
        try {
            await incidentApi.deleteIncident(id);
            setIncidents((prev) => prev.filter((inc) => inc.id !== id));
        } catch (err) {
            console.error('Error deleting incident:', err);
            alert('Failed to delete incident.');
        }
    };

    const handleBroadcast = async () => {
        const message = window.prompt('Enter emergency broadcast message:');
        if (!message) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/incidents/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            if (data.success) {
                alert('Broadcast sent successfully!');
            }
        } catch (error) {
            console.error('Broadcast error:', error);
            alert('Failed to send broadcast.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(incidents);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Incidents");
        XLSX.writeFile(workbook, "incidents_report.xlsx");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {showMobileSidebar && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out
                    ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-lg tracking-tight">Sentinel<span className="text-primary">Link</span></h1>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Admin Panel</p>
                        </div>
                    </div>
                    <button onClick={() => setShowMobileSidebar(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-primary p-2 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">SentinelLink</span>
                    </div>

                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-primary/5 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('incidents')}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === 'incidents' ? 'bg-primary/5 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <AlertCircle className="w-5 h-5" />
                            Incidents
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-primary/5 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Users className="w-5 h-5" />
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary/5 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Settings className="w-5 h-5" />
                            Settings
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-8">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-grow p-8 lg:p-12 overflow-y-auto h-screen">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-start gap-4">
                        <button
                            onClick={() => setShowMobileSidebar(true)}
                            className="lg:hidden mt-1 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-8 h-8 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Admin Command</h1>
                            <p className="text-gray-500 font-medium">Real-time emergency monitoring and coordination.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" className="bg-white border-gray-200" onClick={handleExport}>Export Report</Button>
                        <Button onClick={fetchIncidents}>Refresh Data</Button>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live</span>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
                            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Incidents</h2>
                                <Button variant="secondary" size="sm" onClick={() => setActiveTab('incidents')}>View All</Button>
                            </div>

                            <div className="overflow-x-auto">
                                {isLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                        <p className="text-gray-500 font-medium">Synchronizing...</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Incident</th>
                                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {incidents.slice(0, 5).map((incident) => (
                                                <tr key={incident.id}>
                                                    <td className="px-8 py-4 font-bold">{incident.incidentType || incident.type}</td>
                                                    <td className="px-8 py-4"><Badge label={incident.status} type="status" value={incident.status} /></td>
                                                    <td className="px-8 py-4">
                                                        <select
                                                            className="text-xs font-bold bg-gray-50 rounded-lg px-2 py-1 cursor-pointer"
                                                            value={incident.status}
                                                            onChange={(e) => handleStatusUpdate(incident.id, e.target.value)}
                                                        >
                                                            <option value="REPORTED">Reported</option>
                                                            <option value="VERIFIED">Verified</option>
                                                            <option value="IN_PROGRESS">In Progress</option>
                                                            <option value="RESOLVED">Resolved</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-primary p-10 rounded-[3rem] text-white relative h-64 flex flex-col justify-center">
                                <h3 className="text-2xl font-black mb-2">System Protocol Alpha</h3>
                                <p className="text-white/70 mb-4">Emergency broadcast system ready.</p>
                                <Button variant="secondary" className="bg-white text-primary w-fit" onClick={handleBroadcast}>Initiate Broadcast</Button>
                            </div>
                            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 flex flex-col justify-center">
                                <h4 className="font-black text-amber-600 uppercase text-xs mb-2">Alert Bulletin</h4>
                                <p className="text-gray-600 italic">"Detected increase in local incident reports. Standard protocols in effect."</p>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'incidents' && (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Comprehensive Incident Log</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Incident</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Location</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Priority</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {incidents.map((incident) => (
                                        <tr key={incident.id}>
                                            <td className="px-8 py-6 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                                    {incident.mediaUrl && <img src={incident.mediaUrl} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="font-bold">{incident.incidentType || incident.type}</div>
                                            </td>
                                            <td className="px-8 py-6 text-sm">{incident.location}</td>
                                            <td className="px-8 py-6"><Badge label={incident.severity} type="severity" value={incident.severity} /></td>
                                            <td className="px-8 py-6"><Badge label={incident.status} type="status" value={incident.status} /></td>
                                            <td className="px-8 py-6 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenManage(incident.id)}
                                                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                                                >
                                                    <Settings className="w-3 h-3" /> Manage
                                                </button>
                                                {incident.status === 'FLAGGED' && (
                                                    <button
                                                        onClick={() => handleDeleteIncident(incident.id)}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                                                        title="Delete Incident"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {managedIncident && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-black text-gray-900">Manage Incident</h2>
                                    <span className="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{managedIncident.id.slice(0, 8)}</span>
                                </div>
                                <button onClick={() => setManagedIncident(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <LogOut className="w-5 h-5 rotate-180" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-6">
                                        <div className="bg-gray-100 rounded-2xl overflow-hidden h-48 relative border border-gray-200">
                                            {(managedIncident.mediaUrl || managedIncident.image) ? (
                                                (managedIncident.mediaUrl?.match(/\.(mp4|webm|ogg|mov)$/i)) ? (
                                                    <video
                                                        src={managedIncident.mediaUrl}
                                                        className="w-full h-full object-cover"
                                                        controls
                                                    />
                                                ) : (
                                                    <img
                                                        src={managedIncident.mediaUrl || managedIncident.image}
                                                        alt={managedIncident.incidentType}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
                                                    <AlertCircle className="w-8 h-8 opacity-50" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">No Media</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Priority (Severity)</label>
                                            <div className="flex gap-2">
                                                {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
                                                    <button
                                                        key={level}
                                                        onClick={() => handleSeverityUpdate(level)}
                                                        className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${managedIncident.severity === level
                                                            ? (level === 'HIGH' ? 'border-red-500 bg-red-50 text-red-700' : level === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-green-500 bg-green-50 text-green-700')
                                                            : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                                                            }`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status</label>
                                            <select
                                                className="w-full text-sm font-bold bg-gray-50 p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={managedIncident.status}
                                                onChange={(e) => handleManageStatusUpdate(e.target.value)}
                                            >
                                                <option value="REPORTED">Reported</option>
                                                <option value="VERIFIED">Verified</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="RESOLVED">Resolved</option>
                                                <option value="FLAGGED">Flagged</option>
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-blue-50 rounded-2xl">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-blue-900">{managedIncident.incidentType}</h4>
                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                        {new Date(managedIncident.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-blue-700/80 text-sm">{managedIncident.description}</p>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-widest mb-1">Location Details</h4>
                                                <p className="text-gray-600 text-sm font-medium">{managedIncident.location}</p>
                                                {(managedIncident.latitude && managedIncident.longitude) && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 font-mono bg-white px-2 py-1 rounded border border-gray-200 w-fit">
                                                        <span className="font-bold text-primary">LAT:</span> {managedIncident.latitude.toFixed(6)}
                                                        <span className="w-px h-3 bg-gray-300 mx-1" />
                                                        <span className="font-bold text-primary">LNG:</span> {managedIncident.longitude.toFixed(6)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col h-[400px]">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Internal Notes</label>
                                        </div>

                                        <div className="flex-grow bg-gray-50 rounded-2xl p-4 overflow-y-auto mb-4 border border-gray-100 space-y-4">
                                            {managedIncident.adminNotes?.length ? (
                                                managedIncident.adminNotes.map((note) => (
                                                    <div key={note.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                                        <p className="text-gray-700 text-sm mb-2">{note.note}</p>
                                                        <div className="flex justify-between items-center text-[10px] text-gray-400">
                                                            <span className="font-bold">{note.user.name}</span>
                                                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                                    <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                                                    <p className="text-sm font-medium">No internal notes yet</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add an internal note..."
                                                className="flex-grow p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                            />
                                            <Button disabled={isUpdating} onClick={handleAddNote}>Send</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active User Directory</h2>
                            <Button onClick={() => setShowAddUserModal(true)} size="sm">Add User</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">User</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Email</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Role</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Joined</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-8 py-6 font-bold">{user.name}</td>
                                            <td className="px-8 py-6 text-sm">{user.email}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Badge label={user.role} type="status" value={user.role === 'ADMIN' ? 'RESOLVED' : 'VERIFIED'} />
                                                    <select
                                                        className="text-xs font-bold bg-gray-50 rounded-lg px-2 py-1 cursor-pointer border border-gray-200"
                                                        value={user.role}
                                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                    >
                                                        <option value="CITIZEN">Citizen</option>
                                                        <option value="ADMIN">Admin</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {showAddUserModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900">Add New User</h3>
                                <button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <LogOut className="w-5 h-5 rotate-180 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="John Doe"
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="john@example.com"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="••••••••"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Initial Role</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                    >
                                        <option value="CITIZEN">Citizen</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUserModal(false)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <Button type="submit" className="flex-1" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create User'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm max-w-2xl">
                        <h2 className="text-3xl font-black text-gray-900 mb-8">System Settings</h2>
                        <div className="space-y-8">
                            <div className="p-6 bg-gray-50 rounded-2xl">
                                <h4 className="font-bold text-gray-900 mb-2">Admin Profile</h4>
                                <p className="text-gray-500 text-sm">Managing central coordination node.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border-l-4 border-primary">
                                <h4 className="font-bold text-gray-900 mb-2">Notifications</h4>
                                <p className="text-gray-500 text-sm">Real-time alerts for high-severity incidents are enabled.</p>
                            </div>
                            <Button fullWidth onClick={() => alert('Settings saved successfully.')}>Save Configuration</Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
