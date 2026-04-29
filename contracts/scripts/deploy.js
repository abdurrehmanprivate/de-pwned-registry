// This script deploys BreachRegistry to the local Hardhat network
// and saves the contract address + ABI to a JSON file that both
// the Python seeder and the React frontend will import.

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying BreachRegistry...");

  // Get the deployer's account (first account from Hardhat's test accounts)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from address:", deployer.address);

  // Deploy the contract
  const BreachRegistry = await ethers.getContractFactory("BreachRegistry");
  const registry = await BreachRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  console.log("BreachRegistry deployed to:", contractAddress);

  // Extract the ABI from the compiled artifact
  const artifact = require("../artifacts/contracts/BreachRegistry.sol/BreachRegistry.json");

  // Build the shared config object
  const contractInfo = {
    address: contractAddress,
    abi: artifact.abi,
    network: "hardhat-localhost",
    chainId: 31337,
    deployedAt: new Date().toISOString(),
    deployedBy: deployer.address
  };

  // Write to contracts directory
  const contractsOutputPath = path.join(__dirname, "../contract_info.json");
  fs.writeFileSync(contractsOutputPath, JSON.stringify(contractInfo, null, 2));
  console.log("Contract info saved to contracts/contract_info.json");

  // Copy to seeder directory
  const seederOutputPath = path.join(__dirname, "../../seeder/contract_info.json");
  fs.writeFileSync(seederOutputPath, JSON.stringify(contractInfo, null, 2));
  console.log("Contract info copied to seeder/contract_info.json");

  // Copy to frontend src directory
  const frontendOutputPath = path.join(__dirname, "../../frontend/src/contract_info.json");
  fs.writeFileSync(frontendOutputPath, JSON.stringify(contractInfo, null, 2));
  console.log("Contract info copied to frontend/src/contract_info.json");

  console.log("\nDeployment complete. You can now run the seeder and start the frontend.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
