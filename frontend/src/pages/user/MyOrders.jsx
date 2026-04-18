import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Printer, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, XCircle, CreditCard } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import { useCart } from '../../contexts/CartContext';

const STATUS_CONFIG = {
  PENDING:   { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
  SHIPPED:   { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck },
  DELIVERED: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
  CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { retryPayment } = useCart();
  const [payingOrderId, setPayingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.MY_ORDERS, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError('Could not load your orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handlePrint = (order) => {
    const subtotal = order.subtotal ?? order.totalAmount ?? 0;
    const gst = order.gstAmount ?? (subtotal * 0.05);
    const platform = order.platformCharge ?? (subtotal * 0.02);
    const grandTotal = order.totalAmount ?? (subtotal + gst + platform);

    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice #${order.id?.slice(-8).toUpperCase()}</title>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; padding: 32px; color: #111; max-width: 800px; margin: 0 auto; }
        h2 { color: #059669; margin-bottom: 24px; font-weight: 800; font-size: 28px; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { border-bottom: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; }
        th { background: #f9fafb; color: #374151; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; }
        .total { font-weight: bold; font-size: 1.25em; color: #111827; }
        .meta { margin-bottom: 8px; color: #4b5563; }
        .meta strong { color: #111827; }
        .bill-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
        .bill-total { display: flex; justify-content: space-between; padding: 10px 0; font-weight: 800; font-size: 1.1em; border-top: 2px solid #111; margin-top: 4px; }
      </style></head><body>
      <h2>Sandhya Fashion — Invoice</h2>
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 32px;">
        <p class="meta"><strong>Order ID:</strong> #${order.id?.slice(-8).toUpperCase()}</p>
        <p class="meta"><strong>Date:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : '—'}</p>
        <p class="meta"><strong>Status:</strong> ${order.status}</p>
        <p class="meta"><strong>Payment:</strong> ${order.paymentMethod || '—'}</p>
        <p class="meta"><strong>Shipping Address:</strong> ${order.shippingAddress || '—'}</p>
        ${order.trackingNumber ? `<p class="meta"><strong>Tracking #:</strong> ${order.trackingNumber}</p>` : ''}
      </div>
      <table>
        <thead><tr><th>Product</th><th>Size</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
        <tbody>
          ${(order.items || []).map(item => `
            <tr>
              <td style="font-weight: 500;">${item.productName || item.productId}</td>
              <td>${item.selectedSize || '—'}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unitPrice?.toFixed(2) ?? '—'}</td>
              <td style="font-weight: 600;">₹${item.totalPrice?.toFixed(2) ?? '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      <div style="margin-top: 32px; text-align: right;">
        <div class="bill-row"><span>Subtotal (price × sizes × qty)</span><span>₹${subtotal.toFixed(2)}</span></div>
        <div class="bill-row"><span>GST (5%)</span><span>₹${gst.toFixed(2)}</span></div>
        <div class="bill-row"><span>Platform Charges (2%)</span><span>₹${platform.toFixed(2)}</span></div>
        <div class="bill-total"><span>Total Payable</span><span style="color:#059669;">₹${grandTotal.toFixed(2)}</span></div>
        ${order.savings ? `<p style="color: #059669; font-weight: 500; margin-top:8px;">Total Savings: ₹${order.savings.toFixed(2)}</p>` : ''}
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 sticky top-0 md:top-[72px] z-40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 md:py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order History</h1>
              {!error && orders.length > 0 && (
                <p className="text-sm font-medium text-gray-500 mt-1">Review and track your recent wholesale orders</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-6 py-4 font-medium shadow-sm">
            {error}
          </div>
        )}

        {!error && orders.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Package size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No active orders</h2>
            <p className="text-gray-500 font-medium mb-8">Your order history is securely tracked right here.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md transition-colors"
            >
              Explore Catalog
            </button>
          </div>
        )}

        <div className="space-y-5">
          {orders.map(order => {
            const isExpanded = expandedOrder === order.id;
            const statusConfig = STATUS_CONFIG[order.status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Package };
            const StatusIcon = statusConfig.icon;
            const orderId = order.id?.slice(-8).toUpperCase();
            const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
                {/* Order summary row */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-6 cursor-pointer hover:bg-gray-50/80 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${statusConfig.color.split(' ')[0]} ${statusConfig.color.split(' ')[2]}`}>
                      <StatusIcon size={24} className={statusConfig.color.split(' ')[1]} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-gray-900 text-lg tracking-tight">Order #{orderId}</span>
                      <span className="text-sm font-medium text-gray-500">{orderDate} · {order.items?.length ?? 0} item(s)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
                    <div className="flex flex-col sm:items-end">
                       <span className={`text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${statusConfig.color} mb-1 w-max block`}>
                         {order.status}
                       </span>
                       <span className="font-black text-gray-900 text-lg">₹{order.totalAmount?.toFixed(2) ?? '—'}</span>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600' : ''}`}>
                       <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 bg-gray-50/30">
                    {/* Meta info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6">
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Payment Method</p>
                        <p className="font-bold text-gray-900">{order.paymentMethod || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Order Type</p>
                        <p className="font-bold text-gray-900">{order.orderType || '—'}</p>
                      </div>
                      <div className="col-span-2 md:col-span-2">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Shipping Address</p>
                        <p className="font-medium text-gray-700 line-clamp-2">{order.shippingAddress || '—'}</p>
                      </div>
                      {order.trackingNumber && (
                        <div className="col-span-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tracking Number</p>
                          <p className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg inline-block">{order.trackingNumber}</p>
                        </div>
                      )}
                      {order.deliveryDate && (
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Est. Delivery</p>
                          <p className="font-bold text-gray-900 px-2 py-1.5 bg-gray-100 rounded-lg inline-block">{new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</p>
                      <div className="space-y-3">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm bg-white border border-gray-100 shadow-sm rounded-xl px-5 py-4">
                            <div className="mb-2 sm:mb-0">
                              <p className="font-extrabold text-gray-900 text-base mb-1">{item.productName || item.productId}</p>
                              <div className="flex gap-3 text-xs font-medium text-gray-500">
                                 <span className="bg-gray-100 px-2 py-1 rounded-md">Size: {item.selectedSize || '—'}</span>
                                 <span className="bg-gray-100 px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs text-gray-400 font-medium mb-0.5">Subtotal</p>
                               <p className="font-black text-emerald-600 text-lg">₹{item.totalPrice?.toFixed(2) ?? '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals + Print */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200/60 mt-4 gap-4">
                      <div className="w-full sm:w-auto mb-4 sm:mb-0">
                        {/* Bill breakdown */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm min-w-[260px]">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bill Summary</p>
                          {(() => {
                            const sub = order.subtotal ?? order.totalAmount ?? 0;
                            const gst = order.gstAmount ?? (sub * 0.05);
                            const platform = order.platformCharge ?? (sub * 0.02);
                            const grand = order.totalAmount ?? (sub + gst + platform);
                            return (
                              <>
                                <div className="flex justify-between text-gray-600">
                                  <span>Subtotal</span>
                                  <span>₹{sub.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>GST (5%)</span>
                                  <span>₹{gst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Platform Charges (2%)</span>
                                  <span>₹{platform.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-black text-gray-900 border-t border-gray-200 pt-2 mt-1 text-base">
                                  <span>{order.status === 'PAID' ? 'Total Paid' : 'Total Amount'}</span>
                                  <span className="text-emerald-600">₹{grand.toFixed(2)}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        {order.savings > 0 && <p className="text-emerald-500 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full inline-block mt-2">You saved ₹{order.savings.toFixed(2)}!</p>}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {order.status === 'PENDING' && order.paymentMethod === 'RAZORPAY' && (
                          <button
                            onClick={async () => {
                              setPayingOrderId(order.id);
                              try {
                                const res = await retryPayment(order);
                                if (res?.success) {
                                  // Refresh orders list
                                  const refreshRes = await fetch(API_ENDPOINTS.MY_ORDERS, { headers: getAuthHeaders() });
                                  if (refreshRes.ok) setOrders(await refreshRes.json());
                                }
                              } catch (err) {
                                alert('Payment failed. Please try again.');
                              } finally {
                                setPayingOrderId(null);
                              }
                            }}
                            disabled={payingOrderId === order.id}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            <CreditCard size={18} />
                            {payingOrderId === order.id ? 'Processing...' : 'Complete Payment'}
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(order)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all"
                        >
                          <Printer size={18} />
                          Download Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
