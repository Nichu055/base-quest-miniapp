const hre = require("hardhat");

async function main() {
  const networkName = hre.network.name;
  const isMainnet = networkName === 'base-mainnet';
  
  console.log(`🚀 Deploying BaseQuest contract to ${isMainnet ? 'Base Mainnet' : 'Base Sepolia'}...`);
  console.log(`⚠️  Network: ${networkName}`);
  
  if (isMainnet) {
    console.log("\n⚠️  WARNING: You are deploying to MAINNET! ⚠️");
    console.log("This will use REAL ETH. Make sure you:");
    console.log("1. Have sufficient ETH in your wallet for deployment gas");
    console.log("2. Have tested thoroughly on Base Sepolia");
    console.log("3. Are ready for production deployment\n");
  }

  // Using deployer address for both treasury and attester (you can change later)
  const [deployer] = await hre.ethers.getSigners();
  const TREASURY_ADDRESS = deployer.address; // Where fees will be collected
  const ATTESTER_ADDRESS = deployer.address; // Who can verify offchain tasks

  console.log("Deploying with account:", deployer.address);
  console.log("Treasury Address:", TREASURY_ADDRESS);
  console.log("Attester Address:", ATTESTER_ADDRESS);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy contract
  const BaseQuest = await hre.ethers.getContractFactory("BaseQuest");
  console.log("Deploying contract...");
  
  const baseQuest = await BaseQuest.deploy(TREASURY_ADDRESS, ATTESTER_ADDRESS, {
    gasLimit: 5000000 // Explicit gas limit for mainnet
  });

  console.log("Waiting for deployment confirmation...");
  await baseQuest.waitForDeployment();
  const contractAddress = await baseQuest.getAddress();
  
  // Verify deployment by checking code
  const code = await hre.ethers.provider.getCode(contractAddress);
  if (code === '0x') {
    throw new Error('Contract deployment failed - no code at address');
  }
  
  console.log("✅ Contract deployed successfully!");
  console.log("✅ Code size:", code.length, "bytes");

  console.log("✅ BaseQuest deployed to:", contractAddress);
  console.log("");
  console.log("📝 Next steps:");
  
  if (isMainnet) {
    console.log(`1. Update src/config.ts CONTRACT_ADDRESSES[8453] = "${contractAddress}"`);
  } else {
    console.log(`1. Update src/config.ts CONTRACT_ADDRESSES[84532] = "${contractAddress}"`);
  }
  
  console.log("2. Add tasks using: npx hardhat run scripts/addManyTasks.cjs --network", networkName);
  console.log("3. Verify contract on Basescan");
  console.log("");
  console.log("Verification command:");
  console.log(`npx hardhat verify --network ${networkName} ${contractAddress} "${TREASURY_ADDRESS}" "${ATTESTER_ADDRESS}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
