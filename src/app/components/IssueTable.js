const IssueTable = () => {
  const issues = [
    {
      id: 'ISS-001',
      title: 'Login timeout error on mobile devices',
      description: 'Users experiencing timeout issues when logging in on mobile devices',
      status: 'Open',
      priority: 'High',
      assignee: 'John Doe',
      reporter: 'Jane Smith',
      createdDate: '2024-01-28',
      updatedDate: '2024-01-29'
    },
    {
      id: 'ISS-002',
      title: 'Database connection timeout',
      description: 'Intermittent database connection timeouts causing data loss',
      status: 'In Progress',
      priority: 'Critical',
      assignee: 'Bob Johnson',
      reporter: 'Alice Brown',
      createdDate: '2024-01-27',
      updatedDate: '2024-01-29'
    },
    {
      id: 'ISS-003',
      title: 'Payment processing failure',
      description: 'Some payments are failing to process correctly',
      status: 'Resolved',
      priority: 'High',
      assignee: 'Charlie Wilson',
      reporter: 'David Lee',
      createdDate: '2024-01-25',
      updatedDate: '2024-01-28'
    },
    {
      id: 'ISS-004',
      title: 'UI layout broken on small screens',
      description: 'Dashboard layout breaks on screens smaller than 768px',
      status: 'Open',
      priority: 'Medium',
      assignee: 'Eva Garcia',
      reporter: 'Frank Miller',
      createdDate: '2024-01-26',
      updatedDate: '2024-01-29'
    },
    {
      id: 'ISS-005',
      title: 'Email notifications not sending',
      description: 'Users not receiving email notifications for important events',
      status: 'Closed',
      priority: 'Low',
      assignee: 'Grace Taylor',
      reporter: 'Henry Davis',
      createdDate: '2024-01-20',
      updatedDate: '2024-01-27'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'text-red-400 bg-red-400/20';
      case 'In Progress':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'Resolved':
        return 'text-green-400 bg-green-400/20';
      case 'Closed':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-500 bg-red-500/20';
      case 'High':
        return 'text-orange-400 bg-orange-400/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'Low':
        return 'text-green-400 bg-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold text-white">Issues List</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Issue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-white">{issue.id}</div>
                    <div className="text-sm text-gray-300 mt-1">{issue.title}</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">{issue.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {issue.assignee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {issue.createdDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-yellow-400 hover:text-yellow-300">
                      Edit
                    </button>
                    <button className="text-green-400 hover:text-green-300">
                      Resolve
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Showing 1-5 of 23 issues
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
            Previous
          </button>
          <button className="px-3 py-1 bg-yellow-400 text-black rounded hover:bg-yellow-300">
            1
          </button>
          <button className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
            2
          </button>
          <button className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
            3
          </button>
          <button className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueTable;
