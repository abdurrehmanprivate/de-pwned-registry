"""
De-Pwned Seeder Script
======================
Simulates a "dark web breach dump" scenario.

This script reads fake_emails.txt (500 simulated leaked emails),
hashes each one with SHA-256, and submits the hashes to the
BreachRegistry smart contract running on the local Hardhat node.

This is the OSINT/Threat Intelligence component of the project —
it models how a security researcher would ingest a leaked credential
file and report its hashes to a decentralized registry without
ever storing the raw emails on-chain.

Usage:
    1. Start the Hardhat node:   npx hardhat node  (in the contracts/ directory)
    2. Deploy the contract:      npx hardhat run scripts/deploy.js --network localhost
    3. Run this seeder:          python seed.py
"""

import hashlib
import json
import time
import sys
from web3 import Web3

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

# Connect to local Hardhat node
RPC_URL = "http://127.0.0.1:8545"

# Hardhat gives us 20 funded test accounts. We use account index 1
# (index 0 is reserved as deployer). These private keys are PUBLIC
# test keys — never use them on mainnet.
SEEDER_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"  # Hardhat account #1

# Breach source name for all seeded records
SOURCE_NAME = "RockYou2025-Simulation"

# Load contract info (address + ABI) written by the deploy script
CONTRACT_INFO_PATH = "contract_info.json"

# How many hashes to submit per batch (to avoid overloading the local node)
BATCH_SIZE = 50

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def hash_email(email: str) -> bytes:
    """
    Compute SHA-256 of an email string and return as a 32-byte value.
    This matches exactly what the browser does:
        crypto.subtle.digest('SHA-256', new TextEncoder().encode(email))
    """
    return hashlib.sha256(email.strip().lower().encode("utf-8")).digest()

def load_contract_info() -> dict:
    """Load the ABI and address from the JSON written by deploy.js"""
    try:
        with open(CONTRACT_INFO_PATH, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("ERROR: contract_info.json not found.")
        print("Please run: npx hardhat run scripts/deploy.js --network localhost")
        print("in the contracts/ directory first.")
        sys.exit(1)

def load_emails() -> list:
    """Read the fake_emails.txt file and return a list of email strings."""
    try:
        with open("fake_emails.txt", "r") as f:
            emails = [line.strip() for line in f if line.strip()]
        print(f"Loaded {len(emails)} emails from fake_emails.txt")
        return emails
    except FileNotFoundError:
        print("ERROR: fake_emails.txt not found.")
        sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────────
# MAIN SEEDER LOGIC
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  De-Pwned Seeder — Simulating Dark Web Credential Leak")
    print("=" * 60)

    # 1. Connect to the Hardhat node
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print(f"ERROR: Cannot connect to Hardhat node at {RPC_URL}")
        print("Start it with: npx hardhat node")
        sys.exit(1)
    print(f"Connected to local node | Chain ID: {w3.eth.chain_id}")

    # 2. Set up the seeder account
    account = w3.eth.account.from_key(SEEDER_PRIVATE_KEY)
    print(f"Seeder address: {account.address}")
    balance = w3.from_wei(w3.eth.get_balance(account.address), "ether")
    print(f"Seeder balance: {balance} ETH")

    # 3. Load the deployed contract
    info = load_contract_info()
    contract = w3.eth.contract(address=info["address"], abi=info["abi"])
    print(f"Contract address: {info['address']}")

    # Check how many breaches are already stored (avoid re-seeding)
    existing_count = contract.functions.getTotalBreaches().call()
    print(f"Existing breach records: {existing_count}")

    # 4. Load emails and hash them
    emails = load_emails()
    print(f"\nHashing {len(emails)} emails...")
    hashed_entries = []
    for email in emails:
        email_hash = hash_email(email)
        hashed_entries.append(email_hash)

    # 5. Submit hashes in batches
    print(f"\nSubmitting hashes in batches of {BATCH_SIZE}...")
    submitted = 0
    skipped = 0
    nonce = w3.eth.get_transaction_count(account.address)

    for i, email_hash in enumerate(hashed_entries):
        # Build transaction
        try:
            # Check if already reported (avoid reverts)
            (found, _, _) = contract.functions.checkHash(email_hash).call()
            if found:
                skipped += 1
                continue

            txn = contract.functions.reportBreach(
                email_hash,
                SOURCE_NAME
            ).build_transaction({
                "from": account.address,
                "nonce": nonce,
                "gas": 500000,
                "gasPrice": w3.to_wei("1", "gwei"),
                "chainId": 31337,
            })

            signed_txn = w3.eth.account.sign_transaction(txn, SEEDER_PRIVATE_KEY)
            tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            w3.eth.wait_for_transaction_receipt(tx_hash)

            nonce += 1
            submitted += 1

            # Progress indicator
            if submitted % BATCH_SIZE == 0:
                print(f"  Submitted {submitted}/{len(hashed_entries) - skipped} hashes...")
                time.sleep(0.1)  # Small pause between batches

        except Exception as e:
            print(f"  Warning: Failed to submit hash {i}: {e}")
            continue

    # 6. Verify final state
    final_count = contract.functions.getTotalBreaches().call()
    print(f"\n{'='*60}")
    print(f"Seeding complete!")
    print(f"  Submitted: {submitted} new breach records")
    print(f"  Skipped:   {skipped} (already existed)")
    print(f"  Total in registry: {final_count}")
    print(f"{'='*60}")
    print("\nThe frontend demo is ready. Try checking these emails:")
    for email in emails[:5]:
        print(f"  {email}  → Should show BREACHED")
    print(f"  notinlist@example.com   → Should show SECURE")

if __name__ == "__main__":
    main()
