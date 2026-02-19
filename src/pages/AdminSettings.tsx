import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Database } from 'lucide-react';

export default function AdminSettings() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  const handleSeedAmbassadors = async () => {
    if (!confirm('This will create test ambassadors. Continue?')) return;

    const res = await fetch('/api/admin/seed-ambassadors', {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      alert('Test ambassadors created successfully!');
    }
  };

  const handleCleanupTrash = async () => {
    if (!confirm('This will permanently delete items that have been in trash for 30+ days. Continue?')) return;

    const res = await fetch('/api/admin/trash/cleanup', {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      alert('Trash cleaned up successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">Settings</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="max-w-7xl mx-auto flex gap-6">
          <Link to="/admin" className="text-gray-400 hover:text-white">
            Dashboard
          </Link>
          <Link to="/admin/ambassadors" className="text-gray-400 hover:text-white">
            Ambassadors
          </Link>
          <Link to="/admin/leads" className="text-gray-400 hover:text-white">
            Leads
          </Link>
          <Link to="/admin/tracking" className="text-gray-400 hover:text-white">
            Tracking
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">System Settings</h2>

        <div className="space-y-6">
          {/* Database Actions */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-bold">Database Actions</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Seed Test Ambassadors</h4>
                  <p className="text-sm text-gray-400">Create sample ambassador accounts for testing</p>
                </div>
                <button
                  onClick={handleSeedAmbassadors}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Seed
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cleanup Trash</h4>
                  <p className="text-sm text-gray-400">Permanently delete items in trash for 30+ days</p>
                </div>
                <button
                  onClick={handleCleanupTrash}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  Cleanup
                </button>
              </div>
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Environment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Database:</span>
                <span>Supabase PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Frontend:</span>
                <span>React 18 + Vite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Backend:</span>
                <span>Express + TypeScript</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deployment:</span>
                <span>Vercel Serverless</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
