const hre = require("hardhat");

async function main() {
  const contractAddress = "0x679f650E03d35D3be607f7f04dd8AA323A824DA8";
  
  console.log("🔍 Checking contract status...\n");
  
  const BaseQuest = await hre.ethers.getContractFactory("BaseQuest");
  const contract = BaseQuest.attach(contractAddress);
  
  // Check entry fee
  const entryFee = await contract.entryFee();
  console.log("Entry Fee (wei):", entryFee.toString());
  console.log("Entry Fee (ETH):", hre.ethers.formatEther(entryFee));
  
  // Check current week
  const currentWeek = await contract.currentWeek();
  console.log("\nCurrent Week:", currentWeek.toString());
  
  // Check prize pool
  const prizePool = await contract.weeklyPrizePool();
  console.log("Prize Pool (ETH):", hre.ethers.formatEther(prizePool));
  
  // Check tasks
  const tasks = await contract.getCurrentWeekTasks();
  console.log("\nTasks for week", currentWeek.toString() + ":", tasks.length);
  tasks.forEach((task, i) => {
    console.log(`  ${i}. ${task.description}`);
    console.log(`     Type: ${task.taskType} | Reward: ${task.basePointsReward} | Active: ${task.isActive}`);
  });
  
  // Check leaderboard
  const [addresses, streaks, points] = await contract.getLeaderboard();
  console.log("\nLeaderboard Players:", addresses.length);
  
  console.log("\n✅ Contract is functioning correctly!");
  console.log("\n📝 To join this week, users need to pay:", hre.ethers.formatEther(entryFee), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
