import { Search, Filter } from 'lucide-react';

export default function LeadsFilters({ filters, setFilters }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const selectBaseClass = "w-full md:w-auto px-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-gray-800/50";

    return (
        <div className="flex flex-col gap-4">

            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search keywords, authors..."
                            value={filters.search}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 text-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-600 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">

                    {/* Platform Filter */}
                    <div className="relative">
                        <select
                            name="platform"
                            value={filters.platform}
                            onChange={handleChange}
                            className={selectBaseClass}
                        >
                            <option value="all">All Platforms</option>
                            <option value="reddit">Reddit</option>
                            <option value="facebook">Facebook</option>
                            <option value="twitter">Twitter (X)</option>
                        </select>
                    </div>

                    {/* Intent Filter */}
                    <div className="relative">
                        <select
                            name="intent"
                            value={filters.intent}
                            onChange={handleChange}
                            className={selectBaseClass}
                        >
                            <option value="all">All Intents</option>
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="founder">Founder</option>
                        </select>
                    </div>

                    {/* Score Filter */}
                    <div className="relative">
                        <select
                            name="score"
                            value={filters.score}
                            onChange={handleChange}
                            className={selectBaseClass}
                        >
                            <option value="all">All Scores</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}