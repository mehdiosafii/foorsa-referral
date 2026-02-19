import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, Settings } from 'lucide-react';

export default function AdminAmbassadors() {
  const navigate = useNavigate();
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    points: 0,
  });

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    const res = await fetch('/api/admin/users', { credentials: 'include' });
    if (!res.ok) {
      navigate('/login');
      return;
    }
    const data = await res.json();
    setAmbassadors(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = editingId ? `/api/admin/users/${editingId}` : '/api/admin/users';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingId(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', points: 0 });
      fetchAmbassadors();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ambassador?')) return;

    await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    fetchAmbassadors();
  };

  const handleEdit = (ambassador: any) => {
    setEditingId(ambassador.id);
    setFormData({
      firstName: ambassador.first_name,
      lastName: ambassador.last_name,
      email: ambassador.email || '',
      phone: ambassador.phone || '',
      password: '',
      points: ambassador.points,
    });
    setShowModal(true);
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
            <p className="text-gray-400">Manage Ambassadors</p>
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
          <Link to="/admin/ambassadors" className="text-blue-400 font-medium">
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Ambassadors ({ambassadors.length})</h2>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', points: 0 });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Add Ambassador
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Points</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ambassadors.map((amb) => (
                  <tr key={amb.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4">{amb.full_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{amb.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{amb.phone || '-'}</td>
                    <td className="py-3 px-4 font-mono text-sm">{amb.referral_code}</td>
                    <td className="py-3 px-4">{amb.points}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(amb)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(amb.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Ambassador' : 'Add Ambassador'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Password {editingId ? '(leave empty to keep current)' : '*'}</label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
