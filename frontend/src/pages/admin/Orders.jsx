import {
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
  X,
  Ban,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';

/** UI filter value -> backend Order.status */
const STATUS_TO_API = {
  awaiting: 'PENDING_CONFIRMATION',
  confirmed: 'CONFIRMED',
  pending: 'PENDING',
  shipped: 'SHIPPED',
  delivered: 'DELIVERED',
};

function mapApiOrderToRow(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const first = items[0];
  const totalQty = items.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0);
  const productSummary =
    items.length === 0
      ? '—'
      : items.length === 1
        ? first?.productName || 'Item'
        : `${items.length} items`;

  const status = (order.status || 'PENDING').toString();
  const statusLower = status.toLowerCase();
  const paymentRaw = order.paymentMethod ? String(order.paymentMethod) : '';
  const paymentStatus = paymentRaw ? paymentRaw.toLowerCase() : 'pending';

  return {
    id: order.id,
    customer: order.userId || '—',
    product: productSummary,
    quantity: totalQty || Number(first?.quantity) || 0,
    totalAmount: order.totalAmount != null ? Number(order.totalAmount) : 0,
    status,
    statusLower,
    paymentStatus,
    date: formatOrderDate(order.orderDate),
    orderDate: order.orderDate,
  };
}

function formatOrderDate(orderDate) {
  if (!orderDate) return 'N/A';
  try {
    const d = new Date(orderDate);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

function isPlacedToday(orderDate) {
  if (!orderDate) return false;
  const d = new Date(orderDate);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const Orders = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayOnly, setTodayOnly] = useState(true);
  const [newOrdersModalOpen, setNewOrdersModalOpen] = useState(false);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actionOrderId, setActionOrderId] = useState(null);

  const fetchPendingQueue = useCallback(async () => {
    setLoadingPending(true);
    try {
      const response = await fetch(API_ENDPOINTS.ORDERS_BY_STATUS('PENDING_CONFIRMATION'), {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch pending orders');
      }
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setPendingQueue(list.map(mapApiOrderToRow));
    } catch (e) {
      console.error(e);
      setPendingQueue([]);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    if (newOrdersModalOpen) {
      fetchPendingQueue();
    }
  }, [newOrdersModalOpen, fetchPendingQueue]);

  // Handle ?newOrder=true from dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('newOrder') === 'true') {
      setNewOrdersModalOpen(true);
    }
  }, [location.search]);

  const acceptOrRejectOrder = async (orderId, nextStatus) => {
    setActionOrderId(orderId);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_UPDATE_ORDER_STATUS(orderId), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        throw new Error('Update failed');
      }
      await fetchPendingQueue();
      await fetchOrders();
    } catch (e) {
      console.error(e);
      alert('Could not update the order. Please try again.');
    } finally {
      setActionOrderId(null);
    }
  };

  const handleAcceptOrder = (orderId) => acceptOrRejectOrder(orderId, 'CONFIRMED');

  const handleRejectOrder = (orderId) => {
    if (
      !window.confirm(
        'Reject this order? It will be marked as cancelled. Stock is not automatically restored.'
      )
    ) {
      return;
    }
    acceptOrRejectOrder(orderId, 'CANCELLED');
  };

  const handleExportCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      alert('No orders to export with current filters.');
      return;
    }

    const headers = [
      'Order ID',
      'Customer',
      'Product',
      'Quantity',
      'Total Amount (INR)',
      'Status',
      'Payment Status',
      'Order Date',
    ];

    const rows = filteredOrders.map((order) => [
      `"${order.id}"`, // Wrap in quotes to handle potential commas or long numbers
      `"${order.customer}"`,
      `"${order.product}"`,
      order.quantity,
      order.totalAmount,
      `"${order.status}"`,
      `"${order.paymentStatus}"`,
      `"${order.date}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `sandhya_orders_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Always fetch all orders to maintain accurate counts in the status cards
      const url = API_ENDPOINTS.ADMIN_ORDERS;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setOrders(list.map(mapApiOrderToRow));
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []); // Removed statusFilter dependency to prevent re-fetching on filter change

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const visibleByDate = todayOnly ? orders.filter((o) => isPlacedToday(o.orderDate)) : orders;

  const filteredOrders = visibleByDate.filter((order) => {
    // 1. Status Filter (Client-side)
    if (statusFilter !== 'all') {
      const targetApiStatus = STATUS_TO_API[statusFilter] || statusFilter.toUpperCase();
      if (order.status.toUpperCase() !== targetApiStatus.toUpperCase()) {
        return false;
      }
    }

    // 2. Search Term Filter
    const searchMatch =
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.product || '').toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  const getStatusColor = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING_CONFIRMATION':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return <CheckCircle size={16} />;
      case 'SHIPPED':
        return <Truck size={16} />;
      case 'PENDING':
        return <Clock size={16} />;
      case 'CONFIRMED':
        return <CheckCircle size={16} />;
      case 'PENDING_CONFIRMATION':
        return <Clock size={16} />;
      case 'CANCELLED':
        return <Ban size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatStatusLabel = (status) => {
    const s = (status || 'PENDING').toString().toUpperCase();
    if (s === 'PENDING_CONFIRMATION') return 'Awaiting Acceptance';
    if (s === 'CONFIRMED') return 'Confirmed';
    if (s === 'PENDING') return 'Pending Shipment';
    if (s === 'SHIPPED') return 'Shipped';
    if (s === 'DELIVERED') return 'Delivered';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  const formatPaymentLabel = (paymentStatus) => {
    const p = (paymentStatus || 'pending').toString();
    if (!p) return '—';
    return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 animate-pulse space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-40" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 px-6 py-4 border-b border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
          ))}
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
            type="button"
            onClick={() => fetchOrders()}
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Today&apos;s Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {todayOnly
              ? `Showing orders placed today (${visibleByDate.length} total loaded)`
              : `Showing all orders (${orders.length})`}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            id="today-only-filter"
            name="todayOnly"
            type="checkbox"
            checked={todayOnly}
            onChange={(e) => setTodayOnly(e.target.checked)}
            className="rounded border-gray-300 text-[#00B67A] focus:ring-[#00B67A]"
          />
          Today only
        </label>
      </div>

      <div className="flex justify-end gap-3 mb-6">
        <button
          type="button"
          onClick={() => setNewOrdersModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Package size={20} />
          <span>New Order</span>
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={20} />
          <span>Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`text-left bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${statusFilter === 'all' ? 'ring-2 ring-[#00B67A]' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{visibleByDate.length}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`text-left bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {visibleByDate.filter((o) => o.statusLower === 'pending' || o.status.toUpperCase() === 'PENDING').length}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('shipped')}
          className={`text-left bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${statusFilter === 'shipped' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Shipped</p>
              <p className="text-2xl font-bold text-gray-900">
                {visibleByDate.filter((o) => o.statusLower === 'shipped' || o.status.toUpperCase() === 'SHIPPED').length}
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Truck className="text-blue-600" size={24} />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('delivered')}
          className={`text-left bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${statusFilter === 'delivered' ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {visibleByDate.filter((o) => o.statusLower === 'delivered' || o.status.toUpperCase() === 'DELIVERED').length}
              </p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="order-search"
                name="orderSearch"
                type="text"
                placeholder="Search by order ID, customer, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      {todayOnly && visibleByDate.length === 0 && orders.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm">
          No orders placed today. Uncheck &quot;Today only&quot; to see older orders.
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Order Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {orders.length === 0
                      ? 'No orders yet for your shop.'
                      : 'No orders match your filters.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{order.product}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.quantity} pcs</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{(order.totalAmount ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{formatStatusLabel(order.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.paymentStatus === 'paid' || order.paymentStatus === 'cod'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {formatPaymentLabel(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          className="text-[#00B67A] hover:text-green-700 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Order State Transition Buttons */}
                        {order.status.toUpperCase() === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => acceptOrRejectOrder(order.id, 'PENDING')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                          >
                            Confirm Payment
                          </button>
                        )}

                        {order.status.toUpperCase() === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => acceptOrRejectOrder(order.id, 'SHIPPED')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                          >
                            Ship Order
                          </button>
                        )}

                        {order.status.toUpperCase() === 'SHIPPED' && (
                          <button
                            type="button"
                            onClick={() => acceptOrRejectOrder(order.id, 'DELIVERED')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow-sm text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {newOrdersModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-orders-modal-title"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 id="new-orders-modal-title" className="text-xl font-bold text-gray-900">
                  Orders awaiting acceptance
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Pending orders you can accept or reject
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNewOrdersModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingPending ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Loader2 className="animate-spin mb-3 text-[#00B67A]" size={40} />
                  Loading pending orders…
                </div>
              ) : pendingQueue.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Package className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="font-medium text-gray-700">No pending orders</p>
                  <p className="text-sm mt-1">New customer orders will appear here for acceptance.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {pendingQueue.map((order) => (
                    <li
                      key={order.id}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50/80 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Order ID
                          </p>
                          <p className="text-sm font-mono text-gray-900 break-all">{order.id}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium text-gray-700">Customer:</span> {order.customer}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Items:</span> {order.product} (
                            {order.quantity} pcs)
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Total:</span> ₹
                            {(order.totalAmount ?? 0).toLocaleString('en-IN')} ·{' '}
                            <span className="font-medium text-gray-700">Placed:</span> {order.date}
                          </p>
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={actionOrderId === order.id}
                            onClick={() => handleAcceptOrder(order.id)}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#00B67A] text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionOrderId === order.id ? (
                              <Loader2 className="animate-spin mx-auto" size={18} />
                            ) : (
                              'Accept'
                            )}
                          </button>
                          <button
                            type="button"
                            disabled={actionOrderId === order.id}
                            onClick={() => handleRejectOrder(order.id)}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => fetchPendingQueue()}
                className="text-sm text-[#00B67A] font-medium hover:underline"
              >
                Refresh list
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
