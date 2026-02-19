import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, LogOut, Settings, ExternalLink } from 'lucide-react';

export default function AdminLeads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const res = await fetch('/api/admin/leads', { credentials: 'include' });
    if (!res.ok) {
      navigate('/login');
      return;
    }
    const data = await res.json();
    setLeads(data);
  };

  const handleQuickSend = async (leadId: number) => {
    const res = await fetch('/api/admin/leads/quick-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ leadId }),
    });

    if (res.ok) {
      const { whatsappLink } = await res.json();
      window.open(whatsappLink, '_blank');
      fetchLeads();
    }
  };

  const handleBulkSend = async () => {
    if (selectedLeads.size === 0) {
      alert('Please select leads first');
      return;
    }

    const res = await fetch('/api/admin/leads/bulk-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ leadIds: Array.from(selectedLeads) }),
    });

    if (res.ok) {
      const { results } = await res.json();
      results.forEach((r: any) => window.open(r.whatsappLink, '_blank'));
      setSelectedLeads(new Set());
      fetchLeads();
    }
  };

  const toggleSelect = (leadId: number) => {
    const newSet = new Set(selectedLeads);
    if (newSet.has(leadId)) {
      newSet.delete(leadId);
    } else {
      newSet.add(leadId);
    }
    setSelectedLeads(newSet);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  const filteredLeads = filterStatus === 'all' 
    ? leads 
    : leads.filter(l => l.status === filterStatus);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400">Manage Leads</p>
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
          <Link to="/admin/leads" className="text-blue-400 font-medium">
            Leads
          </Link>
          <Link to="/admin/tracking" className="text-gray-400 hover:text-white">
            Tracking
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Leads ({filteredLeads.length})</h2>
          
          <div className="flex gap-4 items-center">
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Bulk WhatsApp */}
            {selectedLeads.size > 0 && (
              <button
                onClick={handleBulkSend}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
              >
                <MessageSquare className="w-4 h-4" />
                Send WhatsApp ({selectedLeads.size})
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
                        } else {
                          setSelectedLeads(new Set());
                        }
                      }}
                      checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                    />
                  </th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Ambassador</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        {lead.first_name} {lead.last_name}
                      </td>
                      <td className="py-3 px-4 text-sm">{lead.phone}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">{lead.email || '-'}</td>
                      <td className="py-3 px-4 text-sm">{lead.city || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {lead.ambassador?.full_name || 'Direct'}
                      </td>
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
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleQuickSend(lead.id)}
                          className="p-2 bg-green-600 hover:bg-green-700 rounded flex items-center gap-1"
                          title="Send WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <ExternalLink className="w-3 h-3" />
                        </button>
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
