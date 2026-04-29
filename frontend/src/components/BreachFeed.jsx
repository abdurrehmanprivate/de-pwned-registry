/**
 * BreachFeed Component
 * =====================
 * Displays a live feed of the most recently reported breach hashes.
 * Shows the truncated hash, source name, and timestamp.
 * Demonstrates blockchain transparency — all reports are publicly visible.
 */

import { useState, useEffect } from "react";
import { getRecentBreaches, getTotalBreaches } from "../utils/contract";

export default function BreachFeed() {
  const [breaches, setBreaches] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFeed() {
    setLoading(true);
    try {
      const [recentData, totalCount] = await Promise.all([
        getRecentBreaches(),
        getTotalBreaches()
      ]);
      setBreaches(recentData);
      setTotal(totalCount);
    } catch (err) {
      setError("Connect MetaMask to localhost:8545 to view the feed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h3>Live Breach Feed</h3>
        <span className="total-badge">{total.toLocaleString()} total records</span>
        <button onClick={loadFeed} className="refresh-btn">↻ Refresh</button>
      </div>

      {error && <p className="feed-error">{error}</p>}

      {loading ? (
        <p className="feed-loading">Loading from blockchain...</p>
      ) : breaches.length === 0 ? (
        <p className="feed-empty">No breach records found. Run the Python seeder first.</p>
      ) : (
        <div className="feed-table-wrapper">
          <table className="feed-table">
            <thead>
              <tr>
                <th>Hash (truncated)</th>
                <th>Source</th>
                <th>Reported</th>
              </tr>
            </thead>
            <tbody>
              {breaches.map((b, i) => (
                <tr key={i}>
                  <td className="hash-cell">{b.hash}</td>
                  <td className="source-cell">{b.source}</td>
                  <td className="time-cell">{b.reportedAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
