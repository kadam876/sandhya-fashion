import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, AlertTriangle, TrendingUp, Plus, Search, Filter, X, Link2, ImageIcon } from 'lucide-react';
import DataTable from '../../components/DataTable';
import { API_ENDPOINTS, getAuthHeaders } from '../../config';
import { CLOTH_CATEGORIES } from '../../data/clothCategories';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PLACEHOLDER_IMG = 'https://placehold.co/100x100/e5e7eb/6b7280?text=No+image';

function mapProductToRow(p) {
  return {
    id: p.id,
    name: p.name || '—',
    category: p.category || '—',
    price: p.price ?? 0,
    stock: p.stockQuantity ?? 0,
    image: p.imageUrl || PLACEHOLDER_IMG,
  };
}

function parseSizesInput(text) {
  return text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const InventoryDashboard = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState(location.state?.filter || 'all');
  const [inventoryData, setInventoryData] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState('');
  const [productSizesText, setProductSizesText] = useState('S, M, L, XL, XXL');
  const [imageMode, setImageMode] = useState('url');
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    imageUrl: '',
    description: '',
  });
  const [imageFilePreview, setImageFilePreview] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  // Edit Product State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    isActive: true,
    category: '',
    imageUrl: '',
    sizes: [],
  });

  // Value Distribution Modal State
  const [showDistributionModal, setShowDistributionModal] = useState(false);

  const loadInventory = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_INVENTORY, { headers: getAuthHeaders() });
      if (!res.ok) {
        throw new Error('Failed to load inventory');
      }
      const data = await res.json();
      setInventoryData((Array.isArray(data) ? data : []).map(mapProductToRow));
    } catch (e) {
      setListError(e.message || 'Could not load products');
      setInventoryData([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (location.state?.filter) {
      setFilterType(location.state.filter);
    }
    if (location.state?.search) {
      setSearchTerm(location.state.search);
    }
  }, [location.state]);

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      setImageFilePreview('');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setImageFilePreview(typeof dataUrl === 'string' ? dataUrl : '');
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e, isEdit = false) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                if (isEdit) {
                    setEditForm(prev => ({ ...prev, imageUrl: dataUrl }));
                } else {
                    setImageMode('file'); // Switch to file mode automatically
                    setImageFilePreview(dataUrl);
                }
            };
            reader.readAsDataURL(blob);
            break; // Stop after first image found
        }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !selectedProductCategory) {
      alert('Choose a clothing category and enter a product name.');
      return;
    }
    const sizes = parseSizesInput(productSizesText);
    if (sizes.length === 0) {
      alert('Enter at least one size (comma-separated), e.g. S, M, L, XL.');
      return;
    }
    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);
    if (Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) return;

    let imageUrl = '';
    if (imageMode === 'url') {
      imageUrl = newProduct.imageUrl.trim();
    } else {
      imageUrl = imageFilePreview;
    }
    if (!imageUrl) {
      imageUrl = PLACEHOLDER_IMG;
    }

    setSavingProduct(true);
    try {
      const payload = {
        name: newProduct.name.trim(),
        description: newProduct.description.trim(),
        category: selectedProductCategory,
        price,
        wholesalePrice: price,
        stockQuantity: Math.floor(stock),
        imageUrl,
        sizes,
        ratings: 0,
        badge: '',
        badgeColor: '',
        isActive: true,
      };
      const res = await fetch(API_ENDPOINTS.ADMIN_CREATE_PRODUCT, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setShowAddModal(false);
      setNewProduct({ name: '', price: '', stock: '', imageUrl: '', description: '' });
      setSelectedProductCategory('');
      setProductSizesText('S, M, L, XL, XXL');
      setImageMode('url');
      setImageFilePreview('');
      await loadInventory();
    } catch {
      alert('Could not create product. Try again.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from inventory?`)) return;
    try {
      const res = await fetch(API_ENDPOINTS.ADMIN_DELETE_PRODUCT(item.id), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      setInventoryData((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      alert('Could not delete product.');
    }
  };

  const handleEdit = async (item) => {
    try {
      setListLoading(true);
      // Fetch full product details to pre-fill the form
      const res = await fetch(API_ENDPOINTS.PRODUCT_BY_ID(item.id), {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error();
      const product = await res.json();
      
      setEditingProduct(product);
      setEditForm({
        name: product.name || '',
        price: product.price || '',
        stock: product.stockQuantity || '',
        description: product.description || '',
        isActive: product.isActive ?? true,
        category: product.category || '',
        imageUrl: product.imageUrl || '',
        sizes: product.sizes || [],
      });
      setShowEditModal(true);
    } catch {
      alert('Could not fetch product details.');
    } finally {
      setListLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setSavingProduct(true);
    try {
      const payload = {
        ...editingProduct,
        name: editForm.name.trim(),
        price: Number(editForm.price),
        stockQuantity: Math.floor(Number(editForm.stock)),
        description: editForm.description.trim(),
        isActive: editForm.isActive,
        category: editForm.category,
        imageUrl: editForm.imageUrl,
        sizes: editForm.sizes,
      };

      const res = await fetch(API_ENDPOINTS.ADMIN_UPDATE_PRODUCT(editingProduct.id), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      
      setShowEditModal(false);
      setEditingProduct(null);
      await loadInventory();
    } catch {
      alert('Could not update product. Try again.');
    } finally {
      setSavingProduct(false);
    }
  };

  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter((item) => item.stock < 20).length;
  const totalCategoryValue = inventoryData.reduce((sum, item) => sum + item.price * item.stock, 0);

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || (filterType === 'low-stock' && item.stock < 20);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-600">Manage your product inventory and stock levels</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            type="button"
            className={`text-left bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-all duration-200 ${filterType === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilterType('all')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Package className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            className={`text-left bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-all duration-200 ${filterType === 'low-stock' ? 'ring-2 ring-red-500' : ''}`}
            onClick={() => setFilterType('low-stock')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock Alert</p>
                <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowDistributionModal(true)}
            className="text-left bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Category Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalCategoryValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A] focus:border-transparent"
                />
              </div>
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(true);
                  setImageMode('url');
                  setImageFilePreview('');
                }}
                className="flex items-center space-x-2 bg-[#00B67A] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus size={16} />
                <span>Add New Product</span>
              </button>
            </div>
          </div>
        </div>

        {listError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{listError}</div>
        )}

        <div className="bg-white rounded-lg shadow">
          {listLoading ? (
            <div className="animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 px-6 py-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-12" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          ) : (
            <DataTable data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </div>

        {/* Add Product */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form 
                onSubmit={handleAddProduct} 
                onPaste={(e) => handlePaste(e, false)}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clothing category</label>
                  <select
                    required
                    value={selectedProductCategory}
                    onChange={(e) => setSelectedProductCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A]"
                  >
                    <option value="">Select a category…</option>
                    {CLOTH_CATEGORIES.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Pick the type that best fits this product. It appears in the store under the same category.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma or newline separated)</label>
                  <textarea
                    required
                    rows={2}
                    value={productSizesText}
                    onChange={(e) => setProductSizesText(e.target.value)}
                    placeholder="S, M, L, XL or 28, 30, 32"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A] resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock level</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                  <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-colors ${
                        imageMode === 'url' ? 'bg-white shadow text-[#00B67A]' : 'text-gray-600'
                      }`}
                    >
                      <Link2 size={16} />
                      Image link
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('file')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-colors ${
                        imageMode === 'file' ? 'bg-white shadow text-[#00B67A]' : 'text-gray-600'
                      }`}
                    >
                      <ImageIcon size={16} />
                      Upload photo
                    </button>
                  </div>
                  {imageMode === 'url' ? (
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={newProduct.imageUrl}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A]"
                    />
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#00B67A] file:text-white"
                      />
                      <p className="text-xs text-blue-600 mt-2 font-medium">💡 Pro tip: You can also just paste (Ctrl+V) an image here!</p>
                      {imageFilePreview && (
                        <img src={imageFilePreview} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded-lg border shadow-sm ring-1 ring-gray-100" />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B67A] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct || !selectedProductCategory}
                    className="px-4 py-2 bg-[#00B67A] text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {savingProduct ? 'Saving…' : 'Save product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[92vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              <form 
                onSubmit={handleUpdateProduct} 
                onPaste={(e) => handlePaste(e, true)}
                className="p-6 space-y-4"
              >
                <div className="flex items-center justify-between pb-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Active Status</label>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      editForm.isActive ? 'bg-[#00B67A]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        editForm.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock level</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editForm.stock}
                      onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  <div className="flex gap-4 items-start mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={editForm.imageUrl}
                        onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-[#00B67A]"
                      />
                      <p className="text-[10px] text-blue-600 font-medium italic">💡 Pro tip: Paste a URL above or press <b>Ctrl+V</b> to paste an image instantly!</p>
                    </div>
                    {editForm.imageUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={editForm.imageUrl} 
                          alt="Preview" 
                          className="h-16 w-16 object-cover rounded-lg border shadow-sm ring-1 ring-gray-100"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#00B67A]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="px-4 py-2 bg-[#00B67A] text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {savingProduct ? 'Saving…' : 'Update Content'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Value Distribution Modal */}
        {showDistributionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Inventory Value Distribution</h2>
                  <p className="text-sm text-gray-500 mt-1">Breakdown of stock value across all products</p>
                </div>
                <button type="button" onClick={() => setShowDistributionModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryData.map(item => ({
                            name: item.name,
                            value: item.price * item.stock
                          })).filter(d => d.value > 0).sort((a,b) => b.value - a.value).slice(0, 10)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {inventoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#00B67A', '#34D399', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#10B981', '#F43F5E'][index % 10]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Top Products by Value</h3>
                    <div className="space-y-3">
                      {inventoryData
                        .map(item => ({
                          name: item.name,
                          value: item.price * item.stock,
                          stock: item.stock
                        }))
                        .filter(d => d.value > 0)
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)
                        .map((product, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">#{idx+1}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{product.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">Stock: {product.stock} units</p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-gray-800">₹{product.value.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button type="button" onClick={() => setShowDistributionModal(false)} className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryDashboard;
