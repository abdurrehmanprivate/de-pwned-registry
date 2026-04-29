/**
 * ResultCard Component
 * =====================
 * Displays the breach check result clearly.
 * Green for safe, red for breached.
 */

export default function ResultCard({ result }) {
  const { found, source, reportedAt, email } = result;

  if (!found) {
    return (
      <div className="result-card secure">
        <div className="result-icon">✅</div>
        <div className="result-status">SECURE</div>
        <p className="result-email">{email}</p>
        <p className="result-detail">
          This email address has not appeared in any breach registered on this ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="result-card breached">
      <div className="result-icon">🚨</div>
      <div className="result-status">BREACHED</div>
      <p className="result-email">{email}</p>
      <div className="breach-details">
        <div className="detail-row">
          <span className="detail-label">Source</span>
          <span className="detail-value">{source}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Reported</span>
          <span className="detail-value">{reportedAt.toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit"
          })}</span>
        </div>
      </div>
      <p className="breach-advice">
        ⚠️ Change this password immediately on all services where it was used.
      </p>
    </div>
  );
}
