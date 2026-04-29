/**
 * ReportForm Component
 * =====================
 * Allows security researchers to report new breach hashes.
 * In the demo, this represents a researcher who found leaked credentials
 * and is submitting their hashes to the decentralized registry.
 */

import { useState } from "react";
import { hashEmail } from "../utils/hash";
import { reportBreach } from "../utils/contract";

export default function ReportForm() {
  const [emails, setEmails] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!emails.trim() || !source.trim()) return;

    setLoading(true);
    setStatus(null);

    const emailList = emails.split("\n").map(e => e.trim()).filter(e => e);

    try {
      let submitted = 0;
      for (const email of emailList) {
        const hash = await hashEmail(email);
        await reportBreach(hash, source);
        submitted++;
        setStatus({ type: "progress", message: `Submitting... ${submitted}/${emailList.length}` });
      }
      setStatus({
        type: "success",
        message: `Successfully reported ${submitted} breach record(s) to the blockchain.`
      });
      setEmails("");
      setSource("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="researcher-badge">
        🔍 Researcher Portal — Report Compromised Credentials
      </div>
      <p className="reporter-info">
        Paste email addresses from a discovered breach (one per line).
        They will be hashed and submitted to the on-chain registry.
        Raw emails never leave this browser.
      </p>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="field-group">
          <label>Breach Source Name</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g. LinkedIn-2025, RockYou2024-Dump"
            className="source-input"
            required
          />
        </div>

        <div className="field-group">
          <label>Compromised Emails (one per line)</label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder={"victim1@gmail.com\nvictim2@yahoo.com\n..."}
            className="emails-textarea"
            rows={8}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="report-btn">
          {loading ? "Submitting to Blockchain..." : "Report Breach Hashes"}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.type === "success" ? "✅" : status.type === "error" ? "❌" : "⏳"} {status.message}
        </div>
      )}
    </div>
  );
}
