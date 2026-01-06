'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Navigation from './Navigation';
import { ChatProvider } from '@/context/ChatContext';
import LoadingState from './LoadingState';

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // List of public routes that should NOT show the sidebar
  const publicRoutes = [
    '/login',
    '/register',
    '/track',
    '/complaint',
  ];

  // Fetch current user for chat (only once)
  useEffect(() => {
    const isPublic = publicRoutes.some(route => pathname.startsWith(route));
    if (!isPublic && !user) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(err => console.error('Error fetching user:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Show navigation loading state
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If it's a public route, render without sidebar
  if (isPublicRoute) {
    return (
      <main className="min-h-screen w-full">
        {children}
      </main>
    );
  }

  // Otherwise, render with sidebar (dashboard layout) and chat
  return (
    <ChatProvider user={user}>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 p-8 lg:p-10 relative">
          <div className="max-w-[1600px] mx-auto">
            {isNavigating && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] bg-opacity-50 backdrop-blur-sm z-40 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Loading...</p>
                </div>
              </div>
            )}
            <Suspense fallback={<LoadingState />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </ChatProvider>
  );
}

