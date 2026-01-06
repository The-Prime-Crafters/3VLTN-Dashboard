import PlanCard from '../components/PlanCard';
import PlanStats from '../components/PlanStats';

export default function PlansPage() {
  const plans = [
    {
      id: 1,
      name: 'Freemium',
      price: '$0',
      period: 'month',
      description: 'Perfect for getting started',
      features: [
        'Basic features',
        'Community support',
        'Limited usage',
        'Standard templates'
      ],
      subsTier: 'freemium',
      color: 'border-gray-600',
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      id: 2,
      name: 'Basic',
      price: '$9',
      period: 'month',
      description: 'Great for small teams',
      features: [
        'All freemium features',
        'Priority support',
        'Advanced analytics',
        'API access',
        'Custom templates'
      ],
      subsTier: 'basic',
      color: 'border-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 3,
      name: 'Professional',
      price: '$29',
      period: 'month',
      description: 'For growing businesses',
      features: [
        'All basic features',
        '24/7 support',
        'Advanced integrations',
        'Team collaboration',
        'Custom workflows',
        'Advanced reporting'
      ],
      subsTier: 'professional',
      color: 'border-yellow-400',
      gradient: 'from-yellow-400 to-yellow-500',
      popular: true
    },
    {
      id: 4,
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      description: 'For large organizations',
      features: [
        'All professional features',
        'Dedicated support',
        'Custom features',
        'SSO integration',
        'Advanced security',
        'Custom SLA',
        'White-label options'
      ],
      subsTier: 'enterprise',
      color: 'border-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-purple-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-400/30">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Subscription <span className="gradient-text">Plans</span></h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg ml-15">Manage and monitor your subscription plans</p>
        </div>
      </div>

      {/* Plan Statistics */}
      <PlanStats />

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
