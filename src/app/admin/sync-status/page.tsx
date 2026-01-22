'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  services?: {
    airtable: { status: string; configured: boolean };
    eonpro: { status: string; configured: boolean };
    stripe: { status: string; configured: boolean };
    clerk: { status: string; configured: boolean };
  };
}

interface SyncStats {
  total: number;
  synced: number;
  pending: number;
  failed: number;
}

export default function SyncStatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState<SyncStats>({ total: 0, synced: 0, pending: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      
      // Fetch health status
      const healthResponse = await fetch('/api/health?verbose=true');
      const healthData = await healthResponse.json();
      setHealth(healthData);

      // Fetch sync stats from EONPRO status endpoint
      try {
        const statsResponse = await fetch('/api/admin/eonpro-status');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.stats) {
            setStats(statsData.stats);
          }
        }
      } catch {
        // Stats endpoint may not be available
      }

      setLastChecked(new Date());
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIndicator = (status: string, configured: boolean) => {
    if (!configured) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
          <span className="text-sm text-slate-500">Not Configured</span>
        </div>
      );
    }
    if (status === 'healthy' || status === 'connected') {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-emerald-600 font-medium">Operational</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
        <span className="text-sm text-red-600 font-medium">Issue Detected</span>
      </div>
    );
  };

  const syncRate = stats.total > 0 
    ? Math.round((stats.synced / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sync Status</h1>
          <p className="text-slate-500 mt-1">
            Monitor EONPRO integration health and sync statistics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            href="/admin"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Sync Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Total Submissions</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Synced to EONPRO</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.synced || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Pending Sync</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pending || '--'}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500">Failed</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.failed || '--'}</p>
        </div>
      </div>

      {/* Sync Rate Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Sync Success Rate</h2>
          <span className="text-2xl font-bold text-emerald-600">{syncRate}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${syncRate}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {stats.synced} of {stats.total} submissions successfully synced to EONPRO
        </p>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Service Status</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Airtable</p>
                <p className="text-sm text-slate-500">Patient data storage</p>
              </div>
            </div>
            {getStatusIndicator(
              health?.services?.airtable?.status || 'unknown',
              health?.services?.airtable?.configured ?? false
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">EONPRO</p>
                <p className="text-sm text-slate-500">EMR patient sync</p>
              </div>
            </div>
            {getStatusIndicator(
              health?.services?.eonpro?.status || 'unknown',
              health?.services?.eonpro?.configured ?? false
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Stripe</p>
                <p className="text-sm text-slate-500">Payment processing</p>
              </div>
            </div>
            {getStatusIndicator(
              health?.services?.stripe?.status || 'unknown',
              health?.services?.stripe?.configured ?? false
            )}
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Clerk</p>
                <p className="text-sm text-slate-500">Authentication</p>
              </div>
            </div>
            {getStatusIndicator(
              health?.services?.clerk?.status || 'connected',
              health?.services?.clerk?.configured ?? true
            )}
          </div>
        </div>
      </div>

      {/* Last Checked */}
      <div className="text-sm text-slate-500 text-center">
        Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : 'Never'}
        <span className="mx-2">•</span>
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
