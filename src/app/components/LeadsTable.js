import { ExternalLink, MessageCircle, Facebook, Twitter, Disc } from 'lucide-react';

export default function LeadsTable({ leads, loading }) {
    if (loading) {
        return <div className="text-center py-10">Loading leads...</div>;
    }

    if (!leads || leads.length === 0) {
        return <div className="text-center py-10 text-gray-500">No leads found matching your criteria.</div>;
    }

    const getPlatformIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case 'facebook': return <Facebook className="w-5 h-5 text-blue-600" />;
            case 'twitter': return <Twitter className="w-5 h-5 text-sky-500" />;
            case 'reddit': return <Disc className="w-5 h-5 text-orange-600" />;
            default: return <MessageCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getScoreColor = (score) => {
        switch (score?.toLowerCase()) {
            case 'high': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Author</th>
                            <th className="px-6 py-4">Intent</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Context / Summary</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 capitalize">
                                        {getPlatformIcon(lead.platform)}
                                        {lead.platform}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {lead.author_name}
                                </td>
                                <td className="px-6 py-4 capitalize">
                                    {lead.intent}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(lead.score)}`}>
                                        {lead.score?.toUpperCase() || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate text-gray-500" title={lead.context}>
                                    {lead.context || lead.content}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a
                                        href={lead.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
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