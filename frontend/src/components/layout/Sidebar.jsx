import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,

  Database,
  Menu,
  X,
  Users,
  Store
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const { role } = useAuth();
  const lowerRole = role?.toLowerCase();

  const getMenuItems = () => {
    // Single-shop version: only OWNER role has access to the admin menu.
    if (lowerRole === 'owner') {
      return [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          path: '/admin/dashboard'
        },
        {
          icon: ShoppingCart,
          label: "Today's Orders",
          path: '/admin/orders'
        },
        {
          icon: Database,
          label: 'Inventory Dashboard',
          path: '/admin/inventory-dashboard'
        },
        {
          icon: Users,
          label: 'Customers',
          path: '/admin/customers'
        }
      ];
    }

    // Default empty menu for other roles
    return [];
  };

  const menuItems = getMenuItems();

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
      }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-primary">
              Sandhya Fashion
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-[#00B67A] text-white shadow-lg transform scale-105 border-l-4 border-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                  }`}
              >
                <Icon size={20} />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
