import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Target, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  phase: 'Foundation' | 'Growth' | 'Optimization';
  estimated_time: string;
  order_index: number;
  completed_at: string | null;
}

interface Gameplan {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  progress_percentage: number;
  created_at: string;
  tasks: Task[];
}

export default function GameplanManager() {
  const { currentSite } = useSite();
  const { user } = useAuth();
  const [gameplans, setGameplans] = useState<Gameplan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameplan, setSelectedGameplan] = useState<string | null>(null);

  useEffect(() => {
    if (currentSite && user) {
      loadGameplans();
    }
  }, [currentSite, user]);

  const loadGameplans = async () => {
    if (!currentSite || !user) return;

    const { data: gameplansData, error } = await supabase
      .from('ai_gameplans')
      .select('*')
      .eq('site_id', currentSite.id)
      .eq('user_id', user.id)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: false });

    if (gameplansData && !error) {
      const gameplansWithTasks = await Promise.all(
        gameplansData.map(async (gameplan) => {
          const { data: tasks } = await supabase
            .from('ai_task_items')
            .select('*')
            .eq('gameplan_id', gameplan.id)
            .order('order_index', { ascending: true });

          return {
            ...gameplan,
            tasks: tasks || [],
          };
        })
      );

      setGameplans(gameplansWithTasks);
      if (gameplansWithTasks.length > 0 && !selectedGameplan) {
        setSelectedGameplan(gameplansWithTasks[0].id);
      }
    }

    setLoading(false);
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    const { error } = await supabase
      .from('ai_task_items')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', taskId);

    if (!error) {
      await loadGameplans();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'Foundation':
        return Target;
      case 'Growth':
        return TrendingUp;
      case 'Optimization':
        return Zap;
      default:
        return Circle;
    }
  };

  const currentGameplan = gameplans.find(g => g.id === selectedGameplan);

  if (loading) {
    return (
      <div className="bg-white rounded-card shadow-light p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (gameplans.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-card shadow-light p-8 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-dark">Your Gameplans</h2>
        {gameplans.length > 1 && (
          <select
            value={selectedGameplan || ''}
            onChange={(e) => setSelectedGameplan(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {gameplans.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        )}
      </div>

      {currentGameplan && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{currentGameplan.title}</h3>
            <p className="text-gray-700 mb-4">{currentGameplan.description}</p>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{currentGameplan.progress_percentage}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-700 h-full transition-all duration-500"
                    style={{ width: `${currentGameplan.progress_percentage}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {currentGameplan.tasks.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-600">of {currentGameplan.tasks.length} done</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {['Foundation', 'Growth', 'Optimization'].map(phase => {
              const phaseTasks = currentGameplan.tasks.filter(t => t.phase === phase);
              if (phaseTasks.length === 0) return null;

              const PhaseIcon = getPhaseIcon(phase);

              return (
                <div key={phase}>
                  <div className="flex items-center gap-2 mb-3">
                    <PhaseIcon className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-gray-900">{phase}</h4>
                    <span className="text-sm text-gray-500">({phaseTasks.length} tasks)</span>
                  </div>

                  <div className="space-y-2 ml-7">
                    {phaseTasks.map(task => (
                      <div
                        key={task.id}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                          task.status === 'completed'
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <button
                          onClick={() => toggleTaskStatus(task.id, task.status)}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 hover:text-blue-600 transition-colors" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${
                            task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.estimated_time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
