const StatsCard = ({ title, value, change, changeType, icon }) => {
  return (
    <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-yellow-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/10 hover:-translate-y-1">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-600/0 group-hover:from-yellow-400/5 group-hover:to-yellow-600/5 rounded-2xl transition-all duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700/50">
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
        
        <div className="flex items-center pt-4 border-t border-gray-800/50">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
            changeType === 'positive'
              ? 'bg-green-500/10 text-green-400'
              : changeType === 'negative'
              ? 'bg-red-500/10 text-red-400'
              : 'bg-gray-500/10 text-gray-400'
          }`}>
            <span className="text-xs font-semibold">
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'}
            </span>
            <span className="text-xs font-bold">{change}</span>
          </div>
          <span className="text-gray-500 text-xs ml-2 font-medium">vs last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
