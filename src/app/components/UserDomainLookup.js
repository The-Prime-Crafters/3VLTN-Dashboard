'use client';

import { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

export default function UserDomainLookup() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [domains, setDomains] = useState([]);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [error, setError] = useState('');

  const visibleDomains = useMemo(() => {
    if (!verifiedOnly) return domains;
    return domains.filter((domain) => domain?.is_verified === true);
  }, [domains, verifiedOnly]);

  const verifiedCount = useMemo(
    () => domains.filter((domain) => domain?.is_verified === true).length,
    [domains]
  );

  const searchUsers = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setUsers([]);
      setSelectedUser(null);
      setDomains([]);
      setError('');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        search: trimmed,
        status: 'all',
        subsTier: 'all'
      });

      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to search users.');
      }

      setUsers(data?.users || []);
      setSelectedUser(null);
      setDomains([]);
    } catch (err) {
      setError(err.message || 'Failed to search users.');
      setUsers([]);
    } finally {
      setSearching(false);
    }
  };

  const loadDomains = async (user) => {
    if (!user?.id) return;

    setSelectedUser(user);
    setLoadingDomains(true);
    setError('');

    try {
      const res = await fetch(`/api/domains?userId=${encodeURIComponent(user.id)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch domains.');
      }

      setDomains(Array.isArray(data?.domains) ? data.domains : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch domains.');
      setDomains([]);
    } finally {
      setLoadingDomains(false);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-5">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex-1">
          <label className="block text-sm text-gray-300 mb-2">Search user (name, email, username)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="e.g. john or john@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-700 text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              onClick={searchUsers}
              disabled={searching}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded border-gray-600 bg-gray-900"
          />
          Show verified only
        </label>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 p-4">
          <h3 className="text-sm font-semibold text-gray-200 mb-3">Matched Users</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {users.length === 0 && <p className="text-sm text-gray-500">No users yet. Run a search.</p>}
            {users.map((user) => {
              const label = user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : user.username || user.email;
              const active = selectedUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => loadDomains(user)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    active
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800/70'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-100">{label}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                  <div className="text-xs text-gray-500 mt-0.5">User ID: {user.id}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800/60 bg-gray-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-200">Domains</h3>
            {selectedUser && (
              <div className="text-xs text-gray-400">
                Verified: <span className="text-green-400 font-semibold">{verifiedCount}</span> / {domains.length}
              </div>
            )}
          </div>

          {!selectedUser && <p className="text-sm text-gray-500">Select a user to check domain verification.</p>}

          {loadingDomains && (
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading domains...
            </div>
          )}

          {!loadingDomains && selectedUser && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {visibleDomains.length === 0 && (
                <p className="text-sm text-gray-500">
                  {verifiedOnly ? 'No verified domains found.' : 'No domains found for this user.'}
                </p>
              )}
              {visibleDomains.map((domain) => (
                <div key={domain.id} className="p-3 rounded-lg border border-gray-800 bg-gray-900/50">
                  <div className="text-sm text-gray-100 font-medium">{domain.name}</div>
                  <div className="text-xs mt-1">
                    <span
                      className={`inline-flex px-2 py-1 rounded-md font-medium ${
                        domain.is_verified
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {domain.is_verified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
