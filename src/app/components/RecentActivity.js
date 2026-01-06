const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'user_signup',
      message: 'New user registered: john.doe@example.com',
      time: '2 minutes ago',
      icon: '👤',
      color: 'from-blue-500/20 to-blue-600/5'
    },
    {
      id: 2,
      type: 'plan_upgrade',
      message: 'User upgraded to Premium plan',
      time: '15 minutes ago',
      icon: '⬆️',
      color: 'from-purple-500/20 to-purple-600/5'
    },
    {
      id: 3,
      type: 'issue_reported',
      message: 'New issue reported: Login timeout error',
      time: '1 hour ago',
      icon: '⚠️',
      color: 'from-red-500/20 to-red-600/5'
    },
    {
      id: 4,
      type: 'payment_received',
      message: 'Payment received: $99.00',
      time: '2 hours ago',
      icon: '💳',
      color: 'from-green-500/20 to-green-600/5'
    },
    {
      id: 5,
      type: 'issue_resolved',
      message: 'Issue resolved: Database connection timeout',
      time: '3 hours ago',
      icon: '✅',
      color: 'from-emerald-500/20 to-emerald-600/5'
    },
    {
      id: 6,
      type: 'user_signup',
      message: 'New user registered: jane.smith@example.com',
      time: '4 hours ago',
      icon: '👤',
      color: 'from-blue-500/20 to-blue-600/5'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Recent Activity</h2>
          <p className="text-gray-500 text-sm">Latest updates from your system</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 hover:scale-105">
          View All
        </button>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className={`group flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r ${activity.color} border border-gray-800/30 hover:border-gray-700/50 transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-xl">{activity.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium leading-relaxed">{activity.message}</p>
              <div className="flex items-center mt-1 space-x-2">
                <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                <p className="text-gray-400 text-xs">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
