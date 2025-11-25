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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-dark">Settings</h1>
        <p className="text-text-secondary mt-2 text-lg">Manage your site settings and preferences</p>
      </div>

      <div className="bg-white rounded-card shadow-light overflow-hidden border border-border">
        <div className="border-b border-border overflow-x-auto">
          <nav className="flex min-w-min">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-semibold text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-gradient-to-b from-primary/5 to-transparent'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-gradient-to-b hover:from-primary/5 hover:to-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
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
