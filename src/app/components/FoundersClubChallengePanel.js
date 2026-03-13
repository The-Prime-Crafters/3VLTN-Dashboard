'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

const STATUS_TABS = ['pending', 'approved', 'rejected', 'all'];

export default function FoundersClubChallengePanel() {
  const [email, setEmail] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState('');

  const [challengeReason, setChallengeReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [adminKeyOverride, setAdminKeyOverride] = useState('');
  const [queueStatus, setQueueStatus] = useState('pending');
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState('');
  const [queue, setQueue] = useState([]);
  const [queueCounts, setQueueCounts] = useState(null);
  const [actioningEmail, setActioningEmail] = useState('');

  const adminHeaders = useMemo(() => {
    if (!adminKeyOverride.trim()) return {};
    return { 'x-admin-key': adminKeyOverride.trim() };
  }, [adminKeyOverride]);

  const checkStatus = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setStatusError('Email is required.');
      return;
    }

    setStatusLoading(true);
    setStatusError('');
    setStatusResult(null);

    try {
      const res = await fetch('/api/founders-club/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to check status.');
      }
      setStatusResult(data.application || null);
    } catch (err) {
      setStatusError(err.message || 'Failed to check status.');
    } finally {
      setStatusLoading(false);
    }
  };

  const submitChallenge = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !challengeReason.trim()) {
      setSubmitError('Email and challenge reason are required.');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      const res = await fetch('/api/founders-club/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          challengeReason: challengeReason.trim(),
          source: 'founders_locked'
        })
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to submit challenge.');
      }

      setSubmitMessage(data.message || 'Your challenge has been submitted. Our team will review it shortly.');
      loadQueue(queueStatus);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit challenge.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const loadQueue = async (status = queueStatus) => {
    setQueueLoading(true);
    setQueueError('');

    try {
      const res = await fetch(
        `/api/founders-club/admin/challenges?status=${encodeURIComponent(status)}&limit=200`,
        { headers: adminHeaders }
      );
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to fetch challenge list.');
      }

      setQueue(Array.isArray(data?.challenges) ? data.challenges : []);
      setQueueCounts(data?.counts || null);
    } catch (err) {
      setQueue([]);
      setQueueCounts(null);
      setQueueError(err.message || 'Failed to fetch challenge list.');
    } finally {
      setQueueLoading(false);
    }
  };

  const applyDecision = async (targetEmail, decision) => {
    if (!targetEmail) return;

    setActioningEmail(`${decision}:${targetEmail}`);
    setQueueError('');

    try {
      const res = await fetch('/api/founders-club/admin/challenge-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...adminHeaders
        },
        body: JSON.stringify({
          email: targetEmail,
          decision
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to apply challenge decision.');
      }
      await loadQueue(queueStatus);
    } catch (err) {
      setQueueError(err.message || 'Failed to apply challenge decision.');
    } finally {
      setActioningEmail('');
    }
  };

  useEffect(() => {
    loadQueue('pending');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTabClick = async (status) => {
    setQueueStatus(status);
    await loadQueue(status);
  };

  const getCountForTab = (status) => {
    if (!queueCounts) return null;
    if (status === 'pending') return queueCounts.pending_count;
    if (status === 'approved') return queueCounts.approved_count;
    if (status === 'rejected') return queueCounts.rejected_count;
    return queueCounts.total_count;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">User Challenge Flow</h3>

          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={checkStatus}
              disabled={statusLoading}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 inline-flex items-center gap-2"
            >
              {statusLoading && <Loader2 className="w-4 h-4 animate-spin" />} Check Status
            </button>
            <button
              onClick={submitChallenge}
              disabled={submitLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 inline-flex items-center gap-2"
            >
              {submitLoading && <Loader2 className="w-4 h-4 animate-spin" />} Submit Challenge
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Challenge Reason</label>
            <textarea
              value={challengeReason}
              onChange={(e) => setChallengeReason(e.target.value)}
              rows={5}
              placeholder="Explain why this account should be reviewed..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {statusError && <p className="text-sm text-red-400">{statusError}</p>}
          {submitError && <p className="text-sm text-red-400">{submitError}</p>}
          {submitMessage && <p className="text-sm text-green-400">{submitMessage}</p>}

          {statusResult && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-sm text-gray-300 space-y-1">
              <p><span className="text-gray-500">Name:</span> {statusResult.name || 'N/A'}</p>
              <p><span className="text-gray-500">Email:</span> {statusResult.email || 'N/A'}</p>
              <p><span className="text-gray-500">Status:</span> {statusResult.status || 'N/A'}</p>
              <p><span className="text-gray-500">Created:</span> {statusResult.created_at ? new Date(statusResult.created_at).toLocaleString() : 'N/A'}</p>
              <p><span className="text-gray-500">Challenge Reason:</span> {statusResult.challenge_reason || 'N/A'}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Admin Challenge Queue</h3>
          <p className="text-sm text-gray-400">If you are logged in as admin and `ADMIN_API_KEY` is set on server, key is auto-applied.</p>

          <div>
            <label className="text-sm text-gray-300 block mb-1.5">Admin API Key Override (optional)</label>
            <input
              type="password"
              value={adminKeyOverride}
              onChange={(e) => setAdminKeyOverride(e.target.value)}
              placeholder="Leave empty to use admin session auto-auth"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((status) => {
              const active = queueStatus === status;
              const count = getCountForTab(status);
              return (
                <button
                  key={status}
                  onClick={() => onTabClick(status)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${active
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}{typeof count === 'number' ? ` (${count})` : ''}
                </button>
              );
            })}
            <button
              onClick={() => loadQueue(queueStatus)}
              disabled={queueLoading}
              className="px-3 py-2 rounded-lg text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {queueError && <p className="text-sm text-red-400">{queueError}</p>}

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {queueLoading && (
              <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading queue...
              </div>
            )}

            {!queueLoading && queue.length === 0 && (
              <p className="text-sm text-gray-500">No challenges found for {queueStatus}.</p>
            )}

            {!queueLoading && queue.map((item) => {
              const pending = !item.decision || item.decision === 'pending';
              const approving = actioningEmail === `approved:${item.applicant_email}`;
              const rejecting = actioningEmail === `rejected:${item.applicant_email}`;

              return (
                <div key={item.id} className="rounded-lg border border-gray-800 bg-gray-900/50 p-3 text-sm text-gray-300 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-100">{item.applicant_email || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Created: {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}</p>
                      <p className="text-xs text-gray-500">Expires: {item.expires_at ? new Date(item.expires_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${pending ? 'bg-amber-500/20 text-amber-300' : item.decision === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {pending ? 'pending' : item.decision}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 whitespace-pre-wrap">{item.challenge_reason || 'No reason provided.'}</p>

                  {pending && queueStatus === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => applyDecision(item.applicant_email, 'approved')}
                        disabled={!!actioningEmail}
                        className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {approving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Approve
                      </button>
                      <button
                        onClick={() => applyDecision(item.applicant_email, 'rejected')}
                        disabled={!!actioningEmail}
                        className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {rejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
