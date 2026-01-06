import AnalyticsChart from '../components/AnalyticsChart';
import AnalyticsStats from '../components/AnalyticsStats';
import TopUsers from '../components/TopUsers';
import UserDistributionChart from '../components/UserDistributionChart';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400/20 to-green-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-400/30">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Analytics <span className="gradient-text">Dashboard</span></h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg ml-15">Track your app's performance and user behavior</p>
        </div>
      </div>

      {/* Analytics Statistics */}
      <AnalyticsStats />

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnalyticsChart />
        <TopUsers />
      </div>

      {/* User Distribution */}
      <UserDistributionChart />
    </div>
  );
}
