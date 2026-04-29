/**
 * Smart Contract Interaction Utility
 * ====================================
 * Wraps Ethers.js calls to the BreachRegistry contract.
 * Uses ethers v6 API.
 */

import { ethers } from "ethers";
import contractInfo from "../contract_info.json";

const CONTRACT_ADDRESS = contractInfo.address;
const CONTRACT_ABI = contractInfo.abi;

/**
 * Get an Ethers.js provider connected to MetaMask.
 * Prompts MetaMask to connect if not already connected.
 */
async function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Get a read-only contract instance (no signing needed for queries).
 */
async function getReadContract() {
  const provider = await getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Get a write contract instance (signing needed for transactions).
 */
async function getWriteContract() {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/**
 * Check if a given bytes32 hash appears in the breach registry.
 *
 * @param {string} hashHex - 0x-prefixed bytes32 hash
 * @returns {Promise<{found: boolean, source: string, reportedAt: Date|null}>}
 */
export async function checkHash(hashHex) {
  const contract = await getReadContract();
  const [found, source, timestamp] = await contract.checkHash(hashHex);
  return {
    found,
    source,
    reportedAt: found ? new Date(Number(timestamp) * 1000) : null
  };
}

/**
 * Report a new breach hash to the registry.
 * Sends a blockchain transaction (requires MetaMask confirmation).
 *
 * @param {string} hashHex - 0x-prefixed bytes32 hash
 * @param {string} sourceName - Human-readable breach source name
 * @returns {Promise<{txHash: string}>}
 */
export async function reportBreach(hashHex, sourceName) {
  const contract = await getWriteContract();
  const tx = await contract.reportBreach(hashHex, sourceName);
  await tx.wait();
  return { txHash: tx.hash };
}

/**
 * Get the total number of breach records stored in the registry.
 * @returns {Promise<number>}
 */
export async function getTotalBreaches() {
  const contract = await getReadContract();
  const count = await contract.getTotalBreaches();
  return Number(count);
}

/**
 * Get the most recent breach hashes and their metadata.
 * Returns up to 20 entries from the live feed.
 *
 * @returns {Promise<Array<{hash: string, source: string, reportedAt: Date}>>}
 */
export async function getRecentBreaches() {
  const contract = await getReadContract();
  const [hashes, totalCount] = await contract.getRecentHashes(0);
  const count = Number(totalCount);

  if (count === 0) return [];

  const results = [];
  for (const hash of hashes) {
    // Empty bytes32 slots are all zeros — skip them
    if (hash === "0x0000000000000000000000000000000000000000000000000000000000000000") break;
    const [, source, timestamp] = await contract.checkHash(hash);
    results.push({
      hash: hash.slice(0, 10) + "..." + hash.slice(-6),  // Truncate for display
      source,
      reportedAt: new Date(Number(timestamp) * 1000)
    });
  }
  return results;
}
