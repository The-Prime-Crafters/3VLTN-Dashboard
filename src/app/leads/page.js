'use client';
import { Disc, Facebook, Share2, Twitter, Loader2, Settings2 } from 'lucide-react'; // Added Settings2
import { useEffect, useState } from 'react';
import LeadsFilters from '../components/LeadsFilters';
import LeadsTable from '../components/LeadsTable';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // --- NEW: Scraper Configuration State ---
    const [scrapeConfig, setScrapeConfig] = useState({
        limit: 10,
        fbUrl: ''
    });

    const [filters, setFilters] = useState({
        search: '',
        platform: 'all',
        intent: 'all',
        score: 'all'
    });

    const [scrapingPlatform, setScrapingPlatform] = useState(null);

    // 1. Fetch User
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setCurrentUser(data.user);
            })
            .catch(err => console.error('Error fetching user:', err));
    }, []);

    // 2. Fetch Leads
    const fetchLeads = async () => {
        if (!currentUser?.id) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/social-leads', {
                headers: {
                    'X-User-Id': currentUser.id,
                    'X-User-Role': currentUser.role || "user",
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) setLeads(data.data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) fetchLeads();
    }, [currentUser]);

    // --- UPDATED: Run Scraper with Payload ---
    const runScraper = async (platform) => {
        if (!currentUser?.id) return alert("User not authenticated");

        // Validate Limit
        if (scrapeConfig.limit < 1 || scrapeConfig.limit > 100) {
            return alert("Please enter a limit between 1 and 100");
        }

        if (!confirm(`Start scraping ${platform} (${scrapeConfig.limit} posts)? This may take a minute.`)) return;

        setScrapingPlatform(platform);

        try {
            const res = await fetch(`http://localhost:8000/api/social-leads/run/${platform}`, {
                method: 'POST',
                headers: {
                    'X-User-Id': currentUser.id,
                    'X-User-Role': currentUser.role || 'user',
                    'Content-Type': 'application/json' // Essential for sending JSON body
                },
                // Send config in body
                body: JSON.stringify({
                    limit: scrapeConfig.limit,
                    url: platform === 'facebook' ? scrapeConfig.fbUrl : null
                })
            });
            const data = await res.json();
            alert(data.message || "Scraping finished!");
            fetchLeads();
        } catch (e) {
            alert("Failed to start scraper");
        } finally {
            setScrapingPlatform(null);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = filters.search === '' ||
            lead.content.toLowerCase().includes(filters.search.toLowerCase()) ||
            lead.author_name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesPlatform = filters.platform === 'all' || lead.platform === filters.platform;
        const matchesIntent = filters.intent === 'all' || lead.intent === filters.intent;
        const matchesScore = filters.score === 'all' || lead.score === filters.score;
        return matchesSearch && matchesPlatform && matchesIntent && matchesScore;
    });

    if (!currentUser) return <div className="p-10 text-center text-gray-500">Loading user profile...</div>;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

                        {/* Title */}
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                                <Share2 className="w-10 h-10 text-blue-500" />
                                Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Leads</span>
                            </h1>
                            <p className="text-gray-400 text-lg">Real-time leads from Reddit, Facebook, and X.</p>
                        </div>

                        {/* Controls Container */}
                        <div className="flex flex-col gap-3 w-full lg:w-auto">

                            {/* Configuration Bar */}
                            <div className="flex flex-col sm:flex-row gap-2 bg-gray-800/50 p-2 rounded-xl border border-gray-700">
                                <div className="flex items-center gap-2 px-2">
                                    <Settings2 className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-400 font-medium">Config:</span>
                                </div>

                                {/* Limit Input */}
                                <input
                                    type="number"
                                    min="1" max="100"
                                    value={scrapeConfig.limit}
                                    onChange={(e) => setScrapeConfig({ ...scrapeConfig, limit: e.target.value })}
                                    className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 w-20 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500"
                                    placeholder="Limit"
                                    title="Number of posts to scan (1-100)"
                                />

                                {/* URL Input (Shows only for FB or Generic use) */}
                                <input
                                    type="text"
                                    value={scrapeConfig.fbUrl}
                                    onChange={(e) => setScrapeConfig({ ...scrapeConfig, fbUrl: e.target.value })}
                                    className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 w-full sm:w-64 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500"
                                    placeholder="FB Group URL (Optional)"
                                />
                            </div>

                            {/* Buttons Row */}
                            <div className="flex flex-wrap gap-3 justify-end">
                                <button
                                    onClick={() => runScraper('reddit')}
                                    disabled={scrapingPlatform !== null}
                                    className={`cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${scrapingPlatform === 'reddit' ? 'bg-orange-600/80 border-orange-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-orange-600 border border-gray-700 hover:border-orange-500'
                                        } text-white disabled:opacity-50`}
                                >
                                    {scrapingPlatform === 'reddit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Disc className="w-4 h-4 text-orange-500 group-hover:text-white" />}
                                    <span className="font-medium">Reddit</span>
                                </button>

                                <button
                                    onClick={() => runScraper('facebook')}
                                    disabled={scrapingPlatform !== null}
                                    className={`cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${scrapingPlatform === 'facebook' ? 'bg-blue-600/80 border-blue-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500'
                                        } text-white disabled:opacity-50`}
                                >
                                    {scrapingPlatform === 'facebook' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4 text-blue-500 group-hover:text-white" />}
                                    <span className="font-medium">Run FB</span>
                                </button>

                                <button
                                    onClick={() => runScraper('twitter')}
                                    disabled={scrapingPlatform !== null}
                                    className={`cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${scrapingPlatform === 'twitter' ? 'bg-gray-900 border-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-black border border-gray-700 hover:border-gray-500'
                                        } text-white disabled:opacity-50`}
                                >
                                    {scrapingPlatform === 'twitter' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Twitter className="w-4 h-4 text-sky-500 group-hover:text-white" />}
                                    <span className="font-medium">Run X</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                    <LeadsFilters filters={filters} setFilters={setFilters} />
                </div>
                <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
                    <LeadsTable leads={filteredLeads} loading={loading} />
                </div>
            </div>
        </div>
    );
}