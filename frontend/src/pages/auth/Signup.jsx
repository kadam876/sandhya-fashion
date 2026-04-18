import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import PasswordStrength, { isPasswordValid } from '../../components/PasswordStrength';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isPasswordValid(formData.password)) {
      setError('Password does not meet the requirements below.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await register({ name: formData.name, email: formData.email, password: formData.password }, 'CUSTOMER');
      if (result.success) {
        navigate('/login', { state: { message: 'Account created! Welcome to Sandhya Fashion.' } });
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse, 'CUSTOMER');
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Google sign-up failed');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-emerald-500 mb-6 border border-white/10">
            <Sparkles size={20} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Join the Community</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-8">
            The Future of <br />
            <span className="text-emerald-500">Fashion</span> is here.
          </h1>
          <div className="space-y-3">
            {['Exclusive Designer Collections', 'Personalized Style Recommendations', 'Easy Wholesale Ordering'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-200">
                <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                <span className="font-medium text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-2 bg-gray-50/50 overflow-hidden">
        <div className="w-full max-w-sm mx-auto">
          <button onClick={() => navigate('/login')} className="flex items-center text-gray-400 font-bold text-[11px] uppercase tracking-wider hover:text-emerald-500 mb-4 transition-colors group">
            <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden mb-4 text-center">
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
              SANDHYA<span className="text-emerald-500">FASHION.</span>
            </h2>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1 leading-tight tracking-tight">Create Account</h2>
            <p className="text-gray-500 text-xs font-medium">Join our community of fashion-forward businesses.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-emerald-500 transition-colors">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input name="name" type="text" required value={formData.name} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
                  placeholder="Enter your name" />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-emerald-500 transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input name="email" type="email" required value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
                  placeholder="name@example.com" />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-emerald-500 transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="scale-y-90 origin-top mt-1">
                 <PasswordStrength password={formData.password} />
              </div>
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 group-focus-within:text-emerald-500 transition-colors">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                <input name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
                  placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-2 group">
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Create Account <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={16} /></>
              }
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-gray-50 text-gray-400">or</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSignup} onError={() => setError('Google sign-up failed')}
                text="signup_with" shape="pill" theme="outline" width="100%" />
            </div>
          </form>

          <p className="mt-4 text-center text-gray-500 text-xs font-medium">
            Already a member?{' '}
            <button onClick={() => navigate('/login')} className="text-emerald-500 font-extrabold hover:underline underline-offset-4">
              Sign in instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
