const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BaseQuest contract to Base Mainnet...\n");

  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no ETH! Please fund your account first.");
  }

  // Constructor parameters
  // IMPORTANT: Update these addresses before deploying to mainnet!
  const treasuryAddress = deployer.address; // Using deployer as treasury for now
  const attesterAddress = deployer.address; // Using deployer as attester for now

  console.log("Constructor parameters:");
  console.log("  Treasury:", treasuryAddress);
  console.log("  Attester:", attesterAddress);
  console.log("");

  // Deploy the contract
  console.log("📝 Deploying contract...");
  const BaseQuest = await hre.ethers.getContractFactory("BaseQuest");
  const baseQuest = await BaseQuest.deploy(treasuryAddress, attesterAddress);

  await baseQuest.waitForDeployment();

  const contractAddress = await baseQuest.getAddress();
  
  console.log("\n✅ BaseQuest deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("");
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId.toString());
  console.log("");

  // Display next steps
  console.log("📋 Next Steps:");
  console.log("1. Update src/config.ts with the contract address:");
  console.log(`   [8453]: '${contractAddress}'`);
  console.log("");
  console.log("2. Verify the contract on BaseScan (optional):");
  console.log(`   npx hardhat verify --network base-mainnet ${contractAddress} "${treasuryAddress}" "${attesterAddress}"`);
  console.log("");
  console.log("3. View contract on BaseScan:");
  console.log(`   https://basescan.org/address/${contractAddress}`);
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: "base-mainnet",
    chainId: 8453,
    contractAddress: contractAddress,
    treasuryAddress: treasuryAddress,
    attesterAddress: attesterAddress,
    deployedBy: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: baseQuest.deploymentTransaction()?.hash
  };

  console.log("💾 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
