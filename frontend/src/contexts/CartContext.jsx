import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, getAuthHeaders, STORAGE_KEYS } from '../config';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  const [cartItems, setCartItems] = useState(() => {
    // For initial synchronous boot, check local storage (will be [] if logged in usually)
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (error) {
        localStorage.removeItem(STORAGE_KEYS.CART);
      }
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Checkout
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Synchronization with Backend / Auth Changes
  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated) {
        // Authenticated: merge any lingering local cart, then pull authoritative cart from server
        try {
          const localCart = localStorage.getItem(STORAGE_KEYS.CART);
          let payload = [];
          if (localCart) {
            payload = JSON.parse(localCart).map(item => ({
              ...item,
              productId: item.productId || item.id,
              id: undefined // Remove legacy browser string ID to prevent Mongo cast errors
            }));
          }
          
          const response = await fetch(API_ENDPOINTS.CART + '/merge', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
          });
          
          if (response.ok) {
            const serverCart = await response.json();
            setCartItems(serverCart);
            // Wipe local storage now that backend tracks it
            localStorage.removeItem(STORAGE_KEYS.CART);
          }
        } catch (error) {
          console.error('Failed to sync DB cart', error);
        }
      } else {
         // Logged out: wipe active memory cart, but leave whatever is implicitly in localStorage (usually empty).
         // Actually, standard behavior on logout is empty cart.
         setCartItems([]);
         localStorage.removeItem(STORAGE_KEYS.CART);
      }
    };
    
    syncCart();
  }, [isAuthenticated]);

  // Save cart to localStorage whenever it changes IF NOT AUTHENTICATED
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = async (product, selectedSize, quantity = 1) => {
    const { image, ...cleanProduct } = product; // Strip heavy base64
    const itemData = {
      ...cleanProduct,
      productId: cleanProduct.id,
      selectedSize,
      quantity,
    };

    if (isAuthenticated) {
      try {
        const res = await fetch(API_ENDPOINTS.CART, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(itemData)
        });
        if (res.ok) {
          const updatedCart = await res.json();
          setCartItems(updatedCart);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Local fallback logic
      const isWholesale = cleanProduct.isWholesale;
      const matchCriteria = isWholesale 
        ? (i => i.id === cleanProduct.id && i.isWholesale) 
        : (i => i.id === cleanProduct.id && i.selectedSize === selectedSize);
        
      const existing = cartItems.find(matchCriteria);
      if (existing) {
        setCartItems(cartItems.map(item => 
          matchCriteria(item) ? { ...item, quantity: item.quantity + quantity } : item
        ));
      } else {
        setCartItems([...cartItems, itemData]);
      }
    }
  };

  const removeFromCart = async (itemId, selectedSize) => {
    if (isAuthenticated) {
      // Find the specific Mongo CartItem ID based on the product match
      const targetItem = cartItems.find(item => item.productId === itemId && (item.selectedSize === selectedSize || item.isWholesale));
      if (targetItem && targetItem.id) {
         try {
           const res = await fetch(`${API_ENDPOINTS.CART}/${targetItem.id}`, {
             method: 'DELETE',
             headers: getAuthHeaders()
           });
           if (res.ok) {
             const updatedCart = await res.json();
             setCartItems(updatedCart);
           }
         } catch(e) {}
      }
    } else {
      setCartItems(cartItems.filter(
        item => !(item.productId === itemId && item.selectedSize === selectedSize)
      ));
    }
  };

  const updateQuantity = async (itemId, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, selectedSize);
      return;
    }

    if (isAuthenticated) {
      const targetItem = cartItems.find(item => item.productId === itemId && (item.selectedSize === selectedSize || item.isWholesale));
      if (targetItem && targetItem.id) {
         try {
           const res = await fetch(`${API_ENDPOINTS.CART}/${targetItem.id}/quantity?quantity=${newQuantity}`, {
             method: 'PUT',
             headers: getAuthHeaders()
           });
           if (res.ok) setCartItems(await res.json());
         } catch(e) {}
      }
    } else {
      setCartItems(cartItems.map(item =>
        item.productId === itemId && item.selectedSize === selectedSize
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await fetch(`${API_ENDPOINTS.CART}/clear`, { method: 'DELETE', headers: getAuthHeaders() });
      } catch(e) {}
    }
    setCartItems([]);
  };

  const GST_RATE = 0.05;        // 5%
  const PLATFORM_RATE = 0.02;   // 2%

  // For wholesale: price is per set; 1 set = piecesPerSet pieces (default 4)
  // So item subtotal = wholesalePrice * quantity (sets) — price already covers all sizes in a set
  const getItemPrice = (item) => item.isWholesale ? (item.wholesalePrice || item.specialPrice || item.price || 0) : (item.specialPrice || item.price || 0);
  const getItemOriginalPrice = (item) => item.factoryPrice || item.originalPrice || getItemPrice(item);
  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  // Subtotal: for retail items, price × quantity × number of sizes selected (pieces per set)
  // For wholesale items, price is already per set (covers all sizes), so just price × quantity
  const getItemSubtotal = (item) => {
    const price = getItemPrice(item);
    if (item.isWholesale) {
      return price * item.quantity;
    }
    // Retail: price is per single piece; multiply by number of sizes in the set
    const sizesCount = item.piecesPerSet || (item.sizes?.length) || 4;
    return price * sizesCount * item.quantity;
  };

  const getSubtotal = () => cartItems.reduce((total, item) => total + getItemSubtotal(item), 0);
  const getGST = () => getSubtotal() * GST_RATE;
  const getPlatformCharge = () => getSubtotal() * PLATFORM_RATE;
  const getTotalPrice = () => getSubtotal() + getGST() + getPlatformCharge();

  const getTotalSavings = () => cartItems.reduce((total, item) => {
    const savings = (getItemOriginalPrice(item) - getItemPrice(item)) * item.quantity;
    return total + (savings > 0 ? savings : 0);
  }, 0);

  const openCart = (step = 1) => {
    setCheckoutStep(step);
    setIsCartOpen(true);
  };
  const closeCart = () => setIsCartOpen(false);

  const checkout = async (shippingAddress, paymentMethod = 'COD') => {
    setLoading(true);
    setError(null);
    try {
      const subtotal = getSubtotal();
      const gst = getGST();
      const platformCharge = getPlatformCharge();
      const grandTotal = getTotalPrice();

      const orderItems = cartItems.map(item => ({
        productId: item.productId || item.id,
        productName: item.name,
        productImage: item.imageUrl || item.image,
        quantity: item.quantity,
        unitPrice: getItemPrice(item),
        totalPrice: getItemSubtotal(item),
        selectedSize: item.selectedSize,
        sizesCount: item.isWholesale ? (item.piecesPerSet || 4) : (item.piecesPerSet || item.sizes?.length || 4)
      }));

      const orderRequest = {
        items: orderItems,
        orderType: cartItems.some(item => item.isWholesale) ? 'WHOLESALE' : 'RETAIL',
        shippingAddress,
        paymentMethod,
        subtotal,
        gstAmount: gst,
        platformCharge,
        totalAmount: grandTotal
      };

      const response = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) throw new Error('Failed to create order');
      const orderData = await response.json();

      if (paymentMethod === 'RAZORPAY') {
        return new Promise((resolve, reject) => {
          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: "INR",
            name: "Sandhya Fashion",
            description: "Order Payment",
            order_id: orderData.razorpayOrderId,
            handler: async (response) => {
              try {
                const verifyRes = await fetch(`${API_ENDPOINTS.ORDERS}/verify-payment`, {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  })
                });

                if (verifyRes.ok) {
                  clearCart();
                  resolve({ success: true, order: await verifyRes.json() });
                } else {
                  throw new Error('Payment verification failed');
                }
              } catch (err) {
                reject(err);
              }
            },
            prefill: {
              name: "", // Can be filled if we have user info
              email: "",
              contact: ""
            },
            theme: {
              color: "#00B67A"
            },
            modal: {
              ondismiss: () => {
                setLoading(false);
                reject(new Error('Payment cancelled by user'));
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      }

      clearCart();
      return { success: true, order: orderData };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async (order) => {
    setLoading(true);
    setError(null);
    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      return new Promise((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Sdmxs3jbQIuXYr',
          amount: Math.round(order.totalAmount * 100),
          currency: "INR",
          name: "Sandhya Fashion",
          description: "Order Payment",
          order_id: order.razorpayOrderId,
          handler: async (response) => {
            try {
              const verifyRes = await fetch(`${API_ENDPOINTS.ORDERS}/verify-payment`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              if (verifyRes.ok) {
                resolve({ success: true, order: await verifyRes.json() });
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (err) {
              reject(err);
            }
          },
          prefill: {
            name: "",
            email: "",
            contact: ""
          },
          theme: {
            color: "#00B67A"
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              reject(new Error('Payment cancelled'));
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems, isCartOpen, checkoutStep, setCheckoutStep, loading, error,
    addToCart, removeFromCart, updateQuantity, clearCart, checkout, retryPayment,
    getTotalItems, getTotalPrice, getTotalSavings,
    getSubtotal, getGST, getPlatformCharge, getItemSubtotal,
    openCart, closeCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
