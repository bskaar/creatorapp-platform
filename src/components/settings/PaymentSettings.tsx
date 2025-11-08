import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';
import StripeConnectOnboarding from './StripeConnectOnboarding';

interface PaymentConfig {
  currency: string;
  tax_rate: number;
  tax_id: string;
  refund_policy_url: string;
  terms_url: string;
}

export default function PaymentSettings() {
  const { currentSite, refreshSites } = useSite();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'stripe' | 'general'>('stripe');
  const [formData, setFormData] = useState<PaymentConfig>({
    currency: 'USD',
    tax_rate: 0,
    tax_id: '',
    refund_policy_url: '',
    terms_url: '',
  });

  useEffect(() => {
    if (currentSite) {
      const paymentConfig = (currentSite.settings as any)?.payment_config || {};
      setFormData({
        currency: paymentConfig.currency || 'USD',
        tax_rate: paymentConfig.tax_rate || 0,
        tax_id: paymentConfig.tax_id || '',
        refund_policy_url: paymentConfig.refund_policy_url || '',
        terms_url: paymentConfig.terms_url || '',
      });
    }
  }, [currentSite]);

  const handleChange = (field: keyof PaymentConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!currentSite) return;

    setLoading(true);
    try {
      const settings = {
        ...(currentSite.settings as any || {}),
        payment_config: formData,
      };

      const { error } = await supabase
        .from('sites')
        .update({
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSite.id);

      if (error) throw error;

      await refreshSites();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      alert('Failed to save payment settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Settings</h3>
        <p className="text-sm text-gray-600">Configure payment processors and commerce settings</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('stripe')}
            className={`pb-3 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'stripe'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stripe
          </button>
        </nav>
      </div>

      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tax ID / VAT Number
            </label>
            <input
              type="text"
              value={formData.tax_id}
              onChange={(e) => handleChange('tax_id', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="US123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Policy URL
            </label>
            <input
              type="url"
              value={formData.refund_policy_url}
              onChange={(e) => handleChange('refund_policy_url', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yoursite.com/refund-policy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions URL
            </label>
            <input
              type="url"
              value={formData.terms_url}
              onChange={(e) => handleChange('terms_url', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yoursite.com/terms"
            />
          </div>
        </div>
      )}

      {activeTab === 'stripe' && <StripeConnectOnboarding />}


      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Save className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
