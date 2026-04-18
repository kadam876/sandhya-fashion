import { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Search, Filter, ArrowLeft, ExternalLink, UserCheck, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_USERS, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Could not load your customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return (
      name.includes(q) ||
      email.includes(q) ||
      (user.phone && String(user.phone).includes(searchTerm))
    );
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-gray-500 hover:text-[#00B67A] mb-2 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 text-[#00B67A]" size={32} />
            My Customers
          </h1>
          <p className="text-gray-600 mt-1">Manage and view customers registered at Sandhya Fashion</p>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-transparent outline-none w-64 text-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3 mt-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 px-6 py-4 bg-white rounded-lg">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-8 bg-gray-200 rounded w-8" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button 
            onClick={fetchUsers}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold"
          >
            Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <Users size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {searchTerm ? `No results for "${searchTerm}"` : "You don't have any registered customers yet. New customers will appear here automatically."}
          </p>
          {!searchTerm && (
            <div className="mt-8 p-4 bg-green-50 rounded-2xl inline-block border border-green-100">
              <p className="text-green-800 text-sm font-medium">Your Store ID:</p>
              <code className="text-[#00B67A] font-bold text-lg select-all">{currentUser?.id || '...'}</code>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact Info</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Orders</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((user) => {
                  const displayName = user.name || user.email || 'Customer';
                  const rowKey = user.id || user.email;
                  const idPreview =
                    typeof user.id === 'string' && user.id.length > 8
                      ? `${user.id.substring(0, 8)}…`
                      : user.id || '—';
                  return (
                  <tr key={rowKey} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00B67A] to-[#00db92] flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm group-hover:scale-110 transition-transform">
                          {String(displayName).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{displayName}</p>
                          <p className="text-xs text-gray-400">ID: {idPreview}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={14} className="mr-2 text-gray-400" />
                          {user.phone || 'No phone'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {user.orderCount != null ? Number(user.orderCount) : 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active !== false ? <UserCheck size={12} className="mr-1" /> : <UserMinus size={12} className="mr-1" />}
                        {user.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          title="View Details"
                          className="p-2 text-gray-400 hover:text-[#00B67A] hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {filteredUsers.length} total customers linked to your shop.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
