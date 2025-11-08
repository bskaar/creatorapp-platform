import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { Package, Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  product_type: string;
  price_amount: number;
  price_currency: string;
  status: string;
  thumbnail_url: string;
  settings: any;
  created_at: string;
}

export default function ProductList() {
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (currentSite) {
      loadProducts();
    }
  }, [currentSite]);

  const loadProducts = async () => {
    if (!currentSite) return;

    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (filterType !== 'all') {
        query = query.eq('product_type', filterType);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'draft' : 'active';
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
    } catch (err) {
      console.error('Error updating product status:', err);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      digital: 'Digital Product',
      course: 'Course',
      membership: 'Membership',
      coaching: 'Coaching',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your courses, memberships, and digital products</p>
        </div>
        <Link
          to="/commerce/products/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                loadProducts();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                loadProducts();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="course">Course</option>
              <option value="membership">Membership</option>
              <option value="digital">Digital Product</option>
              <option value="coaching">Coaching</option>
            </select>
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h2>
          <p className="text-gray-600 mb-6">Create your first product to start selling</p>
          <Link
            to="/commerce/products/new"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Create Product</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div
                className="h-48 bg-gray-200 bg-cover bg-center"
                style={{
                  backgroundImage: product.thumbnail_url || product.settings?.images?.[0]
                    ? `url(${product.thumbnail_url || product.settings?.images?.[0]})`
                    : 'none',
                }}
              >
                {!product.thumbnail_url && !product.settings?.images?.[0] && (
                  <div className="h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {product.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(product.status)}`}>
                    {product.status}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {getProductTypeLabel(product.product_type)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price_amount, product.price_currency)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStatusToggle(product.id, product.status)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title={product.status === 'active' ? 'Set to Draft' : 'Set to Active'}
                    >
                      {product.status === 'active' ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-600" />
                      )}
                    </button>

                    <button
                      onClick={() => navigate(`/commerce/products/${product.id}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
