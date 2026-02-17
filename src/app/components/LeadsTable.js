import { ExternalLink, MessageCircle, Facebook, Twitter, Disc, AlertCircle } from 'lucide-react';

export default function LeadsTable({ leads, loading }) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p>Scanning for leads...</p>
            </div>
        );
    }

    if (!leads || leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
                <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-lg font-medium">No leads found</p>
                <p className="text-sm">Try adjusting your filters or run a new scraper.</p>
            </div>
        );
    }

    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'facebook': return <Facebook className="w-4 h-4 text-blue-400" />;
            case 'twitter': return <Twitter className="w-4 h-4 text-sky-400" />;
            case 'reddit': return <Disc className="w-4 h-4 text-orange-400" />;
            default: return <MessageCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getScoreStyles = (score) => {
        switch (score?.toLowerCase()) {
            case 'high': return 'bg-green-500/10 text-green-400 border border-green-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
            case 'low': return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
        }
    };

    const getIntentStyles = (intent) => {
        switch (intent?.toLowerCase()) {
            case 'buyer': return 'text-blue-400';
            case 'seller': return 'text-purple-400';
            case 'founder': return 'text-pink-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Source</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Author</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Intent</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Score</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Context</th>
                            <th className="px-6 py-4 text-right font-medium uppercase tracking-wider text-xs">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {leads.map((lead) => (
                            <tr 
                                key={lead.id} 
                                className="group hover:bg-gray-800/30 transition-colors duration-200"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-gray-800 border border-gray-700">
                                            {getPlatformIcon(lead.platform)}
                                        </div>
                                        <span className="text-gray-300 capitalize hidden sm:block">{lead.platform}</span>
                                    </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                    <span className="text-gray-200 font-medium">{lead.author_name}</span>
                                </td>
                                
                                <td className="px-6 py-4">
                                    <span className={`capitalize font-medium ${getIntentStyles(lead.intent)}`}>
                                        {lead.intent}
                                    </span>
                                </td>
                                
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getScoreStyles(lead.score)}`}>
                                        {lead.score?.toUpperCase() || 'N/A'}
                                    </span>
                                </td>
                                
                                <td className="px-6 py-4 max-w-xs">
                                    <p className="truncate text-gray-400 group-hover:text-gray-300 transition-colors" title={lead.context || lead.content}>
                                        {lead.context || lead.content}
                                    </p>
                                </td>
                                
                                <td className="px-6 py-4 text-right">
                                    <a
                                        href={lead.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-200 border border-gray-700 hover:border-blue-500"
                                        title="View Original Post"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}