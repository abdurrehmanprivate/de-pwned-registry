/**
 * Client-Side SHA-256 Hashing Utility
 * =====================================
 * This is the core privacy mechanism of De-Pwned.
 *
 * The raw email NEVER leaves this browser tab.
 * We use the native Web Crypto API (available in all modern browsers)
 * to compute a SHA-256 hash entirely in JavaScript memory.
 * Only the 32-byte hash is sent to the blockchain query — not the email.
 *
 * This mirrors exactly what the Python seeder does:
 *   hashlib.sha256(email.strip().lower().encode("utf-8")).digest()
 */

/**
 * Compute SHA-256 of an email address and return as a hex string
 * prefixed with "0x" so Ethers.js can interpret it as bytes32.
 *
 * @param {string} email - The raw email address typed by the user
 * @returns {Promise<string>} - 0x-prefixed 32-byte hex string
 */
export async function hashEmail(email) {
  // Normalize: trim whitespace and convert to lowercase
  // This must match the seeder's normalization exactly
  const normalized = email.trim().toLowerCase();

  // Encode the string as UTF-8 bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  // Use the browser's native SHA-256 implementation
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert the ArrayBuffer result to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  // Prefix with "0x" for Ethers.js bytes32 compatibility
  return "0x" + hashHex;
}
