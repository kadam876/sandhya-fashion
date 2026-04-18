import { Outlet } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, ChevronDown, Package, Settings, Instagram, Twitter, Facebook, MapPin, Mail, Phone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { getTotalItems, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Modern Glassmorphic Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 py-3' : 'bg-white/0 backdrop-blur-none py-5'} absolute top-0`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl md:bg-transparent rounded-2xl md:rounded-none px-4 md:px-0 py-3 md:py-0 shadow-sm md:shadow-none border md:border-none border-gray-100">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-xl leading-none">S</span>
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Sandhya</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 bg-white/60 backdrop-blur-md px-8 py-3 rounded-full border border-gray-100/50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
              {['Home', 'Shop', 'About', 'Contact'].map((item) => (
                <NavLink 
                  key={item}
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                  className={({ isActive }) => 
                    `text-sm font-semibold transition-all duration-300 ${
                      isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-500'
                    }`
                  }
                >
                  {item}
                </NavLink>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-5">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-48 bg-white/50 border border-gray-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all focus:w-64 focus:bg-white shadow-sm"
                />
              </form>
              
              {isAuthenticated ? (
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setAccountOpen((o) => !o)}
                    className="flex items-center space-x-2 pl-1 pr-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-sm font-bold shadow-inner">
                      {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform ${accountOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                      <div className="px-5 py-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-b border-gray-50 flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-lg font-bold shadow-md">
                          {(user?.name || user?.email || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate font-medium">{user?.email}</p>
                        </div>
                      </div>
                      <div className="p-2">
                        <button onClick={() => { navigate('/profile'); setAccountOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors">
                           <Settings size={18} /><span>Profile Settings</span>
                        </button>
                        <button onClick={() => { navigate('/my-orders'); setAccountOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-colors mt-1">
                           <Package size={18} /><span>My Orders</span>
                        </button>
                        <div className="h-px bg-gray-100 my-2" />
                        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                           <LogOut size={18} /><span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gray-900 text-white rounded-full font-semibold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                >
                  <User size={16} />
                  <span>Sign In</span>
                </button>
              )}
              
              <button 
                onClick={openCart}
                className="relative p-2.5 bg-white border border-gray-100 rounded-full text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 shadow-sm transition-all"
              >
                <ShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center border-2 border-white shadow-sm">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <button onClick={openCart} className="relative text-gray-700 hover:text-emerald-600">
                <ShoppingCart size={22} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700 hover:text-emerald-600 transition-colors p-1 bg-gray-100 rounded-lg">
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className={`md:hidden absolute w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[500px] py-4' : 'max-h-0 py-0 border-transparent shadow-none'}`}>
          <div className="px-6 space-y-2">
            {['Home', 'Shop', 'About', 'Contact'].map((item) => (
              <NavLink 
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `block px-4 py-3 rounded-xl font-bold ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {item}
              </NavLink>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-100">
              {isAuthenticated ? (
                  <div className="space-y-2">
                    <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">My Profile</button>
                    <button onClick={() => { navigate('/my-orders'); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 rounded-xl">My Orders</button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 font-semibold text-red-600 hover:bg-red-50 rounded-xl">Sign Out</button>
                  </div>
                ) : (
                  <button onClick={() => navigate('/login')} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center space-x-2">
                    <User size={18} /><span>Sign In to Your Account</span>
                  </button>
                )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Space */}
      <main className="flex-grow pt-24 pb-10">
        <Outlet />
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#0A0A0A] text-gray-300 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
            <div className="col-span-1 md:col-span-1 lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl leading-none">S</span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Sandhya Fashion</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-8">
                Elevating the wholesale fashion experience. We supply premium apparel directly from top-tier manufacturers to retailers perfectly suited for your boutique.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors duration-300"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors duration-300"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors duration-300"><Twitter size={18} /></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Quick Links</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><NavLink to="/about" className="hover:text-emerald-400 transition-colors">Our Story</NavLink></li>
                <li><NavLink to="/shop" className="hover:text-emerald-400 transition-colors">Shop Catalog</NavLink></li>
                <li><NavLink to="/contact" className="hover:text-emerald-400 transition-colors">Help & Contact</NavLink></li>
                <li><NavLink to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</NavLink></li>
                <li><NavLink to="/refund" className="hover:text-emerald-400 transition-colors">Refund Policy</NavLink></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide text-sm uppercase">Contact Us</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li className="flex items-start space-x-3">
                  <Phone className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-400">+91 7574927364</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Mail className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-400">Sandhyafashion39@gmail.com</span>
                </li>
                <li className="flex items-start space-x-3">
                  <MapPin className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-400">Shop No- B/5083, Global Textile Market,<br/>Surat 395010</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-medium">
            <p>&copy; 2026 Sandhya Fashion. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
