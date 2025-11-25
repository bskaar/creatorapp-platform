import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { Database } from '../lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactTag = Database['public']['Tables']['tags']['Row'];

export default function Contacts() {
  const { currentSite } = useSite();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    tagCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    if (!currentSite) return;
    loadData();
  }, [currentSite, filterStatus, searchTerm]);

  const loadData = async () => {
    if (!currentSite) return;

    let query = supabase
      .from('contacts')
      .select('*')
      .eq('site_id', currentSite.id)
      .order('created_at', { ascending: false });

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    if (searchTerm) {
      query = query.or(
        `email.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
      );
    }

    const [contactsResult, tagsResult, statsResult] = await Promise.all([
      query,
      supabase.from('tags').select('*').eq('site_id', currentSite.id),
      supabase
        .from('contacts')
        .select('id, status', { count: 'exact' })
        .eq('site_id', currentSite.id),
    ]);

    if (contactsResult.data) {
      setContacts(contactsResult.data);
    }

    if (tagsResult.data) {
      setTags(tagsResult.data);
    }

    if (statsResult.data) {
      const total = statsResult.data.length;
      const active = statsResult.data.filter((c) => c.status === 'active').length;
      const unsubscribed = statsResult.data.filter((c) => c.status === 'unsubscribed').length;
      setStats({
        total,
        active,
        unsubscribed,
        tagCount: tagsResult.data?.length || 0,
      });
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setError('');
    setSaving(true);

    try {
      if (editingContact) {
        const { error: updateError } = await supabase
          .from('contacts')
          .update({
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone,
          })
          .eq('id', editingContact.id);

        if (updateError) throw updateError;
      } else {
        const { data: existing } = await supabase
          .from('contacts')
          .select('id')
          .eq('site_id', currentSite.id)
          .eq('email', formData.email)
          .maybeSingle();

        if (existing) {
          setError('A contact with this email already exists.');
          setSaving(false);
          return;
        }

        const { error: insertError } = await supabase.from('contacts').insert({
          site_id: currentSite.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          status: 'active',
          source: 'manual',
        });

        if (insertError) throw insertError;
      }

      setShowAddModal(false);
      setEditingContact(null);
      setFormData({ email: '', first_name: '', last_name: '', phone: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      email: contact.email,
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      phone: contact.phone || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact? This action cannot be undone.')) return;

    await supabase.from('contacts').delete().eq('id', id);
    loadData();
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingContact(null);
    setFormData({ email: '', first_name: '', last_name: '', phone: '' });
    setError('');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSite) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileType || '')) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const rows = text.split('\n').filter((row) => row.trim());

      if (rows.length < 2) {
        alert('File must contain at least a header row and one data row');
        setImporting(false);
        return;
      }

      const headers = rows[0].split(',').map((h) => h.trim().toLowerCase());
      const emailIndex = headers.findIndex((h) => h.includes('email'));
      const firstNameIndex = headers.findIndex((h) => h.includes('first') && h.includes('name'));
      const lastNameIndex = headers.findIndex((h) => h.includes('last') && h.includes('name'));
      const phoneIndex = headers.findIndex((h) => h.includes('phone'));

      if (emailIndex === -1) {
        alert('CSV must contain an email column');
        setImporting(false);
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        const columns = rows[i].split(',').map((c) => c.trim());
        const email = columns[emailIndex]?.replace(/"/g, '');

        if (!email || !email.includes('@')) {
          failedCount++;
          errors.push(`Row ${i + 1}: Invalid email`);
          continue;
        }

        const { data: existing } = await supabase
          .from('contacts')
          .select('id')
          .eq('site_id', currentSite.id)
          .eq('email', email)
          .maybeSingle();

        if (existing) {
          failedCount++;
          errors.push(`Row ${i + 1}: ${email} already exists`);
          continue;
        }

        const { error: insertError } = await supabase.from('contacts').insert({
          site_id: currentSite.id,
          email,
          first_name: firstNameIndex !== -1 ? columns[firstNameIndex]?.replace(/"/g, '') : null,
          last_name: lastNameIndex !== -1 ? columns[lastNameIndex]?.replace(/"/g, '') : null,
          phone: phoneIndex !== -1 ? columns[phoneIndex]?.replace(/"/g, '') : null,
          status: 'active',
          source: 'import',
        });

        if (insertError) {
          failedCount++;
          errors.push(`Row ${i + 1}: ${insertError.message}`);
        } else {
          successCount++;
        }
      }

      setImportResults({ success: successCount, failed: failedCount, errors });
      loadData();
    } catch (err: any) {
      alert('Error processing file: ' + err.message);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-dark">Contacts & CRM</h1>
          <p className="text-text-secondary mt-2 text-lg">Manage your contacts, leads, and customers</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-border text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition"
          >
            <Upload className="h-5 w-5" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-card shadow-light p-6 border border-border">
          <h3 className="text-sm font-medium text-text-secondary mb-2 font-semibold">Total Contacts</h3>
          <p className="text-4xl font-bold text-dark">{stats.total}</p>
        </div>
        <div className="bg-white rounded-card shadow-light p-6 border border-border">
          <h3 className="text-sm font-medium text-text-secondary mb-2 font-semibold">Active</h3>
          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">{stats.active}</p>
        </div>
        <div className="bg-white rounded-card shadow-light p-6 border border-border">
          <h3 className="text-sm font-medium text-text-secondary mb-2 font-semibold">Unsubscribed</h3>
          <p className="text-3xl font-bold text-text-secondary font-semibold">{stats.unsubscribed}</p>
        </div>
        <div className="bg-white rounded-card shadow-light p-6 border border-border">
          <h3 className="text-sm font-medium text-text-secondary mb-2 font-semibold">Tags</h3>
          <p className="text-4xl font-bold text-dark">{stats.tagCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-light border border-border">
        <div className="p-4 border-b flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>

        {contacts.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Contacts Yet</h2>
            <p className="text-gray-600 mb-6">
              Start building your contact list by adding contacts manually
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
            >
              Add First Contact
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {contact.first_name?.[0] || contact.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-dark">
                            {contact.first_name || contact.last_name
                              ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
                              : 'No Name'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-text-secondary font-semibold">
                        <Mail className="h-4 w-4 mr-2" />
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary font-semibold">
                      {contact.phone ? (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {contact.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          contact.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : contact.status === 'unsubscribed'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {contact.source || 'unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/contacts/${contact.id}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-2 text-primary hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark">Import Contacts</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportResults(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {!importResults ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Must include an <strong>email</strong> column (required)</li>
                    <li>• Optional columns: first_name, last_name, phone</li>
                    <li>• First row must be column headers</li>
                    <li>• Excel files (.xlsx, .xls) will be treated as CSV</li>
                  </ul>
                </div>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  {importing ? (
                    <div className="space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="text-text-secondary font-semibold">Importing contacts...</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-900 font-medium mb-2">Upload CSV or Excel File</p>
                      <p className="text-sm text-gray-600 mb-4">Click to browse or drag and drop</p>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                      <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition">
                        Choose File
                      </span>
                    </label>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Example CSV Format:</h3>
                  <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-x-auto">
{`email,first_name,last_name,phone
john@example.com,John,Doe,555-1234
jane@example.com,Jane,Smith,555-5678`}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-6">
                  {importResults.success > 0 && (
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Import Complete</h3>
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">{importResults.success}</p>
                      <p className="text-sm text-green-700">Imported</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-3xl font-bold text-red-600">{importResults.failed}</p>
                      <p className="text-sm text-red-700">Failed</p>
                    </div>
                  </div>
                </div>

                {importResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Errors:
                    </h4>
                    <ul className="text-sm text-red-800 space-y-1">
                      {importResults.errors.slice(0, 10).map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                      {importResults.errors.length > 10 && (
                        <li className="font-medium">... and {importResults.errors.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportResults(null);
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-dark">
                {editingContact ? 'Edit Contact' : 'Add New Contact'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="contact@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border-2 border-primary/20 rounded-button hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 font-semibold text-text-primary hover:border-primary/40 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingContact ? 'Update' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
