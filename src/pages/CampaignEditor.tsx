import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Send, Eye, Loader2, Mail, Users, Calendar } from 'lucide-react';
import AITextGenerator from '../components/AITextGenerator';

interface Campaign {
  id: string;
  site_id: string;
  name: string;
  subject: string;
  preview_text: string;
  content: any;
  campaign_type: string;
  status: string;
  scheduled_at: string | null;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
}

export default function CampaignEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiGeneratorField, setAIGeneratorField] = useState<'subject' | 'content'>('subject');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preview_text: '',
    content: '',
  });

  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id]);

  const loadCampaign = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) {
        setError('Campaign not found');
        setLoading(false);
        return;
      }

      setCampaign(data);
      setFormData({
        name: data.name,
        subject: data.subject || '',
        preview_text: data.preview_text || '',
        content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!campaign) return;

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          name: formData.name,
          subject: formData.subject,
          preview_text: formData.preview_text,
          content: formData.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', campaign.id);

      if (updateError) throw updateError;
      await loadCampaign();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!campaign) return;

    const scheduledDate = prompt('Enter date and time (YYYY-MM-DD HH:MM):');
    if (!scheduledDate) return;

    try {
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          status: 'scheduled',
          scheduled_at: new Date(scheduledDate).toISOString(),
        })
        .eq('id', campaign.id);

      if (updateError) throw updateError;
      await loadCampaign();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendNow = async () => {
    if (!campaign) return;

    if (!confirm('Send this campaign to all subscribers now? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          status: 'sending',
        })
        .eq('id', campaign.id);

      if (updateError) throw updateError;

      const broadcastUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/broadcast-campaign`;
      const response = await fetch(broadcastUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ campaignId: campaign.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send campaign');
      }

      const result = await response.json();
      alert(`Campaign sent successfully! ${result.sentCount} emails delivered.`);
      navigate('/email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAIGenerate = (generatedText: string) => {
    if (aiGeneratorField === 'subject') {
      setFormData(prev => ({ ...prev, subject: generatedText }));
    } else {
      setFormData(prev => ({ ...prev, content: generatedText }));
    }
    setShowAIGenerator(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
        <button
          onClick={() => navigate('/email')}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Email
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/email')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign?.name}</h1>
            <p className="text-gray-600 mt-1">
              Status: <span className="capitalize font-medium">{campaign?.status}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Eye className="h-5 w-5" />
            <span>Preview</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {campaign && campaign.status === 'draft' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Ready to send?</h3>
              <p className="text-sm text-blue-700">
                Review your campaign and send it to your subscribers
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSchedule}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </button>
              <button
                onClick={handleSendNow}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Send className="h-4 w-4" />
                <span>Send Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {campaign && campaign.status === 'sent' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.sent_count || 0}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opened</p>
                <p className="text-2xl font-bold text-green-600">{campaign.opened_count || 0}</p>
                <p className="text-xs text-gray-500">
                  {campaign.sent_count ? ((campaign.opened_count / campaign.sent_count) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clicked</p>
                <p className="text-2xl font-bold text-blue-600">{campaign.clicked_count || 0}</p>
                <p className="text-xs text-gray-500">
                  {campaign.sent_count ? ((campaign.clicked_count / campaign.sent_count) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Awesome Campaign"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Subject Line *
            </label>
            <button
              onClick={() => {
                setAIGeneratorField('subject');
                setShowAIGenerator(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Generate with AI
            </button>
          </div>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email subject line"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview Text
          </label>
          <input
            type="text"
            value={formData.preview_text}
            onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="This text appears in the inbox preview"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Email Content *
            </label>
            <button
              onClick={() => {
                setAIGeneratorField('content');
                setShowAIGenerator(true);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Generate with AI
            </button>
          </div>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={20}
            placeholder="Write your email content here..."
          />
          <p className="text-sm text-gray-500 mt-2">
            You can use HTML or plain text. Variables: {'{'}first_name{'}'}, {'{'}last_name{'}'}, {'{'}email{'}'}
          </p>
        </div>
      </div>

      {showAIGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                AI {aiGeneratorField === 'subject' ? 'Subject Line' : 'Content'} Generator
              </h2>
              <button
                onClick={() => setShowAIGenerator(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <AITextGenerator
                context={`Campaign: ${formData.name}\nSubject: ${formData.subject}\nType: Email ${aiGeneratorField}`}
                onGenerated={handleAIGenerate}
                placeholder={`Generate ${aiGeneratorField === 'subject' ? 'subject line' : 'email content'}...`}
              />
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Email Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 pb-6 border-b">
                <div className="text-sm text-gray-600 mb-2">Subject:</div>
                <div className="font-semibold text-gray-900">{formData.subject}</div>
                {formData.preview_text && (
                  <>
                    <div className="text-sm text-gray-600 mt-4 mb-2">Preview:</div>
                    <div className="text-sm text-gray-700">{formData.preview_text}</div>
                  </>
                )}
              </div>
              <div className="prose max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(formData.content, {
                      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'div', 'span', 'blockquote', 'code', 'pre', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
                      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'src', 'alt', 'title', 'width', 'height', 'style']
                    })
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
