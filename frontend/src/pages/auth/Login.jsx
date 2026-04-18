import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config';
import { GoogleLogin } from '@react-oauth/google';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
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
        navigate('/');
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

  const handleGoogleLogin = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse, 'CUSTOMER');
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Google login failed');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay hover:scale-105 transition-transform duration-[10s]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent" />
        <div className="absolute top-12 left-12">
          <h2 className="text-2xl font-black text-white tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
            SANDHYA<span className="text-emerald-500">FASHION.</span>
          </h2>
        </div>
        <div className="absolute bottom-16 left-16 right-16 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-emerald-400 mb-6 border border-white/10">
            <Sparkles size={20} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Welcome Back</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-8">
            Access your <br />
            <span className="text-emerald-500">Wholesale Dashboard</span>.
          </h1>
          <div className="space-y-3">
            {['Track recent orders instantly', 'Access exclusive fast-moving catalog', 'Dedicated retail support'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-200">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span className="font-medium text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-4 bg-gray-50/50 overflow-hidden">
        <div className="w-full max-w-sm">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-400 font-bold text-sm hover:text-emerald-600 mb-6 transition-colors group">
             <ArrowLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
             Back
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden mb-4 text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
              SANDHYA<span className="text-emerald-500">FASHION.</span>
            </h2>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">Sign In</h2>
            <p className="text-gray-500 text-sm font-medium">Please enter your details to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {signupMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 size={18} className="text-emerald-500" />
                {signupMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold animate-fade-in">
                {error}
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 group-focus-within:text-emerald-600 transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 text-sm font-medium text-gray-900 shadow-sm"
                  placeholder="name@example.com" />
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-center mb-1.5">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest group-focus-within:text-emerald-600 transition-colors">Password</label>
                 <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Forgot password?
                 </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input name="password" type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 text-sm font-medium text-gray-900 shadow-sm"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3 bg-gray-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 group">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Sign In <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} /></>
              }
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-gray-50 text-gray-400">or</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogleLogin} onError={() => setError('Google sign-in failed. Please try again.')}
                text="signin_with" shape="pill" theme="outline" width="100%" />
            </div>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm font-medium">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-emerald-600 font-extrabold hover:underline underline-offset-4">
              Sign up today
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
