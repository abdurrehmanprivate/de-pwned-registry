/**
 * De-Pwned — Decentralized Breach Intelligence Registry
 * =======================================================
 * Main application component with tab-based navigation.
 *
 * Three views:
 *   1. Check      — Any user checks if their email was breached
 *   2. Report     — Security researchers report new breach hashes
 *   3. Feed       — Public live feed of all breach records on-chain
 */

import { useState } from "react";
import CheckForm from "./components/CheckForm";
import ReportForm from "./components/ReportForm";
import BreachFeed from "./components/BreachFeed";
import "./index.css";

const TABS = [
  { id: "check", label: "🔍 Check Email", component: CheckForm },
  { id: "report", label: "📋 Report Breach", component: ReportForm },
  { id: "feed", label: "📡 Live Feed", component: BreachFeed },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("check");

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">De-Pwned</span>
          </div>
          <p className="tagline">
            Decentralized Credential Breach Registry — Powered by Ethereum
          </p>
        </div>
      </header>

      {/* ── How It Works Banner ── */}
      <div className="how-it-works">
        <div className="how-inner">
          <span className="how-step">1. Breach data is collected by researchers</span>
          <span className="arrow">→</span>
          <span className="how-step">2. SHA-256 hashes stored on-chain</span>
          <span className="arrow">→</span>
          <span className="how-step">3. You check your hash privately</span>
          <span className="arrow">→</span>
          <span className="how-step">4. No server sees your email</span>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── Active Tab Content ── */}
      <main className="app-main">
        {ActiveComponent && <ActiveComponent />}
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <p>
          Built on Ethereum (Hardhat Localhost) • Solidity ^0.8.19 • Ethers.js v6
        </p>
        <p className="footer-note">
          All credential checks are performed locally in your browser.
          No email address is ever transmitted to any server.
        </p>
      </footer>
    </div>
  );
}
