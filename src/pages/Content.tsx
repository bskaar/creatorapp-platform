import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { FolderOpen, Plus, Edit, Trash2, Search, MoreVertical } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export default function Content() {
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (!currentSite) return;
    loadProducts();
  }, [currentSite]);

  const loadProducts = async () => {
    if (!currentSite) return;

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

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      setProducts(products.filter(p => p.id !== id));
      if (currentSite) {
        await supabase
          .from('sites')
          .update({ products_count: Math.max(0, currentSite.products_count - 1) })
          .eq('id', currentSite.id);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      course: 'Course',
      membership: 'Membership',
      digital_product: 'Digital Product',
      coaching: 'Coaching',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      published: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 border border-emerald-500/20',
      archived: 'bg-gradient-to-r from-red-500/10 to-pink-500/10 text-red-700 border border-red-500/20',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-dark">Content Library</h1>
          <p className="text-text-secondary mt-2 text-lg">Manage your courses, memberships, and digital products</p>
        </div>
        <Link
          to="/content/new"
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5" />
          <span>New Product</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-card shadow-light p-12 text-center border border-border">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-card shadow-light p-12 text-center border border-border">
          <FolderOpen className="h-16 w-16 text-text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-2">No Products Yet</h2>
          <p className="text-text-secondary mb-6 text-lg">Create your first course, membership, or digital product</p>
          <Link
            to="/content/new"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>Create Your First Product</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-card shadow-light p-6 border border-border">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-semibold text-text-primary"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="membership">Memberships</option>
                <option value="digital_product">Digital Products</option>
                <option value="coaching">Coaching</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-semibold text-text-primary"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-card shadow-light hover:shadow-medium transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-border group"
              >
                {product.thumbnail_url ? (
                  <img
                    src={product.thumbnail_url}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <FolderOpen className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-dark mb-2">{product.title}</h3>
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-button text-xs font-semibold ${getStatusColor(product.status)}`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                        <span className="px-3 py-1 rounded-button text-xs font-semibold bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20">
                          {getProductTypeLabel(product.product_type)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {product.description && (
                    <p className="text-sm text-text-secondary mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ${product.price_amount}
                      </div>
                      <div className="text-xs text-text-secondary font-medium">
                        {product.billing_type === 'recurring' && product.billing_interval
                          ? `per ${product.billing_interval.replace('ly', '')}`
                          : 'one-time'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-4 border-t border-border">
                    <Link
                      to={`/content/${product.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-button transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
