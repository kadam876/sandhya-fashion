import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Truck, ShieldCheck, Package, MessageCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import ProductDetailSkeleton from '../../components/skeletons/ProductDetailSkeleton';
import FeedbackSection from '../../components/FeedbackSection';
import ProgressiveImage from '../../components/ProgressiveImage';

const ProductDetail = () => {
  // useParams Hook Explanation:
  // useParams() extracts the 'id' parameter from the URL pattern "/product/:id"
  // This allows us to fetch specific product data for wholesale display
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [numberOfSets, setNumberOfSets] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, openCart } = useCart();

  // Fetch product data from API
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(id), {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      const data = await response.json();
      setProduct(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Wholesale Calculation Logic:
  // wholesalePrice is per piece; each set = 4 pieces (M, L, XL, XXL)
  const piecesPerSet = 4;
  const totalPieces = numberOfSets * piecesPerSet;
  const pricePerPiece = product ? product.wholesalePrice : 0;
  const pricePerSet = pricePerPiece * piecesPerSet;                        // e.g. 525 × 4 = 2100
  const subtotal = pricePerSet * numberOfSets;                             // set price × sets
  const gstAmount = subtotal * 0.05;                                       // 5% GST
  const platformCharge = subtotal * 0.02;                                  // 2% platform
  const totalPayable = subtotal + gstAmount + platformCharge;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.wholesalePrice) {
      addToCart({ ...product, isWholesale: true }, 'SET', numberOfSets);
    } else {
      addToCart(product, selectedSize, 1);
    }
    openCart();
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (product.wholesalePrice) {
      addToCart({ ...product, isWholesale: true }, 'SET', numberOfSets);
    } else {
      addToCart(product, selectedSize, 1);
    }
    openCart(2); // Step 2 is Checkout Details
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-[#00B67A] text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleWhatsAppInquiry = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in bulk order for ${product.name} - ${numberOfSets} sets (${totalPieces} pieces). Please provide best wholesale pricing.`
    );
    window.open(`https://wa.me/919876543210?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <ProgressiveImage 
                src={product.imageUrl || 'https://picsum.photos/seed/product1/600/600.jpg'}
                alt={product.name}
                className="w-full h-full"
                fallbackSrc="https://picsum.photos/seed/product1/600/600.jpg"
              />
            </div>
          </div>

          {/* Right Column - Wholesale Details */}
          <div className="space-y-6">
            {/* Product Title & Rating */}
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                  <Star className="text-amber-400 fill-current" size={16} />
                  <span className="ml-1.5 text-amber-900 font-bold text-sm">{product.ratings || 0}</span>
                </div>
                <span className="text-gray-500 font-medium text-sm">Based on verified wholesale reviews</span>
              </div>
            </div>

            {/* Wholesale Pricing */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white border border-emerald-100 rounded-3xl p-8 shadow-sm">
              <div className="mb-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-extrabold text-emerald-600 tracking-tight">₹{pricePerPiece}</span>
                  <span className="text-lg font-bold text-emerald-800/60 uppercase tracking-widest">per piece</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm font-medium text-gray-500">Price per set ({piecesPerSet} pcs):</span>
                  <span className="text-lg font-bold text-emerald-700">₹{pricePerSet.toLocaleString()}</span>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Bill Summary</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({numberOfSets} set{numberOfSets > 1 ? 's' : ''} × ₹{pricePerSet.toLocaleString()})</span>
                    <span className="font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (5%)</span>
                    <span className="font-bold text-gray-900">₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Charges (2%)</span>
                    <span className="font-bold text-gray-900">₹{platformCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base border-t border-gray-200 pt-3 mt-1">
                    <span className="text-gray-900">Total Payable</span>
                    <span className="text-emerald-600">₹{totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Set Composition */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Composition</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">This set includes <strong>{piecesPerSet} pieces</strong> (1 of each size):</span>
              </div>
              <div className="flex space-x-2">
                {['M', 'L', 'XL', 'XXL'].map((size) => (
                  <span 
                    key={size}
                    className="px-4 py-2 bg-[#00B67A] text-white rounded-lg font-medium text-center"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            {/* Bulk Order Logic */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Order</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Sets
                  </label>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setNumberOfSets(Math.max(1, numberOfSets - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-lg"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 font-medium min-w-[6rem] text-center bg-white border border-gray-300 rounded-lg">
                      {numberOfSets} {numberOfSets === 1 ? 'Set' : 'Sets'}
                    </span>
                    <button 
                      onClick={() => setNumberOfSets(numberOfSets + 1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Total pieces: <strong>{totalPieces}</strong>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Payable (incl. GST & charges):</span>
                    <span className="text-2xl font-bold text-[#00B67A]">
                      ₹{totalPayable.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wholesale Specifications</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Package size={20} className="text-[#00B67A] flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Package: {product.sizes?.length || 4} pieces per set</span>
                </div>
                {product.description && (
                  <div className="flex items-start space-x-3">
                    <ShieldCheck size={20} className="text-[#00B67A] flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{product.description}</span>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <Truck size={20} className="text-[#00B67A] flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Dispatch within 2–3 business days</span>
                </div>
                <div className="flex items-start space-x-3">
                  <ShieldCheck size={20} className="text-[#00B67A] flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Quality checked before dispatch</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-white border-2 border-gray-900 text-gray-900 px-6 py-4 rounded-full font-bold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>

              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-gray-900 text-white px-6 py-4 rounded-full font-bold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Buy Now</span>
              </button>
              
              <button 
                onClick={handleWhatsAppInquiry}
                className="flex-1 bg-[#25D366] text-white px-6 py-4 rounded-full font-bold hover:bg-[#128C7E] hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <MessageCircle size={20} />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <FeedbackSection productId={id} />
      </div>
    </div>
  );
};

export default ProductDetail;
