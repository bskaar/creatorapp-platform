import { useAIUsage } from '../hooks/useAIUsage';
import { Brain, AlertTriangle, XCircle, Zap, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AIUsageMeterProps {
  showUpgradeLink?: boolean;
  compact?: boolean;
}

export default function AIUsageMeter({ showUpgradeLink = true, compact = false }: AIUsageMeterProps) {
  const { limits, loading, usagePercentage, usageStatus } = useAIUsage();

  if (loading) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-white border border-gray-200 rounded-xl`}>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading AI usage...</span>
        </div>
      </div>
    );
  }

  if (limits.isUnlimited) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Unlimited AI Sessions</p>
            <p className="text-sm text-gray-500">Enterprise plan - no limits</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColors = () => {
    switch (usageStatus) {
      case 'blocked':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          bar: 'bg-red-500',
          icon: 'bg-red-100 text-red-600',
          text: 'text-red-700',
        };
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          bar: 'bg-red-500',
          icon: 'bg-red-100 text-red-600',
          text: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          bar: 'bg-amber-500',
          icon: 'bg-amber-100 text-amber-600',
          text: 'text-amber-700',
        };
      default:
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          bar: 'bg-emerald-500',
          icon: 'bg-emerald-100 text-emerald-600',
          text: 'text-emerald-700',
        };
    }
  };

  const colors = getStatusColors();
  const maxSessions = limits.maxSessions ?? 0;
  const softMax = limits.softMaxSessions ?? 0;

  const formatResetDate = () => {
    if (!limits.cycleEndDate) return 'soon';
    const now = new Date();
    const diff = limits.cycleEndDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'today';
    if (days === 1) return 'tomorrow';
    return `in ${days} days`;
  };

  if (compact) {
    return (
      <div className={`p-3 ${colors.bg} border ${colors.border} rounded-lg`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className={`w-4 h-4 ${colors.text}`} />
            <span className="text-sm font-medium text-gray-700">
              {limits.sessionsUsed} / {maxSessions} AI sessions
            </span>
          </div>
          {usageStatus === 'blocked' && (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          {usageStatus === 'critical' && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          {usageStatus === 'warning' && (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          )}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} transition-all duration-300`}
            style={{ width: `${Math.min(usagePercentage, 110)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${colors.bg} border ${colors.border} rounded-xl`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${colors.icon} flex items-center justify-center`}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">AI Usage This Month</p>
            <p className="text-sm text-gray-500">{limits.planName} Plan</p>
          </div>
        </div>
        {usageStatus === 'blocked' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            Limit Reached
          </div>
        )}
        {usageStatus === 'critical' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            In Overage
          </div>
        )}
        {usageStatus === 'warning' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            Approaching Limit
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-2xl font-bold text-gray-900">{limits.sessionsUsed}</span>
          <span className="text-sm text-gray-500">of {maxSessions} sessions</span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 ${colors.bar} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
          {usagePercentage >= 80 && usagePercentage < 100 && (
            <div
              className="absolute inset-y-0 bg-amber-400/50"
              style={{ left: '80%', right: `${100 - usagePercentage}%` }}
            />
          )}
          {usagePercentage > 100 && (
            <div
              className="absolute inset-y-0 bg-red-400"
              style={{ left: '100%', width: `${Math.min(usagePercentage - 100, 10)}%` }}
            />
          )}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>0%</span>
          <span>80%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Resets {formatResetDate()}</span>
        </div>
        <span className={`font-medium ${colors.text}`}>
          {limits.remainingBeforeWarning > 0
            ? `${limits.remainingBeforeWarning} remaining`
            : limits.remainingBeforeHardStop > 0
              ? `${limits.remainingBeforeHardStop} in overage buffer`
              : 'No sessions remaining'}
        </span>
      </div>

      {usageStatus === 'blocked' && showUpgradeLink && (
        <div className="mt-4 p-3 bg-white border border-red-200 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            You've exceeded your monthly AI limit. Upgrade to continue using AI features.
          </p>
          <Link
            to="/settings?tab=subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <Zap className="w-4 h-4" />
            Upgrade Plan
          </Link>
        </div>
      )}

      {usageStatus === 'critical' && showUpgradeLink && (
        <div className="mt-4 p-3 bg-white border border-amber-200 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            You've used your monthly AI sessions. You have {limits.remainingBeforeHardStop} sessions in your overage buffer before AI features pause.
          </p>
          <Link
            to="/settings?tab=subscription"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <Zap className="w-4 h-4" />
            Upgrade for More Sessions
          </Link>
        </div>
      )}
    </div>
  );
}
