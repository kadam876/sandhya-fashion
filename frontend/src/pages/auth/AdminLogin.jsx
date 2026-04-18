import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const signupMessage = location.state?.message;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/products?page=0&size=1`, { signal: controller.signal }).catch(() => {});
    return () => controller.abort();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await Promise.race([
        login(email, password),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
      ]);

      if (result.success) {
        const userRole = result.role?.toUpperCase();
        if (userRole === 'OWNER' || userRole === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          setError('Access denied. This portal is for shop owners only.');
          setLoading(false);
        }
      } else {
        setError(result.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      if (err.message === 'timeout') {
        setError('Server is starting up — please try again in a few seconds.');
      } else {
        setError('Network error. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Sandhya Fashion</h1>
            <p className="text-gray-400 text-sm mt-1">Business Portal</p>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Shop Owner Login</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Access your business dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {signupMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm">
                {signupMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter your password"
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Not a shop owner?{' '}
              <button onClick={() => navigate('/login')} className="text-[#00B67A] hover:underline">
                Customer login
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>&copy; 2024 Sandhya Fashion. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
