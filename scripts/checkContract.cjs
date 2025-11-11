const hre = require("hardhat");

async function main() {
  const contractAddress = "0x749E23524d7033C8d39664f2f7efB5ab0E4DFEfE";
  
  console.log("🔍 Checking contract at:", contractAddress);
  console.log("Network:", hre.network.name);
  
  // Check if contract has code
  const code = await hre.ethers.provider.getCode(contractAddress);
  console.log("\n📝 Contract code:");
  console.log("Code exists:", code !== '0x');
  console.log("Code size:", code.length, "characters");
  
  if (code === '0x') {
    console.log("\n❌ ERROR: No contract code at this address!");
    console.log("The deployment may have failed or this is just a wallet address.");
    return;
  }
  
  console.log("\n✅ Contract exists!");
  
  // Try to call entryFee
  try {
    const BaseQuest = await hre.ethers.getContractFactory("BaseQuest");
    const contract = BaseQuest.attach(contractAddress);
    
    const entryFee = await contract.entryFee();
    console.log("\n💰 Entry Fee:", hre.ethers.formatEther(entryFee), "ETH");
    console.log("Entry Fee (wei):", entryFee.toString());
    
    const currentWeek = await contract.currentWeek();
    console.log("📅 Current Week:", currentWeek.toString());
    
    const owner = await contract.owner();
    console.log("👤 Owner:", owner);
    
    console.log("\n✅ Contract is working correctly!");
  } catch (err) {
    console.error("\n❌ Error calling contract:", err.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
