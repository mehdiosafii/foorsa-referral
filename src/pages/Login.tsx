import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'ambassador' | 'admin'>('ambassador');
  const [formData, setFormData] = useState({
    referralCode: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'admin' ? '/api/login' : '/api/ambassador/login';
      const body = mode === 'admin' 
        ? { password: formData.password }
        : { referralCode: formData.referralCode, password: formData.password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const redirectPath = mode === 'admin' ? '/admin' : '/partner';
        navigate(redirectPath);
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Foorsa</h1>
          <p className="text-gray-400">Referral Partner Login</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('ambassador')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                mode === 'ambassador'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Ambassador
            </button>
            <button
              onClick={() => setMode('admin')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                mode === 'admin'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'ambassador' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Referral Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC123"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
