// frontend/src/components/StatusPage.jsx
import React from 'react';
import { useEffect, useState } from 'react';

const StatusPage = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/debug/webhooks`);
        if (!response.ok) throw new Error('Failed to fetch webhooks');
        const data = await response.json();
        setWebhooks(data.webhooks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWebhooks();
    const interval = setInterval(fetchWebhooks, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading webhook history...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Recent Webhooks</h2>
      <div className="space-y-4">
        {webhooks.map((webhook, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="font-medium">Session: {webhook.session_id}</span>
              <span className="text-gray-500">{new Date(webhook.timestamp).toLocaleString()}</span>
            </div>
            <div className="mt-2">
              {webhook.segments.map((segment, i) => (
                <div key={i} className="text-sm text-gray-700 mt-1">
                  "{segment.text}"
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusPage;