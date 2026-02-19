import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, Package, Mail, Calendar, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrderItem {
  id: string;
  product_id: string;
  amount: number;
  currency: string;
  payment_status: string;
  created_at: string;
  billing_email: string;
  metadata: Record<string, any>;
  products: {
    title: string;
    product_type: string;
    thumbnail_url: string | null;
  } | null;
}

export default function CheckoutSuccess() {
  const { siteId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [siteName, setSiteName] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    localStorage.removeItem('cart');

    async function fetchOrderDetails() {
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select(`
            id,
            product_id,
            amount,
            currency,
            payment_status,
            created_at,
            billing_email,
            metadata,
            products (
              title,
              product_type,
              thumbnail_url
            )
          `)
          .eq('external_order_id', sessionId)
          .eq('site_id', siteId);

        if (orderData && orderData.length > 0) {
          setOrders(orderData as OrderItem[]);
        }

        const { data: siteData } = await supabase
          .from('sites')
          .select('name')
          .eq('id', siteId)
          .maybeSingle();

        if (siteData) {
          setSiteName(siteData.name);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [sessionId, siteId]);

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const total = orders.reduce((sum, o) => sum + o.amount, 0);
  const currency = orders[0]?.currency || 'USD';
  const customerEmail = orders[0]?.billing_email;
  const customerName = orders[0]?.metadata?.customer_name;
  const orderDate = orders[0]?.created_at;
  const isPaid = orders.some(o => o.payment_status === 'paid');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirming your order...</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-gray-600">No checkout session found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Confirmed!</h1>
          <p className="text-gray-600">
            {customerName ? `Thank you, ${customerName}!` : 'Thank you for your purchase!'}
            {siteName ? ` Your order from ${siteName} is confirmed.` : ' Your order is confirmed.'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Order Summary</h2>
            {isPaid && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3" />
                Paid
              </span>
            )}
          </div>

          {orders.length > 0 ? (
            <>
              <div className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <div key={order.id} className="px-6 py-4 flex items-center gap-4">
                    {order.products?.thumbnail_url ? (
                      <img
                        src={order.products.thumbnail_url}
                        alt={order.products.title}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Package className="h-7 w-7 text-blue-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {order.products?.title || 'Product'}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {order.products?.product_type?.replace(/_/g, ' ') || 'Digital product'}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 flex-shrink-0">
                      {formatCurrency(order.amount, order.currency)}
                    </p>
                  </div>
                ))}
              </div>

              {orders.length > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Order details will appear here once confirmed.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Order Details</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {customerEmail && (
              <div className="px-6 py-3 flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 w-28 flex-shrink-0">Confirmation to</span>
                <span className="text-sm text-gray-900">{customerEmail}</span>
              </div>
            )}
            {orderDate && (
              <div className="px-6 py-3 flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 w-28 flex-shrink-0">Order date</span>
                <span className="text-sm text-gray-900">{formatDate(orderDate)}</span>
              </div>
            )}
            <div className="px-6 py-3 flex items-center gap-3">
              <Hash className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 w-28 flex-shrink-0">Reference</span>
              <span className="text-sm font-mono text-gray-900">{sessionId.substring(0, 20)}...</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" />
            What happens next?
          </h3>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li>• A confirmation email with your receipt is on its way</li>
            <li>• Your access details will be included in that email</li>
            <li>• For courses and memberships, access is granted immediately</li>
            <li>• Digital products will be available for download via email</li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            to={`/site/${siteId}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Browse More Products
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Questions? Reply to your confirmation email or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
