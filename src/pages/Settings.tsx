import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your site settings and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Site Settings</h2>
        <p className="text-gray-600">Configuration options coming soon</p>
      </div>
    </div>
  );
}
