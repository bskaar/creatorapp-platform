import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, ThumbsUp, ThumbsDown, RotateCw, MessageCircle, Minimize2, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';
import { useAuth } from '../contexts/AuthContext';
import { useAIUsage } from '../hooks/useAIUsage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  last_message_at: string;
}

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  initialMessage?: string;
}

export default function AIAssistantPanel({ isOpen, onClose, onMinimize, initialMessage }: AIAssistantPanelProps) {
  const { currentSite } = useSite();
  const { user, session } = useAuth();
  const { limits, refreshUsage } = useAIUsage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && currentSite && user) {
      loadConversations();
    }
  }, [isOpen, currentSite, user]);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  useEffect(() => {
    if (initialMessage && isOpen) {
      setInput(initialMessage);
    }
  }, [initialMessage, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!currentSite || !user) return;

    const { data, error } = await supabase
      .from('ai_conversations')
      .select('id, title, last_message_at')
      .eq('site_id', currentSite.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false })
      .limit(10);

    if (data && !error) {
      setConversations(data);
      if (data.length > 0 && !currentConversationId) {
        setCurrentConversationId(data[0].id);
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data && !error) {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !currentSite || !user || limits.isLimitReached) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    }]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach-chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            conversationId: currentConversationId,
            siteId: currentSite.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from AI coach');
      }

      const data = await response.json();

      if (!currentConversationId) {
        setCurrentConversationId(data.conversationId);
        await loadConversations();
      }

      setMessages(prev => [...prev, {
        id: data.messageId,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      }]);

      await refreshUsage();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setShowConversations(false);
  };

  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setShowConversations(false);
  };

  const createGameplan = async () => {
    if (!input.trim() || loading || !currentSite || !user || limits.isLimitReached) return;

    const goal = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate-gameplan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal,
            siteId: currentSite.id,
            conversationId: currentConversationId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate gameplan');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: 'gameplan-' + Date.now(),
        role: 'assistant',
        content: `I've created your gameplan: **${data.gameplan.title}**\n\n${data.gameplan.description}\n\nI've broken this down into ${data.gameplan.taskCount} actionable tasks. You can view and manage your gameplan from the dashboard.`,
        created_at: new Date().toISOString(),
      }]);

      await refreshUsage();
    } catch (error) {
      console.error('Error creating gameplan:', error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error creating your gameplan. Please try again.',
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">AI Co-Founder</h2>
              <p className="text-xs text-blue-100">Your 24/7 Marketing Coach</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConversations(!showConversations)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Conversations"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {limits.isLimitReached ? (
          <div className="flex items-center gap-2 text-xs bg-red-500/20 border border-red-300/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4" />
            <span>Daily limit reached. Upgrade to Pro for 500 requests/day</span>
          </div>
        ) : (
          <div className="text-xs text-blue-100">
            {limits.remainingRequests} AI requests remaining today ({limits.planName} Plan)
          </div>
        )}
      </div>

      {showConversations ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Conversations</h3>
            <button
              onClick={startNewConversation}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + New Chat
            </button>
          </div>
          <div className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  currentConversationId === conv.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <p className="font-medium text-gray-900 text-sm truncate">{conv.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(conv.last_message_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to Your AI Co-Founder
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  I'm here to help you build and grow your creator business. Ask me anything about:
                </p>
                <div className="space-y-2 text-left max-w-sm mx-auto">
                  <button
                    onClick={() => setInput('How do I create my first sales funnel?')}
                    className="w-full p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors text-left"
                  >
                    How do I create my first sales funnel?
                  </button>
                  <button
                    onClick={() => setInput('What should my lead magnet be?')}
                    className="w-full p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors text-left"
                  >
                    What should my lead magnet be?
                  </button>
                  <button
                    onClick={() => setInput('Help me write a welcome email sequence')}
                    className="w-full p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors text-left"
                  >
                    Help me write a welcome email sequence
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => {
                        const boldRegex = /\*\*(.*?)\*\*/g;
                        const parts = line.split(boldRegex);

                        return (
                          <p key={i} className={message.role === 'user' ? 'text-white' : ''}>
                            {parts.map((part, j) =>
                              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Your co-founder is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2 mb-3">
              <button
                onClick={createGameplan}
                disabled={loading || !input.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create Gameplan
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Plan, build, or ask anything..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
