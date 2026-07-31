import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Incidents from './pages/Incidents.jsx';
import ReportIncident from './pages/ReportIncident.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MapView from './pages/MapView.jsx';
import EmergencyAlert from './components/EmergencyAlert.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';

function App() {
  return (
    <>
      <ScrollToTop />
      <EmergencyAlert />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
