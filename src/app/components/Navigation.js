'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  
  // Try to get chat context (may be null if not in ChatProvider)
  let chatContext = null;
  try {
    chatContext = useChat();
  } catch {
    // Not in ChatProvider context, that's okay
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch current user
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => console.error('Error fetching user:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Define all menu items with role permissions
  const allNavItems = [
    { name: 'Overview', href: '/', icon: '📊', roles: ['admin'] }, // Only admin
    { name: 'Users', href: '/users', icon: '👥', roles: ['admin', 'developer'] },
    { name: 'Plans', href: '/plans', icon: '💎', roles: ['admin'] },
    { name: 'Tickets', href: '/tickets', icon: '🎫', roles: ['admin', 'developer', 'support'] },
    { name: 'Chat', href: '/chat', icon: '💬', roles: ['admin', 'developer', 'support'] },
    { name: 'Analytics', href: '/analytics', icon: '📈', roles: ['admin'] },
    { name: 'Admin Panel', href: '/admin-panel', icon: '👑', roles: ['admin'] },
  ];

  // Filter nav items based on user role
  const navItems = user 
    ? allNavItems.filter(item => item.roles.includes(user.role))
    : allNavItems;

  return (
    <nav className="w-72 min-w-72 max-w-72 glass-effect border-r border-gray-800/50 p-6 sticky top-0 h-screen overflow-y-auto flex-shrink-0">
      {/* Logo Section */}
      <div className="mb-10 pb-6 border-b border-gray-800/50">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/20">
            <span className="text-xl font-bold text-black">3V</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">3VLTN</h1>
            <p className="text-gray-500 text-xs font-medium">Admin Dashboard</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <div className="space-y-1 mb-8">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const unreadCount = item.href === '/chat' && chatContext?.unreadCount ? chatContext.unreadCount : 0;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (!isActive) {
                      setNavigating(true);
                      // Reset navigating state after a short delay
                      setTimeout(() => setNavigating(false), 500);
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold shadow-lg shadow-yellow-400/30'
                      : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                  )}
                  <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="relative flex items-center gap-2">
                    {item.name}
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* User Info & Status Section */}
      <div className="mt-auto space-y-4">
        {/* User Profile */}
        {!loading && user && (
          <div className="border-t border-gray-800/50 pt-4">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user.fullName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                  user.role === 'developer' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {user.role.toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-colors text-sm"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-xs font-semibold text-gray-300">System Online</span>
          </div>
          <p className="text-xs text-gray-500">Last updated:</p>
          <p className="text-xs text-gray-400 font-mono">{currentTime}</p>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
