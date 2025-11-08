import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Check, Loader2, Clock, Infinity } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  product_type: string;
  price_amount: number;
  price_currency: string;
  billing_type: 'one_time' | 'recurring';
  billing_interval: string | null;
  thumbnail_url: string | null;
  access_duration_days: number | null;
  status: string;
  settings: any;
  site_id: string;
}

export default function ProductPublic() {
  const { siteId, productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (siteId && productId) {
      loadProduct();
    }
  }, [siteId, productId]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('site_id', siteId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getProductTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      course: 'Online Course',
      membership: 'Membership',
      digital: 'Digital Product',
      coaching: 'Coaching Session',
    };
    return labels[type] || type;
  };

  const getBillingText = () => {
    if (!product) return '';
    if (product.billing_type === 'one_time') return 'One-time payment';

    const intervals: Record<string, string> = {
      monthly: 'per month',
      quarterly: 'every 3 months',
      yearly: 'per year',
    };
    return intervals[product.billing_interval || ''] || 'recurring';
  };

  const handleAddToCart = () => {
    setAddingToCart(true);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingItem = cart.find((item: any) => item.productId === productId);
    if (!existingItem) {
      cart.push({
        productId,
        siteId,
        title: product?.title,
        price: product?.price_amount,
        currency: product?.price_currency,
        billingType: product?.billing_type,
        billingInterval: product?.billing_interval,
      });
      localStorage.setItem('cart', JSON.stringify(cart));
    }

    setTimeout(() => {
      navigate(`/site/${siteId}/checkout`);
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600">This product is not available or has been removed.</p>
        </div>
      </div>
    );
  }

  const images = product.settings?.images || [];
  const mainImage = images[0] || product.thumbnail_url;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-24 w-24 text-gray-400" />
                </div>
              )}

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {images.slice(1, 5).map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product.title} ${idx + 2}`}
                      className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 flex flex-col">
              <div className="mb-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {getProductTypeLabel(product.product_type)}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {formatPrice(product.price_amount, product.price_currency)}
                  </span>
                  {product.billing_type === 'recurring' && (
                    <span className="text-xl text-gray-600">
                      /{product.billing_interval === 'monthly' ? 'mo' : product.billing_interval === 'yearly' ? 'yr' : 'qtr'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{getBillingText()}</p>
              </div>

              {product.description && (
                <div className="prose prose-sm max-w-none mb-8 text-gray-700 flex-grow">
                  <p className="whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-700">
                  {product.access_duration_days ? (
                    <>
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span>Access for {product.access_duration_days} days</span>
                    </>
                  ) : (
                    <>
                      <Infinity className="h-5 w-5 text-blue-600" />
                      <span>Lifetime access</span>
                    </>
                  )}
                </div>

                {product.product_type === 'course' && (
                  <>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Learn at your own pace</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Full course materials included</span>
                    </div>
                  </>
                )}

                {product.product_type === 'membership' && (
                  <>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Exclusive member content</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Cancel anytime</span>
                    </div>
                  </>
                )}

                {product.product_type === 'digital' && (
                  <>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Instant download</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Check className="h-5 w-5 text-green-600" />
                      <span>Digital delivery only</span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="w-full py-4 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
