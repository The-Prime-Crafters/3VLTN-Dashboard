const QuickActions = () => {
  const actions = [
    {
      title: 'Add New User',
      description: 'Manually add a user to the system',
      icon: '➕',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      shadow: 'shadow-blue-500/30 hover:shadow-blue-500/50'
    },
    {
      title: 'Create Issue',
      description: 'Report a new issue or bug',
      icon: '🐛',
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'hover:from-red-600 hover:to-red-700',
      shadow: 'shadow-red-500/30 hover:shadow-red-500/50'
    },
    {
      title: 'View Reports',
      description: 'Generate and view analytics',
      icon: '📊',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      shadow: 'shadow-green-500/30 hover:shadow-green-500/50'
    },
    {
      title: 'System Settings',
      description: 'Configure app settings',
      icon: '⚙️',
      gradient: 'from-gray-600 to-gray-700',
      hoverGradient: 'hover:from-gray-700 hover:to-gray-800',
      shadow: 'shadow-gray-600/30 hover:shadow-gray-600/50'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 sticky top-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">Quick Actions</h2>
        <p className="text-gray-500 text-sm">Common tasks at your fingertips</p>
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            className={`group w-full bg-gradient-to-r ${action.gradient} ${action.hoverGradient} text-white p-4 rounded-xl text-left transition-all duration-200 shadow-lg ${action.shadow} hover:scale-105 hover:-translate-y-0.5`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200 group-hover:bg-white/20">
                <span className="text-xl">{action.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base">{action.title}</p>
                <p className="text-sm opacity-90 leading-tight">{action.description}</p>
              </div>
              <svg 
                className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
