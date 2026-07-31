import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Button from '../components/ui/Button.jsx';
import { Shield, Zap, Globe, Users, ArrowRight } from 'lucide-react';
import homeHeroImage from '../assets/home-hero.jpg';

const Home = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, resolved: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/incidents/stats`);
                const data = await response.json();
                if (data.success) setStats(data.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-grow">
                <section className="container-custom py-12 md:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
                                <Zap className="w-3 h-3" />
                                Real-time Safety Network
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight">
                                Empowering <br />
                                <span className="text-primary italic">Communities,</span> <br />
                                Ensuring Safety
                            </h1>
                            <p className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
                                SentinelLink provides real-time incident reporting and transparent monitoring, connecting citizens and authorities for a safer environment.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/report">
                                    <Button size="lg" className="px-10 py-6 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">Report Now</Button>
                                </Link>
                                <Link to="/incidents">
                                    <Button variant="secondary" size="lg" className="px-10 py-6 text-lg rounded-2xl border-2 hover:bg-gray-50">Explore Live</Button>
                                </Link>
                            </div>

                            <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
                                <div>
                                    <p className="text-3xl font-black text-gray-900">{stats.total > 0 ? `${stats.total}+` : 'Live'}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reports Active</p>
                                </div>
                                <div className="w-px h-10 bg-gray-100" />
                                <div>
                                    <p className="text-3xl font-black text-gray-900">{stats.resolved > 0 ? stats.resolved : '24/7'}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stats.resolved > 0 ? 'Resolved' : 'Monitoring'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative group animate-in fade-in slide-in-from-right-8 duration-700 order-1 lg:order-2">
                            <div className="absolute -inset-10 bg-primary/10 rounded-[4rem] blur-3xl group-hover:bg-primary/20 transition-all duration-700 -z-10" />
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border-8 border-white">
                                <img
                                    src={homeHeroImage}
                                    alt="Emergency Response"
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                    <p className="text-white text-sm font-medium leading-relaxed italic">
                                        "Real-time reports helped responders act faster and smarter."
                                    </p>
                                    <p className="text-white/60 text-xs mt-2 font-bold uppercase">— Community Member </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-gray-50 py-16 md:py-24 border-y border-gray-100">
                    <div className="container-custom">
                        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 space-y-4">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Built for Trust and Speed</h2>
                            <p className="text-gray-500 font-medium">Our platform leverages modern technology to ensure every report is heard and every action is transparent.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Shield,
                                    title: 'Verified Reporting',
                                    desc: 'Community-driven verification ensures that every incident is legitimate and prioritized correctly.'
                                },
                                {
                                    icon: Globe,
                                    title: 'Live Map Sync',
                                    desc: 'Watch incidents appear on the map in real-time as they are reported by citizens on the ground.'
                                },
                                {
                                    icon: Users,
                                    title: 'Admin Oversight',
                                    desc: 'Dedicated dashboards for authorities to manage, resolve, and broadcast emergency alerts.'
                                }
                            ].map((feature, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:rotate-6 transition-all">
                                        <feature.icon className="w-6 h-6 text-primary group-hover:text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-16 md:py-24 container-custom">
                    <div className="bg-primary rounded-[2rem] md:rounded-[3rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-3xl" />

                        <div className="relative z-10 space-y-6 md:space-y-8 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-black leading-tight">Ready to make your neighborhood safer?</h2>
                            <p className="text-primary-light text-lg font-medium opacity-90">
                                Join thousands of citizens who are already using SentinelLink to report incidents and stay informed.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <Link to="/report">
                                    <Button variant="secondary" size="lg" className="px-10 bg-white text-primary hover:bg-gray-50 border-white">Get Started Now</Button>
                                </Link>
                                <Link to="/incidents" className="flex items-center gap-2 font-bold text-white hover:underline">
                                    Explore the feed <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
