import { TrendingUp, Package, ShoppingCart, Users, Plus, Tag, Bell, Settings, X, Loader2, ExternalLink, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';



const Dashboard = () => {
  const navigate = useNavigate();
  const [predictionRange, setPredictionRange] = useState('7d');
  const [salesRange, setSalesRange] = useState('month');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [orderStatusData, setOrderStatusData] = useState(null);
  const [topProducts, setTopProducts] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [topProductsLimit, setTopProductsLimit] = useState(10);
  const [isTopProductsLoading, setIsTopProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [salesRange]);

  const fetchDashboardData = async () => {
    console.log('[Dashboard Debug] Starting fetchDashboardData...');
    console.log('[Dashboard Debug] API_ENDPOINTS.ANALYTICS_DASHBOARD_FULL:', API_ENDPOINTS.ANALYTICS_DASHBOARD_FULL);
    
    setLoading(true);
    try {
      const h = { headers: getAuthHeaders() };
      const fetchUrl = `${API_ENDPOINTS.ANALYTICS_DASHBOARD_FULL}?period=${salesRange}`;
      console.log('[Dashboard Debug] Fetching from:', fetchUrl);

      // Try the combined endpoint first (faster), fall back to parallel calls
      const fullRes = await fetch(fetchUrl, h);
      console.log('[Dashboard Debug] Combined endpoint response status:', fullRes.status);

      if (fullRes.ok) {
        const data = await fullRes.json();
        console.log('[Dashboard Debug] Successfully fetched full dashboard data');
        setDashboardStats(data.stats);
        setSalesData(data.sales);
        setCategoryData(data.categories);
        setOrderStatusData(data.orderStatus);
        setTopProducts(data.topProducts);
        setPredictionData(data.predictions);
      } else {
        console.warn('[Dashboard Debug] Full dashboard fetch failed, falling back to parallel calls');
        // Fallback: parallel calls (works with old backend)
        const [statsRes, salesRes, categoryRes, statusRes, topRes, predRes] = await Promise.all([
          fetch(API_ENDPOINTS.ADMIN_DASHBOARD, h),
          fetch(`${API_ENDPOINTS.ANALYTICS_SALES}?period=${salesRange}`, h),
          fetch(API_ENDPOINTS.ANALYTICS_CATEGORIES, h),
          fetch(API_ENDPOINTS.ANALYTICS_ORDER_STATUS, h),
          fetch(`${API_ENDPOINTS.ADMIN_TOP_PRODUCTS}?limit=10`, h),
          fetch(API_ENDPOINTS.ADMIN_PREDICTIONS, h),
        ]);
        
        console.log('[Dashboard Debug] Fallback responses:', {
          stats: statsRes.status,
          sales: salesRes.status,
          categories: categoryRes.status,
          status: statusRes.status
        });

        const [stats, sales, cats, status, top, pred] = await Promise.all([
          statsRes.ok ? statsRes.json() : null,
          salesRes.ok ? salesRes.json() : null,
          categoryRes.ok ? categoryRes.json() : null,
          statusRes.ok ? statusRes.json() : null,
          topRes.ok ? topRes.json() : null,
          predRes.ok ? predRes.json() : null,
        ]);
        setDashboardStats(stats);
        setSalesData(sales);
        setCategoryData(cats);
        setOrderStatusData(status);
        setTopProducts(top);
        setPredictionData(pred);
      }

      setError(null);
    } catch (error) {
      console.error('[Dashboard Debug] Error in fetchDashboardData:', error);
      setError(`Failed to load dashboard data: ${error.message}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async (limit) => {
    setIsTopProductsLoading(true);
    try {
      const topResponse = await fetch(`${API_ENDPOINTS.ADMIN_TOP_PRODUCTS}?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (topResponse.ok) {
        const topResult = await topResponse.json();
        setTopProducts(topResult);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setIsTopProductsLoading(false);
    }
  };

  const handleTopProductsLimitUpdate = () => {
    const limit = parseInt(topProductsLimit, 10);
    if (!isNaN(limit) && limit > 0) {
      fetchTopProducts(limit);
    }
  };

  const handleBestsellerClick = async (productId) => {
    setProductDetailLoading(true);
    setSelectedProduct(null);
    try {
      const res = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(productId), {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setSelectedProduct(data);
    } catch {
      // fallback: navigate to product page
      navigate(`/product/${productId}`);
    } finally {
      setProductDetailLoading(false);
    }
  };


  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const COLORS = ['#00B67A', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 animate-pulse space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-56" />
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded-lg w-32" />
            <div className="h-10 bg-gray-200 rounded-lg w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-10" />
              </div>
              <div className="h-7 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-28" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 h-96" />
          <div className="bg-white rounded-2xl shadow-sm p-6 h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-red-600 underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/admin/orders?newOrder=true')}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus size={20} />
            <span>New Order</span>
          </button>
          <button 
            onClick={() => navigate('/admin/customers')}
            className="flex items-center space-x-2 px-4 py-2 bg-[#00B67A] text-white rounded-lg hover:bg-[#009c68] transition-colors shadow-md shadow-green-100"
          >
            <Users size={20} />
            <span>My Customers</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <span className={`text-sm font-medium ${dashboardStats?.productGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dashboardStats?.productGrowth >= 0 ? '+' : ''}{dashboardStats?.productGrowth || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.totalProducts || 0}</h3>
          <p className="text-gray-600 text-sm">Total Products</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="text-yellow-600" size={24} />
            </div>
            <span className={`text-sm font-medium ${dashboardStats?.lowStockGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dashboardStats?.lowStockGrowth > 0 ? '+' : ''}{dashboardStats?.lowStockGrowth || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.lowStockItems || 0}</h3>
          <p className="text-gray-600 text-sm">Low Stock Items</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
            <span className={`text-sm font-medium ${dashboardStats?.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dashboardStats?.orderGrowth >= 0 ? '+' : ''}{dashboardStats?.orderGrowth || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{dashboardStats?.totalOrders || 0}</h3>
          <p className="text-gray-600 text-sm">Total Orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
            <span className={`text-sm font-medium ${dashboardStats?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {dashboardStats?.revenueGrowth >= 0 ? '+' : ''}{dashboardStats?.revenueGrowth || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatPrice(dashboardStats?.totalRevenue || 0)}</h3>
          <p className="text-gray-600 text-sm">Total Revenue</p>
        </div>
      </div>

      {/* Layout Row 1: Sales vs Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
            <select
              value={salesRange}
              onChange={(e) => setSalesRange(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B67A] transition-all"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={salesData?.salesByDate || []}>
              <defs>
                <linearGradient id="colorSalesLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B67A" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#00B67A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value, name) => [name === 'sales' ? formatPrice(value) : value, name === 'sales' ? 'Revenue' : 'Orders']} 
              />
              <Legend verticalAlign="top" align="right" height={36}/>
              <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#3B82F6" barSize={30} radius={[4, 4, 0, 0]} opacity={0.6} />
              <Area yAxisId="left" type="monotone" dataKey="sales" name="sales" stroke="#00B67A" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesLine)" />
              <Line yAxisId="left" type="monotone" dataKey="sales" name="Revenue" stroke="#00B67A" strokeWidth={3} dot={{ r: 4, fill: '#00B67A' }} />
            </ComposedChart>
          </ResponsiveContainer>

        </div>

        {/* Prediction Graph */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-900">Sales Prediction</h2>
              <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Forecast</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={predictionData || []}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => formatPrice(value)} 
              />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Layout Row 2: Top Selling Products vs Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900">Bestselling Products</h2>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1 border border-gray-100">
              <input 
                id="top-products-limit"
                name="topProductsLimit"
                type="number" 
                value={topProductsLimit}
                onChange={(e) => setTopProductsLimit(e.target.value)}
                placeholder="Limit"
                className="w-16 px-2 py-1 bg-transparent text-sm font-bold focus:outline-none focus:ring-0 text-center"
              />
              <button 
                onClick={handleTopProductsLimitUpdate}
                disabled={isTopProductsLoading}
                className="px-3 py-1 bg-[#00B67A] text-white text-xs font-bold rounded-lg hover:bg-[#009c68] transition-colors disabled:opacity-50"
              >
                {isTopProductsLoading ? 'Refreshing...' : 'Apply'}
              </button>
            </div>
            <TrendingUp size={20} className="hidden sm:block text-[#00B67A] shrink-0" />
          </div>
          <div className="space-y-4">

            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-green-50/50 transition-all border border-transparent hover:border-green-100 group cursor-pointer"
                  onClick={() => handleBestsellerClick(product.productId)}
                >
                  <div className="relative">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-white shadow-sm border border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#00B67A]">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-[#00B67A] transition-colors">{product.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">Top Performer · click to view details</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-extrabold text-gray-900">{product.quantity} sold</p>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00B67A] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(product.quantity / topProducts[0].quantity) * 100}%` }}
                      />
                    </div>
                    <button
                      className="text-[10px] text-[#00B67A] font-bold flex items-center gap-0.5 hover:underline mt-0.5"
                      onClick={(e) => { e.stopPropagation(); navigate('/admin/inventory-dashboard', { state: { search: product.name } }); }}
                    >
                      Inventory <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              ))
            ) : (

              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package size={48} className="mb-2 opacity-20" />
                <p>No sales data available yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryData?.categories || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
                nameKey="category"
              >
                {(categoryData?.categories || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Order Status Distribution */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status Distribution</h2>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={orderStatusData?.statusDistribution || []}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
              nameKey="status"
            >
              {(orderStatusData?.statusDistribution || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Product Detail Modal */}
      {(productDetailLoading || selectedProduct) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {productDetailLoading ? (
              <div className="flex items-center justify-center p-16">
                <Loader2 className="animate-spin text-[#00B67A]" size={40} />
              </div>
            ) : selectedProduct && (
              <>
                <div className="relative">
                  <img
                    src={selectedProduct.imageUrl || 'https://picsum.photos/seed/product1/600/400.jpg'}
                    alt={selectedProduct.name}
                    className="w-full h-56 object-cover rounded-t-2xl"
                    onError={(e) => { e.target.src = 'https://picsum.photos/seed/product1/600/400.jpg'; }}
                  />
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 text-gray-600 hover:text-gray-900 shadow"
                  >
                    <X size={18} />
                  </button>
                  {selectedProduct.badge && (
                    <span className={`absolute top-3 left-3 ${selectedProduct.badgeColor || 'bg-orange-500'} text-white text-xs px-2 py-1 rounded`}>
                      {selectedProduct.badge}
                    </span>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedProduct.category}</p>
                  </div>

                  {/* Rating */}
                  {selectedProduct.ratings != null && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="text-yellow-400"
                          fill={i < Math.floor(Number(selectedProduct.ratings)) ? 'currentColor' : 'none'}
                        />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">({Number(selectedProduct.ratings).toFixed(1)})</span>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-extrabold text-[#00B67A]">₹{Math.round(selectedProduct.price || 0)}</span>
                    {selectedProduct.wholesalePrice && selectedProduct.wholesalePrice !== selectedProduct.price && (
                      <span className="text-sm text-gray-400 line-through">Wholesale: ₹{Math.round(selectedProduct.wholesalePrice)}</span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-2">
                    <Package size={16} className={selectedProduct.stockQuantity < 20 ? 'text-red-500' : 'text-green-500'} />
                    <span className={`text-sm font-semibold ${selectedProduct.stockQuantity < 20 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedProduct.stockQuantity} in stock
                      {selectedProduct.stockQuantity < 20 && ' — Low stock'}
                    </span>
                  </div>

                  {/* Sizes */}
                  {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Available Sizes</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map((size) => (
                          <span key={size} className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-gray-50">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedProduct.description && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setSelectedProduct(null); navigate('/admin/inventory-dashboard', { state: { search: selectedProduct.name } }); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00B67A] text-white rounded-xl font-semibold hover:bg-[#009c68] transition-colors"
                    >
                      <Package size={16} />
                      View in Inventory
                    </button>
                    <button
                      onClick={() => { setSelectedProduct(null); navigate(`/product/${selectedProduct.id}`); }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Full Page
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
