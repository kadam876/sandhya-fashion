import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, getAuthHeaders, DEFAULT_CATALOGUE_IMAGE_URL } from '../../config';
import { CLOTH_CATEGORIES } from '../../data/clothCategories';
import { useCart } from '../../contexts/CartContext';
import { Camera, ShoppingCart, Star, ArrowRight, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import ProductCardSkeleton from '../../components/ProductCardSkeleton';
import ProgressiveImage from '../../components/ProgressiveImage';
import CardPreloader from '../../components/CardPreloader';

const VirtualTryOn = lazy(() => import('../../components/VirtualTryOn'));

const BEST_SELLER_COUNT = 8;

const Landing = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [bestsellersLoading, setBestsellersLoading] = useState(true);
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const navigate = useNavigate();
  const { openCart, addToCart } = useCart();

  useEffect(() => {
    let cancelled = false;

    const loadBestsellers = async () => {
      setBestsellersLoading(true);
      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}?page=0&size=20`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Failed to fetch products');

        const json = await response.json();
        if (cancelled) return;

        const list = Array.isArray(json) ? json : (json.content || []);
        const sorted = [...list].sort((a, b) => {
          const ra = Number(a.ratings) || 0;
          const rb = Number(b.ratings) || 0;
          if (rb !== ra) return rb - ra;
          return (Number(b.stockQuantity) || 0) - (Number(a.stockQuantity) || 0);
        });

        const top = sorted.slice(0, BEST_SELLER_COUNT);
        setBestsellers(top);
      } finally {
        if (!cancelled) setBestsellersLoading(false);
      }
    };

    loadBestsellers();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddBestsellerToCart = (e, product) => {
    e.stopPropagation();
    const availableSize =
      product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
    const imageUrl = product.imageUrl || product.image;
    addToCart(
      {
        ...product,
        imageUrl,
        image: imageUrl,
      },
      availableSize,
      1
    );
    openCart();
  };

  const productImage = (p) => p.imageUrl || p.image || 'https://picsum.photos/seed/product1/300/400.jpg';
  const productRating = (p) => Number(p.ratings ?? p.rating ?? 0);

  return (
    <div className="bg-white">
      {/* Modern Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-32 overflow-hidden mx-auto max-w-7xl">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-gradient-to-br from-emerald-100 to-teal-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-gradient-to-tr from-orange-50 to-pink-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-semibold text-sm mb-6 border border-emerald-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Premium Wholesale Fashion Hub</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Elevate your <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Retail Business</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
              Source top-tier fashion directly from trusted manufacturers. High profit margins, zero compromises on quality, and a catalog built for modern boutiques.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button 
                onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-full font-bold text-lg hover:border-gray-900 hover:bg-gray-50 transition-all duration-300"
              >
                Explore Categories
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8 text-sm font-semibold text-gray-500">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="text-emerald-500" size={20} />
                <span>Verified Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="text-emerald-500" size={20} />
                <span>Fast Dispatch</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-emerald-500" size={20} />
                <span>High Margins</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-3xl transform rotate-3" />
            <div className="relative bg-white p-2 rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              <ProgressiveImage
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2670&auto=format&fit=crop"
                alt="Modern Fashion Models"
                className="w-full h-[500px] object-cover rounded-2xl"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Virtual Try-On Supported</h3>
                    <p className="text-gray-600 text-sm font-medium mt-1">See it before you bulk buy it.</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white shadow-lg">
                    <Camera size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Modern Grid */}
      <section id="categories" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Curated Collections</h2>
            <p className="text-gray-500 mt-4 text-lg font-medium">Explore premium apparel across all major categories designed to meet the demands of your customer base.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {CLOTH_CATEGORIES.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => navigate(`/shop?category=${encodeURIComponent(category.name)}`)}
                className="group relative rounded-3xl overflow-hidden aspect-[3/4] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                <ProgressiveImage
                  src={category.imageUrl}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-700"
                  fallbackSrc={DEFAULT_CATALOGUE_IMAGE_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-3xl transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 text-left">
                  <h3 className="text-white font-extrabold text-xl tracking-tight leading-none mb-1">
                    {category.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>Shop Now</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Catalog / Bestsellers */}
      <section id="featured-products" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Trending Weekly</h2>
              <p className="text-gray-500 mt-4 text-lg font-medium">The most demanded products from the last 7 days. Stock them before they run out.</p>
            </div>
            <button
               onClick={() => navigate('/shop')}
               className="hidden md:flex items-center space-x-2 text-emerald-600 font-bold hover:text-emerald-700 transition-colors group"
            >
              <span>View entire catalog</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>

          {bestsellersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : bestsellers.length === 0 ? (
            <div className="text-center py-24 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-gray-500 font-medium text-lg mb-6">No featured products available at the moment.</p>
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestsellers.map((product) => {
                const img = productImage(product);
                const ratingVal = productRating(product);
                const price = Math.round(Number(product.price) || 0);
                const wholesale = product.wholesalePrice != null ? Math.round(Number(product.wholesalePrice)) : null;
                const originalRetail = product.originalPrice != null ? Math.round(Number(product.originalPrice)) : null;

                return (
                 <CardPreloader key={product.id} imageUrl={img}>
                  <div
                    className="group bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col overflow-hidden"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="relative overflow-hidden aspect-[4/5] bg-gray-100">
                      <ProgressiveImage
                        src={img}
                        alt={product.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                        fallbackSrc="https://picsum.photos/seed/product1/300/400.jpg"
                      />
                      {product.badge && (
                        <div className="absolute top-4 left-4">
                          <span className={`shadow-sm font-bold tracking-wide uppercase px-3 py-1.5 rounded-full text-xs text-white ${product.badgeColor || 'bg-emerald-500'}`}>
                            {product.badge}
                          </span>
                        </div>
                      )}
                      
                      {/* Floating actions */}
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 flex flex-col space-y-2">
                         <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTryOnProduct(product);
                            }}
                            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Virtual Try-On"
                          >
                            <Camera size={18} />
                          </button>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center mb-3">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.floor(ratingVal) ? 'currentColor' : 'none'} className={i >= Math.floor(ratingVal) ? 'text-gray-200' : ''} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-400 ml-2">({ratingVal.toFixed(1)})</span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-4 flex-1 line-clamp-2">{product.name}</h3>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-xl font-extrabold text-emerald-600">₹{price}</span>
                          {wholesale != null && wholesale !== price && (
                            <span className="text-sm font-medium text-gray-400 line-through ml-2">₹{wholesale}</span>
                          )}
                          {originalRetail != null && originalRetail > price && wholesale == null && (
                            <span className="text-sm font-medium text-gray-400 line-through ml-2">₹{originalRetail}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleAddBestsellerToCart(e, product)}
                          className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-md"
                          title="Add to Cart"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                 </CardPreloader>
                );
              })}
            </div>
          )}
          
          <div className="mt-12 text-center md:hidden">
            <button
               onClick={() => navigate('/shop')}
               className="inline-flex items-center space-x-2 text-emerald-600 font-bold px-6 py-3 border border-emerald-200 rounded-full hover:bg-emerald-50 transition-colors"
            >
              <span>View entire catalog</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 pt-4 bg-gray-50 flex justify-center">
        <div className="w-full max-w-6xl bg-gray-900 rounded-[3rem] relative overflow-hidden shadow-2xl border border-gray-800">
          <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-full max-w-lg h-full bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full blur-[120px]" />
          </div>
          <div className="relative z-10 text-center px-6 py-16 md:py-24 sm:px-12 lg:px-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white tracking-tighter">Scale Your Wholesale Logistics Today.</h2>
            <p className="text-lg md:text-xl mb-10 text-gray-300 font-medium max-w-2xl mx-auto">
              Join thousands of satisfied retailers who trust Sandhya Fashion for high-margin, premium apparel at unbeatable factory prices.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto px-10 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-400 hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] transition-all duration-300"
              >
                Start Sourcing
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
              >
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </section>

      {tryOnProduct && (
        <Suspense fallback={null}>
          <VirtualTryOn product={tryOnProduct} onClose={() => setTryOnProduct(null)} />
        </Suspense>
      )}
    </div>
  );
};

export default Landing;
