'use client';

import { useEffect, useState } from 'react';

export default function LandingVisitStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/analytics/landing-visits', { cache: 'no-store' });
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Failed to load landing visits:', e);
        setData({
          totals: { last30Days: 0, today: 0 },
          byDay: [],
          sources: []
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="h-48 bg-gray-700 rounded mt-6"></div>
      </div>
    );
  }

  const totals = data?.totals || { last30Days: 0, today: 0 };
  const byDay = data?.byDay || [];
  const sources = data?.sources || [];
  const maxVisits = Math.max(...byDay.map(d => d.visits), 1);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Landing Page Visits</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Visits Today</div>
          <div className="text-2xl font-bold text-white mt-1">{totals.today.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Last 30 Days</div>
          <div className="text-2xl font-bold text-white mt-1">{totals.last30Days.toLocaleString()}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <div className="text-sm text-gray-400">Top Source</div>
          <div className="text-2xl font-bold text-white mt-1">
            {sources[0]?.source || 'N/A'} <span className="text-gray-400 text-lg">({sources[0]?.count || 0})</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Visits (Last 14 Days)</h3>
        </div>
        {byDay.length > 0 ? (
          <div className="h-48 flex items-end space-x-2">
            {byDay.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-green-500 rounded"
                  style={{ height: `${(d.visits / maxVisits) * 120}px` }}
                  title={`${d.day}: ${d.visits.toLocaleString()} visits`}
                />
                <div className="mt-2 text-xs text-gray-400">{d.day.slice(5)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-gray-400">No visits recorded</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">UTM Sources (30 days)</h3>
        <div className="flex flex-wrap gap-2">
          {sources.length > 0 ? (
            sources.map((s, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-800 text-gray-200 border border-gray-700 rounded-full text-sm"
                title={`${s.source}: ${s.count}`}
              >
                {s.source} · {s.count}
              </span>
            ))
          ) : (
            <span className="text-gray-400">No UTM data</span>
          )}
        </div>
      </div>
    </div>
  );
}

