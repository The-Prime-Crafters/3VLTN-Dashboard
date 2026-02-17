import { Search } from 'lucide-react';

export default function LeadsFilters({ filters, setFilters }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">

                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        name="search"
                        placeholder="Search keywords..."
                        value={filters.search}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>

                {/* Platform Filter */}
                <select
                    name="platform"
                    value={filters.platform}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="all">All Platforms</option>
                    <option value="reddit">Reddit</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter (X)</option>
                </select>

                {/* Intent Filter */}
                <select
                    name="intent"
                    value={filters.intent}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="all">All Intents</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="founder">Founder</option>
                </select>

                {/* Score Filter */}
                <select
                    name="score"
                    value={filters.score}
                    onChange={handleChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    <option value="all">All Scores</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
            </div>
        </div>
    );
}