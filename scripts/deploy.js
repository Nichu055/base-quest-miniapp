const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BaseQuest contract to Base...");

  // CHANGE THESE ADDRESSES BEFORE DEPLOYING TO MAINNET!
  const TREASURY_ADDRESS = "0x1234567890123456789012345678901234567890"; // CHANGE THIS
  const ATTESTER_ADDRESS = "0x0987654321098765432109876543210987654321"; // CHANGE THIS

  console.log("Treasury Address:", TREASURY_ADDRESS);
  console.log("Attester Address:", ATTESTER_ADDRESS);

  // Deploy contract
  const BaseQuest = await hre.ethers.getContractFactory("BaseQuest");
  const baseQuest = await BaseQuest.deploy(TREASURY_ADDRESS, ATTESTER_ADDRESS);

  await baseQuest.deployed();

  console.log("✅ BaseQuest deployed to:", baseQuest.address);
  console.log("");
  console.log("📝 Next steps:");
  console.log("1. Update src/config.ts with contract address:", baseQuest.address);
  console.log("2. Verify contract on Basescan");
  console.log("3. Test all functions on Sepolia before mainnet deployment");
  console.log("");
  console.log("Verification command:");
  console.log(`npx hardhat verify --network base-sepolia ${baseQuest.address} "${TREASURY_ADDRESS}" "${ATTESTER_ADDRESS}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
