import StatsCard from './components/StatsCard';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import DashboardStats from './components/DashboardStats';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Dashboard <span className="gradient-text">Overview</span>
              </h1>
              <p className="text-gray-400 text-lg">Welcome back! Here's what's happening with your app.</p>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Period</p>
                <p className="text-lg font-semibold text-white">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
