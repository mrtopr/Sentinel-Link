import React from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container-custom py-12">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

                    <div className="space-y-6 text-gray-600">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                            <p>By accessing or using SentinelLink, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. User Responsibilities</h2>
                            <p>You agree to use the platform responsibly and to report incidents accurately to the best of your knowledge. False reporting or misuse of the platform may result in account termination and legal action.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Incident Reporting</h2>
                            <p>Users are solely responsible for the content of their reports. While we strive to verify information, SentinelLink does not guarantee the accuracy of user-submitted reports.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Intellectual Property</h2>
                            <p>The SentinelLink platform and its original content, features, and functionality are owned by SentinelLink and are protected by international copyright, trademark, and other intellectual property laws.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Modifications</h2>
                            <p>We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the new Terms on this page.</p>
                        </section>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
                            Last updated: December 28, 2025
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsOfService;
