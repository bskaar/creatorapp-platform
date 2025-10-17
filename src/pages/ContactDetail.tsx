import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Plus,
  X,
  ShoppingCart,
  FileText,
  Activity,
} from 'lucide-react';
import type { Database } from '../lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactTag = Database['public']['Tables']['tags']['Row'];

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [allTags, setAllTags] = useState<ContactTag[]>([]);
  const [contactTags, setContactTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [savingTag, setSavingTag] = useState(false);

  useEffect(() => {
    if (!currentSite || !id) return;
    loadContactData();
  }, [currentSite, id]);

  const loadContactData = async () => {
    if (!currentSite || !id) return;

    const [contactResult, tagsResult] = await Promise.all([
      supabase.from('contacts').select('*').eq('id', id).eq('site_id', currentSite.id).maybeSingle(),
      supabase.from('tags').select('*').eq('site_id', currentSite.id),
    ]);

    if (contactResult.data) {
      setContact(contactResult.data);
      setContactTags((contactResult.data.tags as string[]) || []);
    } else {
      navigate('/contacts');
      return;
    }

    if (tagsResult.data) {
      setAllTags(tagsResult.data);
    }

    setLoading(false);
  };

  const createTag = async () => {
    if (!currentSite || !newTagName.trim()) return;

    setSavingTag(true);

    const { data, error } = await supabase
      .from('tags')
      .insert({
        site_id: currentSite.id,
        name: newTagName.trim(),
        tag_type: 'contact',
      })
      .select()
      .single();

    if (!error && data) {
      setAllTags([...allTags, data]);
      await addTagToContact(data.id);
      setNewTagName('');
      setShowTagModal(false);
    }

    setSavingTag(false);
  };

  const addTagToContact = async (tagId: string) => {
    if (!contact) return;

    const updatedTags = [...contactTags, tagId];

    const { error } = await supabase
      .from('contacts')
      .update({ tags: updatedTags })
      .eq('id', contact.id);

    if (!error) {
      setContactTags(updatedTags);
    }
  };

  const removeTagFromContact = async (tagId: string) => {
    if (!contact) return;

    const updatedTags = contactTags.filter((t) => t !== tagId);

    const { error } = await supabase
      .from('contacts')
      .update({ tags: updatedTags })
      .eq('id', contact.id);

    if (!error) {
      setContactTags(updatedTags);
    }
  };

  const toggleTag = async (tagId: string) => {
    if (contactTags.includes(tagId)) {
      await removeTagFromContact(tagId);
    } else {
      await addTagToContact(tagId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contact) return null;

  const displayName =
    contact.first_name || contact.last_name
      ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
      : 'No Name';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/contacts')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-gray-600 mt-1">{contact.email}</p>
        </div>
        <span
          className={`px-4 py-2 text-sm rounded-full ${
            contact.status === 'active'
              ? 'bg-green-100 text-green-700'
              : contact.status === 'unsubscribed'
              ? 'bg-gray-100 text-gray-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {contact.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{contact.email}</p>
                </div>
              </div>

              {contact.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{contact.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contact Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium text-gray-900 capitalize">{contact.source || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Contact Created</p>
                  <p className="text-sm text-gray-500">
                    {new Date(contact.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Added via {contact.source || 'unknown'}</p>
                </div>
              </div>

              {contact.updated_at !== contact.created_at && (
                <div className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Profile Updated</p>
                    <p className="text-sm text-gray-500">
                      {new Date(contact.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">More activity will appear here as interactions occur</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tags</h2>
              <button
                onClick={() => setShowTagModal(true)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-2">
              {allTags.length === 0 ? (
                <div className="text-center py-4">
                  <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No tags yet</p>
                  <button
                    onClick={() => setShowTagModal(true)}
                    className="text-sm text-blue-600 hover:underline mt-2"
                  >
                    Create your first tag
                  </button>
                </div>
              ) : (
                allTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={contactTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </div>
                  </label>
                ))
              )}
            </div>

            {contactTags.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">Applied Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {contactTags.map((tagId) => {
                    const tag = allTags.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span
                        key={tagId}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        <span>{tag.name}</span>
                        <button
                          onClick={() => removeTagFromContact(tagId)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Spent</span>
                <span className="font-semibold text-gray-900">$0.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Orders</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Emails Opened</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Links Clicked</span>
                <span className="font-semibold text-gray-900">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Tag</h2>
              <button
                onClick={() => {
                  setShowTagModal(false);
                  setNewTagName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag Name *</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., VIP Customer, Newsletter Subscriber"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      createTag();
                    }
                  }}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowTagModal(false);
                    setNewTagName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createTag}
                  disabled={savingTag || !newTagName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {savingTag ? 'Creating...' : 'Create Tag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
