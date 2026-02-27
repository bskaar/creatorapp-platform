import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, GripVertical, Star, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';

interface Product {
  id: string;
  title: string;
  description: string;
  price_amount: number;
  price_currency: string;
  billing_type: string;
  billing_interval: string | null;
  features: string[];
  is_highlighted: boolean;
  status: string;
}

interface PricingPlan {
  productId: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  highlighted: boolean;
}

interface PricingBlockEditorProps {
  content: {
    headline?: string;
    subheadline?: string;
    plans?: PricingPlan[];
  };
  onUpdate: (content: Record<string, any>) => void;
}

export default function PricingBlockEditor({ content, onUpdate }: PricingBlockEditorProps) {
  const { currentSite } = useSite();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductPicker, setShowProductPicker] = useState(false);

  useEffect(() => {
    if (currentSite) {
      loadProducts();
    }
  }, [currentSite?.id]);

  const loadProducts = async () => {
    if (!currentSite) return;

    const { data, error } = await supabase
      .from('products')
      .select('id, title, description, price_amount, price_currency, billing_type, billing_interval, features, is_highlighted, status')
      .eq('site_id', currentSite.id)
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleHeadlineChange = (value: string) => {
    onUpdate({ ...content, headline: value });
  };

  const handleSubheadlineChange = (value: string) => {
    onUpdate({ ...content, subheadline: value });
  };

  const addProductToPricing = (product: Product) => {
    const newPlan: PricingPlan = {
      productId: product.id,
      name: product.title,
      price: formatPrice(product.price_amount, product.price_currency),
      period: product.billing_type === 'recurring'
        ? `/${product.billing_interval || 'month'}`
        : 'one-time',
      features: product.features || [],
      buttonText: 'Get Started',
      highlighted: product.is_highlighted,
    };

    const plans = [...(content.plans || []), newPlan];
    onUpdate({ ...content, plans });
    setShowProductPicker(false);
  };

  const removePlan = (index: number) => {
    const plans = content.plans?.filter((_, i) => i !== index) || [];
    onUpdate({ ...content, plans });
  };

  const updatePlan = (index: number, field: keyof PricingPlan, value: any) => {
    const plans = [...(content.plans || [])];
    plans[index] = { ...plans[index], [field]: value };
    onUpdate({ ...content, plans });
  };

  const updatePlanFeature = (planIndex: number, featureIndex: number, value: string) => {
    const plans = [...(content.plans || [])];
    const features = [...(plans[planIndex].features || [])];
    features[featureIndex] = value;
    plans[planIndex] = { ...plans[planIndex], features };
    onUpdate({ ...content, plans });
  };

  const addFeatureToPlan = (planIndex: number) => {
    const plans = [...(content.plans || [])];
    const features = [...(plans[planIndex].features || []), 'New feature'];
    plans[planIndex] = { ...plans[planIndex], features };
    onUpdate({ ...content, plans });
  };

  const removeFeatureFromPlan = (planIndex: number, featureIndex: number) => {
    const plans = [...(content.plans || [])];
    const features = plans[planIndex].features.filter((_, i) => i !== featureIndex);
    plans[planIndex] = { ...plans[planIndex], features };
    onUpdate({ ...content, plans });
  };

  const movePlan = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= (content.plans?.length || 0)) return;
    const plans = [...(content.plans || [])];
    const [removed] = plans.splice(fromIndex, 1);
    plans.splice(toIndex, 0, removed);
    onUpdate({ ...content, plans });
  };

  const linkedProductIds = content.plans?.map(p => p.productId) || [];
  const availableProducts = products.filter(p => !linkedProductIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
        <input
          type="text"
          value={content.headline || ''}
          onChange={(e) => handleHeadlineChange(e.target.value)}
          placeholder="Simple, Transparent Pricing"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subheadline</label>
        <input
          type="text"
          value={content.subheadline || ''}
          onChange={(e) => handleSubheadlineChange(e.target.value)}
          placeholder="Choose the plan that works for you"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Pricing Plans</label>
          <button
            onClick={() => setShowProductPicker(true)}
            disabled={availableProducts.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {content.plans && content.plans.length > 0 ? (
          <div className="space-y-4">
            {content.plans.map((plan, planIndex) => (
              <div
                key={planIndex}
                className={`border rounded-lg p-4 ${plan.highlighted ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => movePlan(planIndex, planIndex - 1)}
                      disabled={planIndex === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <Package className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{plan.name}</span>
                    {plan.highlighted && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Popular</span>
                    )}
                  </div>
                  <button
                    onClick={() => removePlan(planIndex)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => updatePlan(planIndex, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={plan.buttonText}
                      onChange={(e) => updatePlan(planIndex, 'buttonText', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price Display</label>
                    <input
                      type="text"
                      value={plan.price}
                      onChange={(e) => updatePlan(planIndex, 'price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Period</label>
                    <input
                      type="text"
                      value={plan.period}
                      onChange={(e) => updatePlan(planIndex, 'period', e.target.value)}
                      placeholder="one-time, /month, /year"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={plan.highlighted}
                      onChange={(e) => updatePlan(planIndex, 'highlighted', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Star className="h-4 w-4 text-yellow-500" />
                    Highlight as Popular
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Features</label>
                  <div className="space-y-2">
                    {plan.features?.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updatePlanFeature(planIndex, featureIndex, e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                        />
                        <button
                          onClick={() => removeFeatureFromPlan(planIndex, featureIndex)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addFeatureToPlan(planIndex)}
                      className="w-full py-1.5 border border-dashed border-gray-300 rounded text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
                    >
                      + Add Feature
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No products linked yet</p>
            <p className="text-sm text-gray-400">Add products from your Content Library to display pricing</p>
          </div>
        )}
      </div>

      {showProductPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select a Product</h3>
              <button
                onClick={() => setShowProductPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading products...</div>
              ) : availableProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No available products</p>
                  <p className="text-sm text-gray-400">
                    All published products have been added, or you need to create and publish products first.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addProductToPricing(product)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{product.title}</h4>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-gray-900">
                            {formatPrice(product.price_amount, product.price_currency)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.billing_type === 'recurring' ? `/${product.billing_interval}` : 'one-time'}
                          </p>
                        </div>
                      </div>
                      {product.is_highlighted && (
                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                          <Star className="h-3 w-3" /> Highlighted
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
