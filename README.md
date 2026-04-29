# De-Pwned — Decentralized Breach Intelligence Registry

De-Pwned is a privacy-preserving, decentralized credential breach notification registry built on Ethereum. It acts as a Web3 alternative to services like "Have I Been Pwned", addressing the fundamental flaws of centralized single points of failure. 

By leveraging the immutability of the blockchain and client-side cryptographic hashing, De-Pwned ensures that users can check if their credentials have been compromised without ever transmitting their raw data to a server.

## Features

- **Privacy by Design:** User emails are hashed locally in the browser using the native Web Crypto API (SHA-256). Only the 32-byte hash is sent to the blockchain.
- **Decentralized Registry:** Breach data is stored on an immutable Solidity smart contract, removing reliance on a central authority.
- **Permissionless Reporting:** Security researchers can seamlessly submit batches of compromised hashes (e.g., from dark web leaks) to the registry via MetaMask.
- **Live Feed Transparency:** All reported breaches are publicly verifiable and displayed on a real-time decentralized feed.

## Technology Stack

- **Smart Contracts:** Solidity `^0.8.19`
- **Development Environment:** Hardhat
- **Frontend:** React 18 (Vite)
- **Web3 Integrations:** Ethers.js v6, Web3.py
- **Local Network:** Hardhat Node (localhost:8545)

---

## Project Structure

This monorepo is divided into three core components:

1. **`contracts/`**: The Hardhat project containing the `BreachRegistry` Solidity smart contract, deployment scripts, and automated test suites.
2. **`seeder/`**: A Python Threat Intelligence script that simulates an OSINT researcher parsing a dark web leak (e.g., RockYou2025) and submitting credential hashes to the blockchain.
3. **`frontend/`**: The React-based Decentralized Application (dApp) providing the user interface for checking emails, reporting breaches, and viewing the live feed.

---

## DevSecOps & Security Best Practices Implemented

- **No Raw Data Storage:** The smart contract only stores SHA-256 hashes. Pre-image resistance guarantees the original email cannot be recovered from the blockchain.
- **Client-Side Processing:** The `hash.js` utility ensures the raw email string is destroyed in memory immediately after hashing, never crossing the network layer.
- **Strict `.gitignore` Policies:** `.env` files, node modules, Hardhat caches, compilation artifacts, and Python cache files are strictly ignored to prevent accidental credential or artifact exposure.

---

## Getting Started

### Prerequisites

- Node.js `18+`
- Python `3.10+`
- MetaMask Browser Extension

### 1. Start the Local Blockchain

Open a terminal and navigate to the `contracts` directory to start a local Hardhat node. This will provide you with 20 funded test accounts.

```bash
cd contracts
npm install
npx hardhat node
```

### 2. Deploy the Smart Contract

Open a second terminal, navigate to the `contracts` directory, and deploy the `BreachRegistry` contract to your local network.

```bash
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Seed the Database (Simulating a Data Leak)

Navigate to the `seeder` directory. We will use the Python script to simulate a security researcher discovering 500 leaked credentials and uploading their hashes to the blockchain.

*(Note: Ensure you generate the `fake_emails.txt` file first if it's missing).*

```bash
cd seeder
pip install -r requirements.txt
python seed.py
```

### 4. Run the React Frontend

Open a third terminal, navigate to the `frontend` directory, and start the development server.

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

### 5. MetaMask Configuration

To interact with the dApp, configure MetaMask to connect to your local Hardhat node:
- **Network Name:** Hardhat Local
- **RPC URL:** `http://127.0.0.1:8545`
- **Chain ID:** `31337`
- **Currency:** ETH

Import Account #0 (Deployer) or Account #1 from the Hardhat node terminal output into your MetaMask using the provided private key. You will now have 10,000 test ETH to interact with the contract!

---

## Testing

Automated smart contract tests are written using Chai and Hardhat Network Helpers. To execute the test suite:

```bash
cd contracts
npx hardhat test
```
