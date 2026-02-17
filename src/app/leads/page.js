'use client';
import { useState, useEffect } from 'react';
import LeadsFilters from '../components/LeadsFilters';
import LeadsTable from '../components/LeadsTable';
import { Share2, RefreshCw, Facebook, Twitter, Disc } from 'lucide-react';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        platform: 'all',
        intent: 'all',
        score: 'all'
    });

    // Fetch Leads from your Backend
    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/social-leads', {
                headers: {
                    'X-User-Id': '1', // Ensure this matches your auth requirements
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            if (data.success) {
                setLeads(data.data);
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    // Run Scraper Button Handler
    const runScraper = async (platform) => {
        if (!confirm(`Start scraping ${platform}? This may take a minute.`)) return;

        try {
            const res = await fetch(`http://localhost:8000/api/social-leads/run/${platform}`, {
                method: 'POST',
                headers: {
                    'X-User-Id': '1'
                }
            });
            const data = await res.json();
            alert(data.message || "Scraping started!");
            fetchLeads(); // Refresh list after triggering
        } catch (e) {
            alert("Failed to start scraper");
        }
    };

    // Client-side filtering logic
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = filters.search === '' ||
            lead.content.toLowerCase().includes(filters.search.toLowerCase()) ||
            lead.author_name.toLowerCase().includes(filters.search.toLowerCase());

        const matchesPlatform = filters.platform === 'all' || lead.platform === filters.platform;
        const matchesIntent = filters.intent === 'all' || lead.intent === filters.intent;
        const matchesScore = filters.score === 'all' || lead.score === filters.score;

        return matchesSearch && matchesPlatform && matchesIntent && matchesScore;
    });

    return (
        <div className="space-y-8">
            {/* Header Section with Dashboard Theme */}
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>

                {/* Glassmorphism Container */}
                <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                        {/* Title & Subtitle */}
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                                <Share2 className="w-10 h-10 text-blue-500" />
                                Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Leads</span>
                            </h1>
                            <p className="text-gray-400 text-lg">Real-time leads from Reddit, Facebook, and X.</p>
                        </div>

                        {/* Scraper Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => runScraper('reddit')}
                                className="cursor-pointer group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-orange-600 border border-gray-700 hover:border-orange-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
                            >
                                <Disc className="w-4 h-4 text-orange-500 group-hover:text-white transition-colors" />
                                <span className="font-medium">Run Reddit</span>
                            </button>

                            <button
                                onClick={() => runScraper('facebook')}
                                className="cursor-pointer group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                            >
                                <Facebook className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
                                <span className="font-medium">Run FB</span>
                            </button>

                            <button
                                onClick={() => runScraper('twitter')}
                                className="cursor-pointer group relative inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-black border border-gray-700 hover:border-gray-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-gray-500/20"
                            >
                                <Twitter className="w-4 h-4 text-sky-500 group-hover:text-white transition-colors" />
                                <span className="font-medium">Run X</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-8">

                {/* Filters Section */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                    <LeadsFilters filters={filters} setFilters={setFilters} />
                </div>

                {/* Table Section */}
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-800/20 to-gray-700/20 rounded-3xl blur-xl"></div>
                    <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
                        <LeadsTable leads={filteredLeads} loading={loading} />
                    </div>
                </div>

            </div>
        </div>
    );
}