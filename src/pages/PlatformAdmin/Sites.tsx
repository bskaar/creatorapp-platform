import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Globe, Users, Calendar, DollarSign, ExternalLink, Search, Tag, X } from 'lucide-react';

interface Site {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  created_at: string;
  updated_at: string;
  stripe_account_id: string | null;
  platform_coupon_code: string | null;
  member_count?: number;
  product_count?: number;
  order_count?: number;
  total_revenue?: number;
}

export default function PlatformAdminSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSites = async () => {
    try {
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('*')
        .order('created_at', { ascending: false });

      if (sitesError) throw sitesError;

      const sitesWithStats = await Promise.all(
        (sitesData || []).map(async (site) => {
          const [memberCount, productCount, orderData] = await Promise.all([
            supabase
              .from('site_members')
              .select('id', { count: 'exact', head: true })
              .eq('site_id', site.id),
            supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('site_id', site.id),
            supabase
              .from('orders')
              .select('amount')
              .eq('site_id', site.id)
              .eq('payment_status', 'paid'),
          ]);

          const totalRevenue = orderData.data?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;

          return {
            ...site,
            member_count: memberCount.count || 0,
            product_count: productCount.count || 0,
            order_count: orderData.count || 0,
            total_revenue: totalRevenue,
          };
        })
      );

      setSites(sitesWithStats);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const openCouponModal = (site: Site) => {
    setSelectedSite(site);
    setCouponCode(site.platform_coupon_code || '');
    setCouponModalOpen(true);
  };

  const closeCouponModal = () => {
    setCouponModalOpen(false);
    setSelectedSite(null);
    setCouponCode('');
  };

  const saveCoupon = async () => {
    if (!selectedSite) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('sites')
        .update({
          platform_coupon_code: couponCode.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSite.id);

      if (error) throw error;

      await fetchSites();
      closeCouponModal();
      alert('Coupon code updated successfully!');
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Failed to save coupon code. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.custom_domain && site.custom_domain.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filter === 'active') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && new Date(site.updated_at) > thirtyDaysAgo;
    } else if (filter === 'inactive') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && new Date(site.updated_at) <= thirtyDaysAgo;
    }

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Sites</h1>
        <p className="text-gray-600 mt-1">Manage all sites on the CreatorApp.US platform</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search sites by name, subdomain, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({sites.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {filteredSites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No sites found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSites.map((site) => (
            <div key={site.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{site.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <a href={`/s/${site.subdomain}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600 transition-colors">
                        <Globe className="w-4 h-4 mr-1" />
                        {site.subdomain}.creatorapp.us
                      </a>
                      {site.custom_domain && (
                        <span className="flex items-center text-blue-600">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {site.custom_domain}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {site.stripe_account_id ? 'Stripe Connected' : 'No Payment Setup'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Members</p>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {site.member_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Products</p>
                    <p className="text-lg font-semibold text-gray-900">{site.product_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Orders</p>
                    <p className="text-lg font-semibold text-gray-900">{site.order_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900 flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      {site.total_revenue?.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created {new Date(site.created_at).toLocaleDateString()}
                    </div>
                    {site.platform_coupon_code && (
                      <div className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        <Tag className="w-3 h-3 mr-1" />
                        Coupon: {site.platform_coupon_code}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500">
                      Last active {new Date(site.updated_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => openCouponModal(site)}
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      {site.platform_coupon_code ? 'Edit Coupon' : 'Add Coupon'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {couponModalOpen && selectedSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Assign Coupon Code
              </h2>
              <button
                onClick={closeCouponModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Site: <span className="font-semibold">{selectedSite.name}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Pre-assign a Stripe coupon code for this site. The coupon will be automatically applied at checkout.
                </p>
              </div>

              <div>
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                  Stripe Coupon Code
                </label>
                <input
                  id="coupon"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g., BETA100OFF"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the exact coupon code from your Stripe dashboard. Leave blank to remove.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Users can still enter promotion codes at checkout even if no coupon is pre-assigned.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={closeCouponModal}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveCoupon}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
