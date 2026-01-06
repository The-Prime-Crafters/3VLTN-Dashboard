const IssueStats = () => {
  const stats = [
    {
      title: 'Open Issues',
      value: '23',
      change: '-15.3%',
      changeType: 'negative',
      icon: '⚠️'
    },
    {
      title: 'Resolved Today',
      value: '8',
      change: '+33.3%',
      changeType: 'positive',
      icon: '✅'
    },
    {
      title: 'Critical Issues',
      value: '3',
      change: '-25.0%',
      changeType: 'negative',
      icon: '🚨'
    },
    {
      title: 'Avg. Resolution Time',
      value: '2.4 days',
      change: '-12.5%',
      changeType: 'negative',
      icon: '⏱️'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-yellow-400/50 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium ${
                stat.changeType === 'positive'
                  ? 'text-green-400'
                  : stat.changeType === 'negative'
                  ? 'text-red-400'
                  : 'text-gray-400'
              }`}
            >
              {stat.change}
            </span>
            <span className="text-gray-500 text-sm ml-2">vs last week</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IssueStats;
