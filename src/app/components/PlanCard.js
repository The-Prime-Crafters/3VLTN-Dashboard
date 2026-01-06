'use client';

import { useState, useEffect } from 'react';

const PlanCard = ({ plan }) => {
  const [planStats, setPlanStats] = useState(null);

  useEffect(() => {
    const fetchPlanStats = async () => {
      try {
        const response = await fetch('/api/plans/stats');
        const data = await response.json();
        
        // Find stats for this specific plan
        const planData = data.byTier?.find(tier => tier.subs_tier === plan.subsTier);
        setPlanStats(planData || { user_count: 0, monthly_price: 0 });
      } catch (error) {
        console.error('Error fetching plan stats:', error);
        setPlanStats({ user_count: 0, monthly_price: 0 });
      }
    };

    fetchPlanStats();
  }, [plan.subsTier]);

  const userCount = planStats?.user_count || 0;
  const monthlyPrice = planStats?.monthly_price || 0;
  const revenue = userCount * monthlyPrice;

  return (
    <div className={`relative group bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border-2 ${plan.color} rounded-2xl p-6 hover:border-opacity-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-yellow-400/50' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold rounded-full shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <div className="mb-3">
          <span className="text-5xl font-bold text-white">{plan.price}</span>
          <span className="text-gray-400 text-lg">/{plan.period}</span>
        </div>
        <p className="text-gray-400 text-sm">{plan.description}</p>
      </div>

      <div className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <span className="text-yellow-400 text-xs">✓</span>
            </div>
            <span className="text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700/50 pt-4 space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Subscribers:</span>
          <span className="text-white font-bold text-lg">{userCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Monthly Revenue:</span>
          <span className={`font-bold text-lg bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
            ${revenue.toLocaleString()}
          </span>
        </div>
      </div>

      <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 hover:scale-105">
        Manage Plan
      </button>
    </div>
  );
};

export default PlanCard;
