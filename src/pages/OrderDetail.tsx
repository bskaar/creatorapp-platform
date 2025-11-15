import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Package, CheckCircle, XCircle, Clock, RefreshCw, Mail, User, CreditCard, Calendar, Download } from 'lucide-react';

interface Order {
  id: string;
  product_id: string;
  amount: number;
  currency: string;
  payment_provider: string;
  payment_status: string;
  external_order_id: string;
  billing_email: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    title: string;
    description: string;
    product_type: string;
    thumbnail_url: string;
    settings: any;
  };
}

interface ProductAccess {
  access_granted_at: string;
  access_expires_at: string | null;
  is_active: boolean;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [productAccess, setProductAccess] = useState<ProductAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            title,
            description,
            product_type,
            thumbnail_url,
            settings
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) {
        setError('Order not found');
        setLoading(false);
        return;
      }

      setOrder(orderData as Order);

      const { data: accessData } = await supabase
        .from('product_access')
        .select('access_granted_at, access_expires_at, is_active')
        .eq('order_id', id)
        .maybeSingle();

      if (accessData) {
        setProductAccess(accessData);
      }
    } catch (err: any) {
      console.error('Error loading order:', err);
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="h-8 w-8 text-gray-600" />;
      default:
        return <Package className="h-8 w-8 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {error || 'Order Not Found'}
        </h2>
        <button
          onClick={() => navigate('/orders')}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600 mt-1">Order ID: {order.id.substring(0, 8)}...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.payment_status)}
                <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(order.payment_status)}`}>
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b">
                <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">{order.payment_provider}</p>
                  <p className="text-sm text-gray-500 font-mono">{order.external_order_id}</p>
                </div>
              </div>

              {productAccess && (
                <div className="flex items-start gap-3 pb-4 border-b">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Product Access</p>
                    <p className="font-medium text-gray-900">
                      {productAccess.is_active ? 'Active' : 'Inactive'}
                    </p>
                    {productAccess.access_expires_at && (
                      <p className="text-sm text-gray-500">
                        Expires: {formatDate(productAccess.access_expires_at)}
                      </p>
                    )}
                    {!productAccess.access_expires_at && (
                      <p className="text-sm text-green-600">Lifetime Access</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
            <div className="flex gap-4">
              {order.products.thumbnail_url ? (
                <img
                  src={order.products.thumbnail_url}
                  alt={order.products.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{order.products.title}</h3>
                <p className="text-sm text-gray-600 capitalize mb-2">
                  {order.products.product_type.replace('_', ' ')}
                </p>
                {order.products.description && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {order.products.description}
                  </p>
                )}
              </div>
            </div>

            {order.products.settings?.downloadable_files && order.payment_status === 'paid' && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-3">Downloadable Files</h4>
                <div className="space-y-2">
                  {order.products.settings.downloadable_files.map((file: any, idx: number) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Download className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 sticky top-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {order.metadata?.customer_name || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{order.billing_email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.amount, order.currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(order.amount, order.currency)}</span>
                </div>
              </div>
            </div>

            {order.payment_status === 'paid' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Payment completed successfully on {formatDate(order.updated_at)}
                </p>
              </div>
            )}

            {order.payment_status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Payment is being processed. This usually takes a few minutes.
                </p>
              </div>
            )}

            {order.payment_status === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Payment failed. Please contact the customer or attempt a new transaction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
