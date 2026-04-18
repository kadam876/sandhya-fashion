import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, ArrowLeft, CheckCircle, FileText, Lock, Eye, EyeOff, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import PasswordStrength, { isPasswordValid } from '../../components/PasswordStrength';

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    gstNumber: user?.gstNumber || ''
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Change password state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });
  const [isSavingPw, setIsSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gstNumber: user.gstNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        gstNumber: formData.gstNumber || null
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePwChange = (e) => setPwData({ ...pwData, [e.target.name]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMessage({ type: '', text: '' });
    if (!isPasswordValid(pwData.newPassword)) {
      setPwMessage({ type: 'error', text: 'New password does not meet the requirements.' });
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setIsSavingPw(true);
    try {
      const res = await fetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword: pwData.currentPassword, newPassword: pwData.newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwMessage({ type: 'success', text: 'Password changed successfully!' });
        setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPwMessage({ type: '', text: '' }), 3000);
      } else {
        setPwMessage({ type: 'error', text: data.message || data.error || 'Failed to change password.' });
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSavingPw(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:shadow-md transition-all border border-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
              <p className="text-gray-500 font-medium mt-1">Manage your professional profile and security</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Quick Profile Summary & Status */}
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] rounded-3xl p-8 border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-400 to-teal-500" />
               <div className="relative pt-12 flex flex-col items-center">
                 <div className="w-28 h-28 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white mb-5">
                   <span className="text-4xl font-extrabold text-emerald-500">
                     {(user?.name || user?.email || 'U')[0].toUpperCase()}
                   </span>
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h2>
                 <p className="text-gray-500 font-medium mb-6">{user?.email}</p>
                 
                 <div className="w-full bg-emerald-50 rounded-2xl p-4 flex items-start space-x-3 border border-emerald-100/50">
                    <ShieldCheck className="text-emerald-500 mt-0.5" size={20} />
                    <div className="flex-1 text-left">
                       <p className="text-sm font-bold text-emerald-900">Verified Retailer</p>
                       <p className="text-xs text-emerald-600 mt-1 font-medium">Your account is fully verified to access wholesale catalogs & pricing.</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Quick Actions/Stats */}
            <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
               <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20" />
               <h3 className="text-lg font-bold mb-2">My Orders</h3>
               <p className="text-gray-400 text-sm mb-6 font-medium">Track your wholesale shipments and view past order invoices.</p>
               <button 
                  onClick={() => navigate('/my-orders')}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center space-x-2"
               >
                 <Tag size={18} />
                 <span>View Order History</span>
               </button>
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="lg:w-2/3 flex flex-col gap-8">
            
            {/* Personal Information */}
            <div className="bg-white shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] rounded-3xl border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <User size={20} className="text-emerald-500" /> Personal Details
                 </h2>
              </div>
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {message.text && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
                      message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500' : 'bg-red-50 text-red-700 border-l-4 border-red-500'
                    }`}>
                      {message.type === 'success' && <CheckCircle size={20} />}
                      <span className="text-sm font-semibold">{message.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-11 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-800"
                          placeholder="Your Name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Email Address <span className="text-xs font-medium text-gray-400">(Permanent)</span></label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                          name="email"
                          type="email"
                          disabled
                          value={formData.email}
                          className="pl-11 w-full px-4 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-gray-500 cursor-not-allowed outline-none font-medium"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-11 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-800"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>

                    {/* GST Number */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        GST Number <span className="text-gray-400 font-medium text-xs">(optional)</span>
                      </label>
                      <div className="relative group">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                          name="gstNumber"
                          type="text"
                          value={formData.gstNumber}
                          onChange={handleChange}
                          maxLength={15}
                          className="pl-11 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-800 uppercase placeholder-gray-400"
                          placeholder="22AAAAA0000A1Z5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-sm font-bold text-gray-700">Shipping Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <textarea
                        name="address"
                        required
                        rows={4}
                        value={formData.address}
                        onChange={handleChange}
                        className="pl-11 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-800 resize-none"
                        placeholder="Enter your full business or warehouse shipping address..."
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving || authLoading}
                      className="px-8 py-3.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold rounded-full shadow-md hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={18} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] rounded-3xl border border-gray-100 overflow-hidden mb-8">
               <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                 <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                   <Lock size={20} className="text-emerald-500" /> Security Settings
                 </h2>
              </div>
              <div className="p-8">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  {pwMessage.text && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${
                      pwMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500' : 'bg-red-50 text-red-700 border-l-4 border-red-500'
                    }`}>
                      {pwMessage.type === 'success' && <CheckCircle size={20} />}
                      <span className="text-sm font-semibold">{pwMessage.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current password */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700">Current Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                          name="currentPassword" type={showPw ? 'text' : 'password'} required
                          value={pwData.currentPassword} onChange={handlePwChange}
                          className="pl-11 pr-12 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-800"
                          placeholder="Enter your current password"
                        />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* New password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                          name="newPassword" type={showPw ? 'text' : 'password'} required
                          value={pwData.newPassword} onChange={handlePwChange}
                          className="pl-11 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-800"
                          placeholder="Your new password"
                        />
                      </div>
                      <div className="pt-2">
                         <PasswordStrength password={pwData.newPassword} />
                      </div>
                    </div>

                    {/* Confirm new password */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Confirm New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                          name="confirmPassword" type={showPw ? 'text' : 'password'} required
                          value={pwData.confirmPassword} onChange={handlePwChange}
                          className="pl-11 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-gray-800"
                          placeholder="Confirm new password"
                        />
                      </div>
                      {pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword && (
                        <p className="text-xs font-bold text-red-500 mt-2">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                      type="submit" disabled={isSavingPw}
                      className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-full hover:border-gray-900 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                      {isSavingPw
                        ? <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        : <><Lock size={18} /> <span>Update Password</span></>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
