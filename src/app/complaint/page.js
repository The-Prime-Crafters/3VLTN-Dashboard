'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ComplaintPage() {
  const searchParams = useSearchParams();
  const ticketIdFromUrl = searchParams.get('ticket');
  
  const [formData, setFormData] = useState({
    ticketId: ticketIdFromUrl || '',
    email: '',
    subject: '',
    complaint: '',
    urgency: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ticketIdFromUrl) {
      setFormData(prev => ({ ...prev, ticketId: ticketIdFromUrl }));
    }
  }, [ticketIdFromUrl]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Call backend API to submit complaint
      const response = await fetch(`${process.env.NEXT_PUBLIC_TICKET_API_URL}/api/public/complaint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to submit complaint');
        return;
      }

      setSuccess(true);
      setFormData({
        ticketId: '',
        email: '',
        subject: '',
        complaint: '',
        urgency: 'medium'
      });
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-12 shadow-2xl text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Complaint Submitted Successfully!</h2>
            <p className="text-gray-400 text-lg mb-8">
              Your escalation complaint has been forwarded to our management team. 
              They will review your case and contact you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/track"
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
              >
                Track Your Ticket
              </Link>
              <Link
                href="/complaint"
                className="px-6 py-3 bg-gray-800/60 hover:bg-gray-700/60 text-white font-semibold rounded-xl transition-all"
              >
                Submit Another Complaint
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <span className="text-2xl font-bold text-black">3V</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">3VLTN Support</h1>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Escalation Complaint</h2>
          <p className="text-gray-400 text-lg">Let us know if you need urgent attention on your ticket</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <span className="text-2xl flex-shrink-0">ℹ️</span>
            <div>
              <h3 className="text-blue-400 font-bold mb-2">When to file a complaint:</h3>
              <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                <li>Your ticket has been open for more than 48 hours without response</li>
                <li>The issue is urgent and needs immediate attention</li>
                <li>You&apos;re not satisfied with the current resolution progress</li>
                <li>Your messages are not being acknowledged</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Complaint Form */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                🎫 Original Ticket ID *
              </label>
              <input
                type="text"
                name="ticketId"
                value={formData.ticketId}
                onChange={handleChange}
                required
                placeholder="e.g., TICK-20250116-ABC123"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all font-mono"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                📧 Your Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must match the email used for the original ticket
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                📝 Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Brief description of your concern"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                🔥 Urgency Level *
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
              >
                <option value="low">Low - Can wait a few days</option>
                <option value="medium">Medium - Need response soon</option>
                <option value="high">High - Need urgent attention</option>
                <option value="critical">Critical - Business impacting</option>
              </select>
            </div>

            {/* Complaint Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                💬 Complaint Details *
              </label>
              <textarea
                name="complaint"
                value={formData.complaint}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Please explain your concern in detail. Include:&#10;- Why you're filing this complaint&#10;- What response you've received (if any)&#10;- What resolution you're expecting&#10;- Any other relevant information"
                className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
            >
              {submitting ? 'Submitting...' : '📢 Submit Escalation Complaint'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/track"
              className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm"
            >
              ← Back to Track Ticket
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Complaint emails are sent directly to our management team. 
            You will receive a response within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

