import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, MousePointerClick, TrendingUp, Award, LogOut, Copy, Check } from 'lucide-react';

interface Stats {
  clicks: number;
  leads: number;
  conversions: number;
  conversionRate: string;
  points: number;
  rank: number;
}

export default function AmbassadorDashboard() {
  const navigate = useNavigate();
  const [ambassador, setAmbassador] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meRes, statsRes, chartRes, leadsRes] = await Promise.all([
        fetch('/api/ambassador/me', { credentials: 'include' }),
        fetch('/api/stats', { credentials: 'include' }),
        fetch('/api/stats/chart', { credentials: 'include' }),
        fetch('/api/leads/recent', { credentials: 'include' }),
      ]);

      if (!meRes.ok) {
        navigate('/login');
        return;
      }

      const [meData, statsData, chartData, leadsData] = await Promise.all([
        meRes.json(),
        statsRes.json(),
        chartRes.json(),
        leadsRes.json(),
      ]);

      setAmbassador(meData);
      setStats(statsData);
      setChartData(chartData);
      setRecentLeads(leadsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/ambassador/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/ref/${ambassador.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h1 className="text-2xl font-bold">Ambassador Dashboard</h1>
            <p className="text-gray-400">Welcome back, {ambassador?.firstName}!</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Referral Link Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
          <div className="flex items-center gap-4">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/ref/${ambassador?.referralCode}`}
              className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white font-mono"
            />
            <button
              onClick={copyReferralLink}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-white/80 text-sm mt-2">
            Referral Code: <span className="font-mono font-bold">{ambassador?.referralCode}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold">{stats?.clicks || 0}</span>
            </div>
            <p className="text-gray-400">Total Clicks</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold">{stats?.leads || 0}</span>
            </div>
            <p className="text-gray-400">Total Leads</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold">{stats?.conversions || 0}</span>
            </div>
            <p className="text-gray-400">Conversions</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold">{stats?.points || 0}</span>
            </div>
            <p className="text-gray-400">Points (Rank #{stats?.rank || 0})</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">Activity (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line type="monotone" dataKey="clicks" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Leads */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No leads yet. Start sharing your referral link!
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">{lead.first_name} {lead.last_name}</td>
                      <td className="py-3 px-4">{lead.phone}</td>
                      <td className="py-3 px-4">{lead.city || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lead.status === 'converted' ? 'bg-green-500/20 text-green-400' :
                          lead.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' :
                          lead.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(lead.created_at).toLocaleDateString()}
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
