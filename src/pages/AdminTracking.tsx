import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';

export default function AdminTracking() {
  const navigate = useNavigate();
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const res = await fetch('/api/admin/tracking-links', { credentials: 'include' });
    if (!res.ok) {
      navigate('/login');
      return;
    }
    const data = await res.json();
    setLinks(data);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">Tracking Links</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/settings"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
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
          <Link to="/admin/tracking" className="text-blue-400 font-medium">
            Tracking
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Tracking Links ({links.length})</h2>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4">Ambassador</th>
                  <th className="text-left py-3 px-4">URL</th>
                  <th className="text-left py-3 px-4">Label</th>
                  <th className="text-left py-3 px-4">Clicks</th>
                  <th className="text-left py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {links.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No tracking links found
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <tr key={link.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        {link.ambassador?.full_name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-sm text-blue-400 truncate max-w-xs">
                        {link.url}
                      </td>
                      <td className="py-3 px-4 text-sm">{link.label || '-'}</td>
                      <td className="py-3 px-4 font-bold">{link.clicks_count}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(link.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
