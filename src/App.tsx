import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AmbassadorDashboard from './pages/AmbassadorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminAmbassadors from './pages/AdminAmbassadors';
import AdminLeads from './pages/AdminLeads';
import AdminTracking from './pages/AdminTracking';
import AdminSettings from './pages/AdminSettings';
import ThankYou from './pages/ThankYou';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/partner" element={<AmbassadorDashboard />} />
      <Route path="/dashboard" element={<AmbassadorDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/ambassadors" element={<AdminAmbassadors />} />
      <Route path="/admin/leads" element={<AdminLeads />} />
      <Route path="/admin/tracking" element={<AdminTracking />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/shukran" element={<ThankYou />} />
      <Route path="/thank-you" element={<ThankYou />} />
    </Routes>
  );
}

export default App;
