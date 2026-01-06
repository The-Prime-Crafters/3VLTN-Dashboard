'use client';

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-yellow-400/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}

