import IssueTable from '../components/IssueTable';
import IssueStats from '../components/IssueStats';
import IssueFilters from '../components/IssueFilters';

export default function IssuesPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-400/30">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Issues & <span className="gradient-text">Bugs</span></h1>
            </div>
          </div>
          <p className="text-gray-400 text-lg ml-15">Track and manage reported issues and bugs</p>
        </div>
      </div>

      {/* Issue Statistics */}
      <IssueStats />

      {/* Filters and Search */}
      <IssueFilters />

      {/* Issues Table */}
      <IssueTable />
    </div>
  );
}
