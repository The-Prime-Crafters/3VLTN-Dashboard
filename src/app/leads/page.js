'use client';
import { Disc, Facebook, Share2, Twitter, Loader2 } from 'lucide-react'; // Import Loader2
import { useEffect, useState } from 'react';
import LeadsFilters from '../components/LeadsFilters';
import LeadsTable from '../components/LeadsTable';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        platform: 'all',
        intent: 'all',
        score: 'all'
    });

    // New state to track which platform is currently scraping
    const [scrapingPlatform, setScrapingPlatform] = useState(null);

    // 1. Fetch User on Mount
    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    setCurrentUser(data.user);
                }
            })
            .catch(err => console.error('Error fetching user:', err));
    }, []);

    // 2. Fetch Leads
    const fetchLeads = async () => {
        if (!currentUser?.id) return;

        setLoading(true);
        console.log("Fetching leads for user:", currentUser.id, "Role:", currentUser.role);

        try {
            const res = await fetch('http://localhost:8000/api/social-leads', {
                headers: {
                    'X-User-Id': currentUser.id,
                    'X-User-Role': currentUser.role || "user",
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
        if (currentUser?.id) {
            fetchLeads();
        }
    }, [currentUser]);

    // Run Scraper Button Handler
    const runScraper = async (platform) => {
        if (!currentUser?.id) {
            alert("User not authenticated");
            return;
        }

        if (!confirm(`Start scraping ${platform}? This may take a minute.`)) return;

        // Set scraping state
        setScrapingPlatform(platform);

        try {
            const res = await fetch(`http://localhost:8000/api/social-leads/run/${platform}`, {
                method: 'POST',
                headers: {
                    'X-User-Id': currentUser.id,
                    'X-User-Role': currentUser.role || 'user'
                }
            });
            const data = await res.json();
            alert(data.message || "Scraping started!");
            fetchLeads();
        } catch (e) {
            alert("Failed to start scraper");
        } finally {
            // Reset scraping state regardless of success/failure
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

    if (!currentUser) {
        return <div className="p-10 text-center text-gray-500">Loading user profile...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                                <Share2 className="w-10 h-10 text-blue-500" />
                                Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Leads</span>
                            </h1>
                            <p className="text-gray-400 text-lg">Real-time leads from Reddit, Facebook, and X.</p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {/* REDDIT BUTTON */}
                            <button
                                onClick={() => runScraper('reddit')}
                                disabled={scrapingPlatform !== null} // Disable if ANY scrape is running
                                className={`cursor-pointer group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${scrapingPlatform === 'reddit'
                                        ? 'bg-orange-600/80 border-orange-500 cursor-not-allowed'
                                        : 'bg-gray-800 hover:bg-orange-600 border border-gray-700 hover:border-orange-500 hover:shadow-orange-500/20'
                                    } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {scrapingPlatform === 'reddit' ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                ) : (
                                    <Disc className="w-4 h-4 text-orange-500 group-hover:text-white transition-colors" />
                                )}
                                <span className="font-medium">
                                    {scrapingPlatform === 'reddit' ? 'Scraping...' : 'Run Reddit'}
                                </span>
                            </button>

                            {/* FACEBOOK BUTTON */}
                            <button
                                onClick={() => runScraper('facebook')}
                                disabled={scrapingPlatform !== null}
                                className={`cursor-pointer group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${scrapingPlatform === 'facebook'
                                        ? 'bg-blue-600/80 border-blue-500 cursor-not-allowed'
                                        : 'bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 hover:shadow-blue-500/20'
                                    } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {scrapingPlatform === 'facebook' ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                ) : (
                                    <Facebook className="w-4 h-4 text-blue-500 group-hover:text-white transition-colors" />
                                )}
                                <span className="font-medium">
                                    {scrapingPlatform === 'facebook' ? 'Scraping...' : 'Run FB'}
                                </span>
                            </button>

                            {/* TWITTER BUTTON */}
                            <button
                                onClick={() => runScraper('twitter')}
                                disabled={scrapingPlatform !== null}
                                className={`cursor-pointer group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${scrapingPlatform === 'twitter'
                                        ? 'bg-gray-900 border-gray-500 cursor-not-allowed'
                                        : 'bg-gray-800 hover:bg-black border border-gray-700 hover:border-gray-500 hover:shadow-gray-500/20'
                                    } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {scrapingPlatform === 'twitter' ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                                ) : (
                                    <Twitter className="w-4 h-4 text-sky-500 group-hover:text-white transition-colors" />
                                )}
                                <span className="font-medium">
                                    {scrapingPlatform === 'twitter' ? 'Scraping...' : 'Run X'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                    <LeadsFilters filters={filters} setFilters={setFilters} />
                </div>
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