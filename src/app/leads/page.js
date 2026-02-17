'use client';
import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import LeadsFilters from '../components/LeadsFilters';
import LeadsTable from '../components/LeadsTable';
import { Share2, RefreshCw } from 'lucide-react';

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
            // NOTE: Replace with actual backend URL if running separately (e.g. http://localhost:8000)
            // Or if integrated via proxy, use relative path.
            // Ensure you pass the User ID header as per the backend requirement.
            const res = await fetch('http://localhost:8000/api/social-leads', {
                headers: {
                    'X-User-Id': '1',
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
        // 1. Search Filter
        const matchesSearch = filters.search === '' ||
            lead.content.toLowerCase().includes(filters.search.toLowerCase()) ||
            lead.author_name.toLowerCase().includes(filters.search.toLowerCase());

        // 2. Platform Filter
        const matchesPlatform = filters.platform === 'all' || lead.platform === filters.platform;

        // 3. Intent Filter
        const matchesIntent = filters.intent === 'all' || lead.intent === filters.intent;

        // 4. Score Filter
        const matchesScore = filters.score === 'all' || lead.score === filters.score;

        return matchesSearch && matchesPlatform && matchesIntent && matchesScore;
    });

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Navigation />

            <main className="flex-1 p-8 ml-64">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Share2 className="w-8 h-8 text-blue-600" />
                                Social Leads
                            </h1>
                            <p className="text-gray-500 mt-1">Real-time leads from Reddit, Facebook, and X.</p>
                        </div>

                        {/* Scraper Triggers */}
                        <div className="flex gap-3">
                            <button onClick={() => runScraper('reddit')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-sm">
                                <RefreshCw className="w-4 h-4" /> Run Reddit
                            </button>
                            <button onClick={() => runScraper('facebook')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
                                <RefreshCw className="w-4 h-4" /> Run FB
                            </button>
                            <button onClick={() => runScraper('twitter')} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-sm">
                                <RefreshCw className="w-4 h-4" /> Run X
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <LeadsFilters filters={filters} setFilters={setFilters} />

                    {/* Table */}
                    <LeadsTable leads={filteredLeads} loading={loading} />

                </div>
            </main>
        </div>
    );
}