import React from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 container-custom py-12">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

                    <div className="space-y-6 text-gray-600">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                            <p>We collect information you provide directly to us, such as when you create an account, report an incident, or contact us for support. This may include your name, email address, location data, and media files related to incidents.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <p>We use the information we collect to facilitate incident reporting, coordinate emergency responses, maintain platform safety, and improve our services.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Location Data</h2>
                            <p>SentinelLink is a location-based service. We collect your precise location when you report an incident to accurately pinpoint where help is needed.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
                            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Us</h2>
                            <p>If you have any questions about this Privacy Policy, please contact us at privacy@sentinellink.com.</p>
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

export default PrivacyPolicy;
