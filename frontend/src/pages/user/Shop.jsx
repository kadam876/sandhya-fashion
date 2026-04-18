import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Filter, Camera, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { API_ENDPOINTS, getAuthHeaders, DEFAULT_CATALOGUE_IMAGE_URL } from '../../config';
import { cachedFetch } from '../../utils/apiCache';
import VirtualTryOn from '../../components/VirtualTryOn';
import ProductCardSkeleton from '../../components/ProductCardSkeleton';
import ProgressiveImage from '../../components/ProgressiveImage';
import CardPreloader from '../../components/CardPreloader';

const PAGE_SIZE = 12;

const Shop = () => {
  const [searchParams] = useSearchParams();
  const catalogueId = searchParams.get('catalogue');
  const catalogueLabelRaw = searchParams.get('label');
  const categoryFromUrl = searchParams.get('category');
  const searchFromUrl = searchParams.get('search') || '';

  const decodedShopCategory = useMemo(() => {
    if (!categoryFromUrl) return null;
    try { return decodeURIComponent(categoryFromUrl.replace(/\+/g, ' ')); }
    catch { return categoryFromUrl; }
  }, [categoryFromUrl]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tryOnProduct, setTryOnProduct] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const { addToCart, openCart } = useCart();
  const navigate = useNavigate();

  const catalogueTitle = catalogueLabelRaw
    ? decodeURIComponent(catalogueLabelRaw.replace(/\+/g, ' '))
    : 'This catalogue';
  const narrowShopView = Boolean(catalogueId || decodedShopCategory);

  const fetchProducts = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.PRODUCTS}?page=${p}&size=${PAGE_SIZE}`;
      const data = await cachedFetch(url, { headers: getAuthHeaders() });
      // paginated response
      if (data && data.content) {
        setProducts(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else {
        // fallback if old format
        setProducts(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
      setError(null);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductsByCategory = useCallback(async (category) => {
    setLoading(true);
    try {
      const data = await cachedFetch(API_ENDPOINTS.PRODUCTS_BY_CATEGORY(category), { headers: getAuthHeaders() });
      setProducts(Array.isArray(data) ? data : []);
      setTotalPages(1);
      setError(null);
    } catch {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductsByCatalogue = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await cachedFetch(API_ENDPOINTS.PRODUCTS_BY_CATALOGUE(id), { headers: getAuthHeaders() });
      setProducts(Array.isArray(data) ? data : []);
      setTotalPages(1);
      setError(null);
    } catch {
      setError('Failed to load products for this catalogue. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await cachedFetch(API_ENDPOINTS.PRODUCT_CATEGORIES, { headers: getAuthHeaders() });
      setCategories(['all', ...(data.categories || [])]);
    } catch { /* silent */ }
  }, []);

  // reset page when filters change
  useEffect(() => { setPage(0); }, [catalogueId, decodedShopCategory, selectedCategory]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (catalogueId) { fetchProductsByCatalogue(catalogueId); return; }
    if (decodedShopCategory) { fetchProductsByCategory(decodedShopCategory); return; }
    if (selectedCategory === 'all') { fetchProducts(page); }
    else { fetchProductsByCategory(selectedCategory); }
  }, [catalogueId, decodedShopCategory, selectedCategory, page,
      fetchProducts, fetchProductsByCategory, fetchProductsByCatalogue]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.ratings || 0) - (a.ratings || 0);
    return 0;
  }).filter((p) =>
    !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product) => {
    const size = product.sizes?.length > 0 ? product.sizes[0] : 'M';
    addToCart(product, size, 1);
    openCart();
  };

  const handleBuyNow = (product) => {
    const size = product.sizes?.length > 0 ? product.sizes[0] : 'M';
    addToCart(product, size, 1);
    openCart(2); // Step 2 is Checkout Details
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100/80 sticky top-0 md:top-[72px] z-40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {catalogueId ? catalogueTitle : decodedShopCategory ?? 'Shop Collection'}
              </h1>
              {!loading && totalElements > 0 && !narrowShopView && (
                <p className="text-sm font-medium text-gray-500 mt-1">{totalElements} premium products curated for you</p>
              )}
            </div>
            <div className="flex items-center space-x-3 md:bg-gray-50 md:p-1.5 md:rounded-2xl md:border border-gray-100">
              <div className="relative flex-grow md:flex-grow-0">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-8 py-2.5 w-full md:w-64 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm text-gray-700 cursor-pointer"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
                   <Filter size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category filters inside the sticky header */}
        {!narrowShopView && (
          <div className="border-t border-gray-50 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((cat) => (
                  <button key={cat} type="button" onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full font-bold transition-all whitespace-nowrap text-sm shadow-sm ${
                      selectedCategory === cat ? 'bg-gray-900 text-white shadow-gray-900/20' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
                    }`}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Catalogue / category banner */}
      {(catalogueId || decodedShopCategory) && (
        <div className="bg-gray-900 border-b border-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <p className="text-sm font-semibold tracking-wide">
                 {catalogueId ? 'Showing products in this specific catalogue' : `Filtered Category: ${decodedShopCategory}`}
               </p>
            </div>
            <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors bg-white/10 px-3 py-1.5 rounded-lg"
              onClick={() => setSelectedCategory('all')}>
              Clear Filter
            </Link>
          </div>
        </div>
      )}



      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-6 py-4 font-medium shadow-sm flex items-center justify-between">
            <p>{error}</p>
            <button type="button" onClick={() => { setError(null); fetchProducts(page); }}
              className="text-sm font-bold text-red-700 bg-red-100/50 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? [...Array(PAGE_SIZE)].map((_, i) => <ProductCardSkeleton key={i} />)
            : sortedProducts.map((product) => {
              const imgUrl = product.imageUrl || product.image || DEFAULT_CATALOGUE_IMAGE_URL;
              return (
              <CardPreloader key={product.id} imageUrl={imgUrl}>
               <div 
                  className="group bg-white rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 border border-gray-100/80 flex flex-col overflow-hidden cursor-pointer h-full"
                  onClick={() => navigate(`/product/${product.id}`)}
               >
                <div className="relative overflow-hidden">
                  <ProgressiveImage
                    src={imgUrl}
                    alt={product.name}
                    className="w-full h-72 group-hover:scale-[1.03] transition-transform duration-700 ease-in-out"
                    fallbackSrc={DEFAULT_CATALOGUE_IMAGE_URL}
                  />
                  {product.badge && (
                    <div className={`absolute top-4 left-4 ${product.badgeColor} text-white text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm bg-opacity-90`}>
                      {product.badge}
                    </div>
                  )}
                  {product.wholesalePrice && product.wholesalePrice < product.price && (
                    <div className="absolute top-4 right-4 bg-rose-500/90 backdrop-blur-md border border-rose-400/50 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
                      -{Math.round(((product.price - product.wholesalePrice) / product.price) * 100)}%
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-auto">
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-1 line-clamp-1 tracking-tight">{product.name}</h3>
                    <div className="flex items-center mb-3 text-sm">
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.floor(product.ratings || 0) ? 'currentColor' : 'none'} className={i < Math.floor(product.ratings || 0) ? 'text-amber-400' : 'text-gray-200'} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-500 ml-2">({product.ratings || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between mt-4 mb-5">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-gray-900 tracking-tight">{formatPrice(product.price)}</span>
                      {product.wholesalePrice && (
                        <span className="text-xs font-bold text-gray-400 line-through mt-0.5">{formatPrice(product.wholesalePrice)} MSRP</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setTryOnProduct(product); }}
                        className="flex-1 bg-white border-2 border-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2 group-hover:border-emerald-100">
                        <Camera size={18} className="text-gray-400" />
                        <span className="text-[11px] uppercase tracking-wider text-gray-500">Try On</span>
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
                        <ShoppingCart size={18} />
                        <span className="text-[11px] uppercase tracking-wider">Cart</span>
                      </button>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleBuyNow(product); }}
                      className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all duration-300 shadow-xl shadow-gray-900/10 active:scale-[0.98]">
                      Buy Now
                    </button>
                  </div>
                </div>
               </div>
              </CardPreloader>
             )})
          }
        </div>

        {/* Empty state */}
        {!loading && sortedProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search size={40} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">We couldn't find any products matching your current filters or search terms.</p>
            {(narrowShopView || searchTerm || selectedCategory !== 'all') && (
              <Link to="/shop" 
                onClick={() => { setSelectedCategory('all'); setSearchTerm(''); }}
                className="px-8 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-md transition-colors inline-block"
              >
                Clear All Filters
              </Link>
            )}
          </div>
        )}

        {/* Pagination — only for all-products view */}
        {!narrowShopView && totalPages > 1 && !loading && (
          <div className="flex items-center justify-center space-x-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  i === page ? 'bg-[#00B67A] text-white' : 'border border-gray-300 hover:bg-gray-100'
                }`}>
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {tryOnProduct && <VirtualTryOn product={tryOnProduct} onClose={() => setTryOnProduct(null)} />}
    </div>
  );
};

export default Shop;
