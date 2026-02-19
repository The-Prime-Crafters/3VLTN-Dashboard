'use client';
import { Disc, Facebook, Share2, Twitter, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import LeadsFilters from '../components/LeadsFilters';
import LeadsTable from '../components/LeadsTable';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);

    // Scraper Config State
    const [config, setConfig] = useState({
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
            const res = await fetch('https://api.3vltn.com/api/social-leads', {
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

    // --- Modal Handlers ---
    const openScrapeModal = (platform) => {
        if (!currentUser?.id) return alert("User not authenticated");
        setSelectedPlatform(platform);
        setModalOpen(true);
        // Reset config for fresh open
        setConfig({ limit: 10, fbUrl: '' });
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedPlatform(null);
    };

    // --- API Trigger ---
    const handleStartScrape = async () => {
        // Validation
        if (config.limit < 1 || config.limit > 100) {
            return alert("Please enter a limit between 1 and 100");
        }

        if (selectedPlatform === 'facebook' && !config.fbUrl) {
            // Optional: You can make it mandatory or keep it optional (random default)
            // if (!confirm("No URL provided. A random default group will be used. Continue?")) return;
        }

        const platformToRun = selectedPlatform;
        closeModal(); // Close UI immediately
        setScrapingPlatform(platformToRun); // Show loader on button

        try {
            const res = await fetch(`https://api.3vltn.com/api/social-leads/run/${platformToRun}`, {
                method: 'POST',
                headers: {
                    'X-User-Id': currentUser.id,
                    'X-User-Role': currentUser.role || 'user',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    limit: config.limit,
                    url: platformToRun === 'facebook' ? config.fbUrl : null
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

    // Filtering Logic
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
        <div className="space-y-8 relative">

            {/* Header Section */}
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">

                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                                <Share2 className="w-10 h-10 text-blue-500" />
                                Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Leads</span>
                            </h1>
                            <p className="text-gray-400 text-lg">Real-time leads from Reddit, Facebook, and X.</p>
                        </div>

                        {/* Platform Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => openScrapeModal('reddit')}
                                disabled={scrapingPlatform !== null}
                                className={`cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${scrapingPlatform === 'reddit' ? 'bg-orange-600/80 border-orange-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-orange-600 border border-gray-700 hover:border-orange-500'
                                    } text-white disabled:opacity-50`}
                            >
                                {scrapingPlatform === 'reddit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Disc className="w-4 h-4 text-orange-500 group-hover:text-white" />}
                                <span className="font-medium">Run Reddit</span>
                            </button>

                            <button
                                onClick={() => openScrapeModal('facebook')}
                                disabled={scrapingPlatform !== null}
                                className={`cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg ${scrapingPlatform === 'facebook' ? 'bg-blue-600/80 border-blue-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500'
                                    } text-white disabled:opacity-50`}
                            >
                                {scrapingPlatform === 'facebook' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4 text-blue-500 group-hover:text-white" />}
                                <span className="font-medium">Run FB</span>
                            </button>

                            <button
                                onClick={() => openScrapeModal('twitter')}
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

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                    <LeadsFilters filters={filters} setFilters={setFilters} />
                </div>
                <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
                    <LeadsTable leads={filteredLeads} loading={loading} />
                </div>
            </div>

            {/* --- CONFIGURATION MODAL --- */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 capitalize">
                                {selectedPlatform === 'facebook' && <Facebook className="w-5 h-5 text-blue-500" />}
                                {selectedPlatform === 'reddit' && <Disc className="w-5 h-5 text-orange-500" />}
                                {selectedPlatform === 'twitter' && <Twitter className="w-5 h-5 text-sky-500" />}
                                Configure {selectedPlatform} Scraper
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">

                            {/* Input: Limit (All Platforms) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Number of Posts to Scan (1-100)</label>
                                <input
                                    type="number"
                                    min="1" max="100"
                                    value={config.limit}
                                    onChange={(e) => setConfig({ ...config, limit: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            {/* Input: URL (Facebook Only) */}
                            {selectedPlatform === 'facebook' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Facebook Group URL (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="https://facebook.com/groups/..."
                                        value={config.fbUrl}
                                        onChange={(e) => setConfig({ ...config, fbUrl: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <p className="text-xs text-gray-500">Leave empty to use a random default group.</p>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartScrape}
                                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Start Scraping
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}