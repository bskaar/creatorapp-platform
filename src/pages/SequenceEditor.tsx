import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Mail,
  Clock,
  Play,
  Pause,
  Edit,
  ChevronUp,
  ChevronDown,
  Loader2,
} from 'lucide-react';

interface Sequence {
  id: string;
  site_id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_config: any;
  status: string;
  subscribers_count: number;
  steps: Array<{
    id: string;
    type: 'email' | 'wait' | 'condition';
    config: any;
    order: number;
  }>;
}

interface EmailStep {
  type: 'email';
  subject: string;
  content: string;
  delay_days: number;
  delay_hours: number;
}

interface WaitStep {
  type: 'wait';
  wait_days: number;
  wait_hours: number;
}

export default function SequenceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sequence, setSequence] = useState<Sequence | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<Array<EmailStep | WaitStep>>([]);
  const [showAddStep, setShowAddStep] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'manual',
    status: 'draft',
  });

  useEffect(() => {
    if (id) {
      loadSequence();
    }
  }, [id]);

  const loadSequence = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('email_sequences')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) {
        setError('Sequence not found');
        setLoading(false);
        return;
      }

      setSequence(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        trigger_type: data.trigger_type,
        status: data.status,
      });
      setSteps(data.steps || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sequence) return;

    setSaving(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('email_sequences')
        .update({
          name: formData.name,
          description: formData.description,
          trigger_type: formData.trigger_type,
          steps: steps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sequence.id);

      if (updateError) throw updateError;
      await loadSequence();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!sequence) return;

    const newStatus = sequence.status === 'active' ? 'paused' : 'active';

    try {
      const { error: updateError } = await supabase
        .from('email_sequences')
        .update({
          status: newStatus,
        })
        .eq('id', sequence.id);

      if (updateError) throw updateError;
      await loadSequence();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addEmailStep = () => {
    setSteps([
      ...steps,
      {
        type: 'email',
        subject: '',
        content: '',
        delay_days: 0,
        delay_hours: 0,
      },
    ]);
    setShowAddStep(false);
  };

  const addWaitStep = () => {
    setSteps([
      ...steps,
      {
        type: 'wait',
        wait_days: 1,
        wait_hours: 0,
      },
    ]);
    setShowAddStep(false);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    setSteps(newSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...steps];
    (newSteps[index] as any)[field] = value;
    setSteps(newSteps);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !sequence) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sequence Not Found</h2>
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
            <h1 className="text-3xl font-bold text-gray-900">{sequence?.name}</h1>
            <p className="text-gray-600 mt-1">
              {sequence?.subscribers_count || 0} active subscribers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              sequence?.status === 'active'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {sequence?.status === 'active' ? (
              <>
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Activate</span>
              </>
            )}
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

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sequence Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Welcome Sequence"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Describe what this sequence does"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trigger Type *
          </label>
          <select
            value={formData.trigger_type}
            onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="manual">Manual</option>
            <option value="tag_added">Tag Added</option>
            <option value="product_purchased">Product Purchased</option>
            <option value="page_visited">Page Visited</option>
            <option value="funnel_entered">Funnel Entered</option>
            <option value="webinar_registered">Webinar Registered</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Sequence Steps</h2>
          <button
            onClick={() => setShowAddStep(!showAddStep)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Step</span>
          </button>
        </div>

        {showAddStep && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 mb-3">Choose step type:</p>
            <div className="flex gap-3">
              <button
                onClick={addEmailStep}
                className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 transition"
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Send Email</span>
              </button>
              <button
                onClick={addWaitStep}
                className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-400 transition"
              >
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Wait</span>
              </button>
            </div>
          </div>
        )}

        {steps.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No steps yet</h3>
            <p className="text-gray-600 mb-6">Add your first step to start building your sequence</p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveStepUp(index)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveStepDown(index)}
                      disabled={index === steps.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {step.type === 'email' ? (
                          <Mail className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          Step {index + 1}: {step.type === 'email' ? 'Send Email' : 'Wait'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeStep(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {step.type === 'email' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Delay (Days)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={step.delay_days}
                              onChange={(e) => updateStep(index, 'delay_days', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Delay (Hours)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={step.delay_hours}
                              onChange={(e) => updateStep(index, 'delay_hours', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject Line
                          </label>
                          <input
                            type="text"
                            value={step.subject}
                            onChange={(e) => updateStep(index, 'subject', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Email subject"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Content
                          </label>
                          <textarea
                            value={step.content}
                            onChange={(e) => updateStep(index, 'content', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            rows={4}
                            placeholder="Email content"
                          />
                        </div>
                      </>
                    )}

                    {step.type === 'wait' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Wait (Days)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={step.wait_days}
                            onChange={(e) => updateStep(index, 'wait_days', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Wait (Hours)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={step.wait_hours}
                            onChange={(e) => updateStep(index, 'wait_hours', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
