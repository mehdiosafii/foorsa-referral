import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, FileText, MousePointerClick, TrendingUp, LogOut, Settings } from 'lucide-react';

interface Stats {
  ambassadors: number;
  leads: number;
  clicks: number;
  conversions: number;
  conversionRate: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartRes] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include' }),
        fetch('/api/admin/chart', { credentials: 'include' }),
      ]);

      if (!statsRes.ok) {
        navigate('/login');
        return;
      }

      const [statsData, chartData] = await Promise.all([
        statsRes.json(),
        chartRes.json(),
      ]);

      setStats(statsData);
      setChartData(chartData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">Foorsa Referral System</p>
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
          <Link to="/admin" className="text-blue-400 hover:text-blue-300 font-medium">
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{stats?.ambassadors || 0}</span>
            </div>
            <p className="text-gray-400">Total Ambassadors</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{stats?.leads || 0}</span>
            </div>
            <p className="text-gray-400">Total Leads</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold">{stats?.clicks || 0}</span>
            </div>
            <p className="text-gray-400">Total Clicks</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold">{stats?.conversions || 0}</span>
            </div>
            <p className="text-gray-400">Conversions ({stats?.conversionRate}%)</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">Activity Overview (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={2} name="Clicks" />
              <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} name="Leads" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/ambassadors"
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition block"
          >
            <Users className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Manage Ambassadors</h3>
            <p className="text-gray-400">View, add, or edit ambassador accounts</p>
          </Link>

          <Link
            to="/admin/leads"
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition block"
          >
            <FileText className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Manage Leads</h3>
            <p className="text-gray-400">Review and follow up with leads</p>
          </Link>

          <Link
            to="/admin/tracking"
            className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition block"
          >
            <MousePointerClick className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Tracking Links</h3>
            <p className="text-gray-400">Monitor referral link performance</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
