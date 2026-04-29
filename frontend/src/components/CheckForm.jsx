/**
 * CheckForm Component
 * ====================
 * The main user-facing form where someone checks if their email
 * was compromised. The privacy principle is front and center in the UI.
 */

import { useState } from "react";
import { hashEmail } from "../utils/hash";
import { checkHash } from "../utils/contract";
import ResultCard from "./ResultCard";

export default function CheckForm() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheck(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Step 1: Hash the email entirely in the browser
      const hash = await hashEmail(email);

      // Step 2: Query the blockchain with only the hash
      const checkResult = await checkHash(hash);

      setResult({ ...checkResult, email });
    } catch (err) {
      setError(err.message || "Something went wrong. Is MetaMask connected?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="privacy-badge">
        🔒 Your email is hashed locally and never sent to any server
      </div>

      <form onSubmit={handleCheck} className="check-form">
        <div className="input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="email-input"
            required
            autoComplete="off"
          />
          <button type="submit" disabled={loading} className="check-btn">
            {loading ? (
              <span className="spinner">Checking...</span>
            ) : (
              "Check Breach Status"
            )}
          </button>
        </div>
      </form>

      {error && <div className="error-message">⚠️ {error}</div>}

      {result && <ResultCard result={result} />}
    </div>
  );
}
