import { useState } from 'react';
import { Settings as SettingsIcon, Palette, Users, Mail, CreditCard, Zap } from 'lucide-react';
import GeneralSettings from '../components/settings/GeneralSettings';
import TeamSettings from '../components/settings/TeamSettings';
import EmailSettings from '../components/settings/EmailSettings';
import PaymentSettings from '../components/settings/PaymentSettings';
import SubscriptionSettings from '../components/settings/SubscriptionSettings';

type SettingsTab = 'general' | 'subscription' | 'team' | 'email' | 'payment';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: Palette },
    { id: 'subscription' as SettingsTab, label: 'Subscription', icon: Zap },
    { id: 'team' as SettingsTab, label: 'Team', icon: Users },
    { id: 'email' as SettingsTab, label: 'Email', icon: Mail },
    { id: 'payment' as SettingsTab, label: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your site settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'subscription' && <SubscriptionSettings />}
          {activeTab === 'team' && <TeamSettings />}
          {activeTab === 'email' && <EmailSettings />}
          {activeTab === 'payment' && <PaymentSettings />}
        </div>
      </div>
    </div>
  );
}
