'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function FoundersClubChallengePanel() {
  const [email, setEmail] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState('');

  const [challengeReason, setChallengeReason] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [adminKey, setAdminKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminStatus, setAdminStatus] = useState(null);
  const [adminError, setAdminError] = useState('');
  const [decisionLoading, setDecisionLoading] = useState(false);

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
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit challenge.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const fetchAdminStatus = async () => {
    const normalizedEmail = adminEmail.trim();
    if (!adminKey.trim()) {
      setAdminError('Unauthorized');
      return;
    }
    if (!normalizedEmail) {
      setAdminError('email query param is required');
      return;
    }

    setAdminLoading(true);
    setAdminError('');
    setAdminStatus(null);

    try {
      const res = await fetch(`/api/founders-club/admin/challenge-status?email=${encodeURIComponent(normalizedEmail)}`, {
        headers: { 'x-admin-key': adminKey.trim() }
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to fetch challenge status.');
      }
      setAdminStatus(data.status || null);
    } catch (err) {
      setAdminError(err.message || 'Failed to fetch challenge status.');
    } finally {
      setAdminLoading(false);
    }
  };

  const applyDecision = async (decision) => {
    const normalizedEmail = adminEmail.trim();
    if (!adminKey.trim()) {
      setAdminError('Unauthorized');
      return;
    }
    if (!normalizedEmail) {
      setAdminError('email is required');
      return;
    }

    setDecisionLoading(true);
    setAdminError('');

    try {
      const res = await fetch('/api/founders-club/admin/challenge-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey.trim()
        },
        body: JSON.stringify({
          email: normalizedEmail,
          decision
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to apply challenge decision.');
      }
      await fetchAdminStatus();
    } catch (err) {
      setAdminError(err.message || 'Failed to apply challenge decision.');
    } finally {
      setDecisionLoading(false);
    }
  };

  return (
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
        <h3 className="text-lg font-semibold text-white">Admin Decision Flow</h3>

        <div>
          <label className="text-sm text-gray-300 block mb-1.5">Admin API Key (x-admin-key)</label>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter admin key"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-1.5">Applicant Email</label>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchAdminStatus}
            disabled={adminLoading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 inline-flex items-center gap-2"
          >
            {adminLoading && <Loader2 className="w-4 h-4 animate-spin" />} Get Latest Status
          </button>
          <button
            onClick={() => applyDecision('approved')}
            disabled={decisionLoading}
            className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 inline-flex items-center gap-2"
          >
            {decisionLoading && <Loader2 className="w-4 h-4 animate-spin" />} Approve
          </button>
          <button
            onClick={() => applyDecision('rejected')}
            disabled={decisionLoading}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 inline-flex items-center gap-2"
          >
            {decisionLoading && <Loader2 className="w-4 h-4 animate-spin" />} Reject
          </button>
        </div>

        {adminError && <p className="text-sm text-red-400">{adminError}</p>}

        {adminStatus && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-sm text-gray-300 space-y-2">
            <p><span className="text-gray-500">Email:</span> {adminStatus.email || 'N/A'}</p>
            <p><span className="text-gray-500">Application Status:</span> {adminStatus.application?.status || 'N/A'}</p>
            <p><span className="text-gray-500">Decision:</span> {adminStatus.challenge_decision?.decision || 'pending'}</p>
            <p><span className="text-gray-500">Created:</span> {adminStatus.challenge_decision?.created_at ? new Date(adminStatus.challenge_decision.created_at).toLocaleString() : 'N/A'}</p>
            <p><span className="text-gray-500">Expires:</span> {adminStatus.challenge_decision?.expires_at ? new Date(adminStatus.challenge_decision.expires_at).toLocaleString() : 'N/A'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
