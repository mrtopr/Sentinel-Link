import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Lock, Mail, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import { authApi } from '../api/auth.js';

const AdminLogin = () => {
    const [email, setEmail] = useState('admin@sentinellink.com');
    const [password, setPassword] = useState('password');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.login({ email, password });
            const loginData = response.data;

            if (loginData && loginData.token) {
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('user', JSON.stringify(loginData.user));
                window.location.href = '/admin/dashboard';
            } else {
                setError('Authentication failed. No token received.');
            }
        } catch (err) {
            console.error('Login error:', err);
            const backendError = err.response?.data?.message || err.response?.data?.error;
            if (backendError) {
                setError(backendError);
            } else if (err.code === 'ERR_NETWORK') {
                setError('Network error: Please check if the backend server is running and CORS is configured correctly.');
            } else {
                setError('Invalid email or password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                        <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">SentinelLink</span>
                    </Link>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Login</h2>
                        <p className="text-sm text-gray-500 font-medium">Access the administrative dashboard.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    placeholder="admin@sentinellink.com"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium placeholder-gray-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-900 font-medium placeholder-gray-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            fullWidth
                            size="lg"
                            className="h-14 font-bold shadow-lg shadow-primary/25 rounded-2xl disabled:opacity-70"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Logging in...
                                </span>
                            ) : 'Login'}
                        </Button>

                        <div className="text-center">
                            <a href="#" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest">
                                Forgot Password?
                            </a>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 font-medium">
                    © 2025 SentinelLink. Authorized access only.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
