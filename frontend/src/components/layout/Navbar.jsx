import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Button from '../ui/Button.jsx';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = location.pathname.startsWith('/admin');
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="container-custom">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-primary p-1.5 rounded-lg group-hover:bg-primary-dark transition-colors">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-primary tracking-tight">SentinelLink</span>
                        </Link>

                        {!isAdmin && (
                            <div className="hidden md:flex items-center gap-6">
                                <Link
                                    to="/"
                                    className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/incidents"
                                    className={`text-sm font-medium transition-colors ${location.pathname === '/incidents' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
                                >
                                    Incidents
                                </Link>
                                <Link
                                    to="/map"
                                    className={`text-sm font-medium transition-colors ${location.pathname === '/map' ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
                                >
                                    Map View
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4">
                            {!isAdmin ? (
                                <>
                                    {token ? (
                                        <Link to="/admin/dashboard">
                                            <Button variant="secondary" size="sm">Go to Dashboard</Button>
                                        </Link>
                                    ) : (
                                        <Link to="/admin/login">
                                            <Button variant="secondary" size="sm">Admin Login</Button>
                                        </Link>
                                    )}
                                    <Link to="/report">
                                        <Button size="sm">Report an Incident</Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-semibold text-gray-900">Admin User</p>
                                        <p className="text-[10px] text-gray-500">Super Admin</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <img
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt="Admin"
                                            className="w-8 h-8 rounded-full border border-gray-200"
                                        />
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-lg animate-in slide-in-from-top-5 duration-200">
                    <div className="p-4 space-y-4">
                        {!isAdmin && (
                            <div className="space-y-2">
                                <Link
                                    to="/"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg text-sm font-medium ${location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/incidents"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg text-sm font-medium ${location.pathname === '/incidents' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Incidents
                                </Link>
                                <Link
                                    to="/map"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-2 rounded-lg text-sm font-medium ${location.pathname === '/map' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Map View
                                </Link>
                            </div>
                        )}
                        <div className="pt-4 border-t border-gray-100 space-y-3">
                            {!isAdmin ? (
                                <>
                                    {token ? (
                                        <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="secondary" fullWidth size="sm">Go to Dashboard</Button>
                                        </Link>
                                    ) : (
                                        <Link to="/admin/login" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="secondary" fullWidth size="sm">Admin Login</Button>
                                        </Link>
                                    )}
                                    <Link to="/report" onClick={() => setIsMenuOpen(false)}>
                                        <Button fullWidth size="sm">Report an Incident</Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <div className="px-4 flex items-center gap-3">
                                        <img
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt="Admin"
                                            className="w-8 h-8 rounded-full border border-gray-200"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">Admin User</p>
                                            <p className="text-xs text-gray-500">Super Admin</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
