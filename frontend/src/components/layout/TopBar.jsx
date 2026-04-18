import { Search, User, Bell, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TopBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/admin/inventory-dashboard', { state: { search: searchQuery.trim() } });
      setSearchQuery('');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B67A] focus:border-transparent transition-all"
            />
          </div>
        </form>

        {/* Admin Profile Section */}
        <div className="flex items-center space-x-4 ml-6">
          {/* Notifications and Settings Removed */}

          {/* Admin Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'Administrator'}</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
              title="Logout"
            >
              <LogOut size={20} className="text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
