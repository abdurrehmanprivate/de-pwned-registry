const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BreachRegistry", function () {
  let registry;
  let owner;
  let researcher;

  // Helper: compute SHA-256 of a string and return as bytes32
  // We replicate what the Python seeder does: hashlib.sha256(email.encode()).hexdigest()
  async function sha256AsBytes32(input) {
    const encoded = ethers.toUtf8Bytes(input);
    const hash = ethers.sha256(encoded);  // returns hex string "0x..."
    return hash; // ethers v6 sha256 returns a 0x-prefixed 32-byte hex string
  }

  beforeEach(async function () {
    [owner, researcher] = await ethers.getSigners();
    const BreachRegistry = await ethers.getContractFactory("BreachRegistry");
    registry = await BreachRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("Should start with zero breach records", async function () {
    expect(await registry.getTotalBreaches()).to.equal(0);
  });

  it("Should allow reporting a new breach hash", async function () {
    const emailHash = await sha256AsBytes32("victim@example.com");
    await registry.connect(researcher).reportBreach(emailHash, "TestBreach-2025");
    expect(await registry.getTotalBreaches()).to.equal(1);
  });

  it("Should return BREACHED for a reported hash", async function () {
    const emailHash = await sha256AsBytes32("victim@example.com");
    await registry.connect(researcher).reportBreach(emailHash, "TestBreach-2025");

    const [found, source] = await registry.checkHash(emailHash);
    expect(found).to.equal(true);
    expect(source).to.equal("TestBreach-2025");
  });

  it("Should return SECURE for an unreported hash", async function () {
    const emailHash = await sha256AsBytes32("safe@example.com");
    const [found] = await registry.checkHash(emailHash);
    expect(found).to.equal(false);
  });

  it("Should prevent duplicate reporting of the same hash", async function () {
    const emailHash = await sha256AsBytes32("duplicate@example.com");
    await registry.connect(researcher).reportBreach(emailHash, "Breach-A");
    await expect(
      registry.connect(researcher).reportBreach(emailHash, "Breach-B")
    ).to.be.revertedWith("Hash already reported");
  });

  it("Should reject reporting with an empty source name", async function () {
    const emailHash = await sha256AsBytes32("test@example.com");
    await expect(
      registry.connect(researcher).reportBreach(emailHash, "")
    ).to.be.revertedWith("Source name cannot be empty");
  });
});
