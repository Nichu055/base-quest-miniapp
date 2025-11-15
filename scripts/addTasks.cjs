const hre = require("hardhat");

async function main() {
  const contractAddress = "0x679f650E03d35D3be607f7f04dd8AA323A824DA8"; // Your deployed contract
  
  console.log("🚀 Adding tasks to BaseQuest contract...\n");
  console.log("Contract address:", contractAddress);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get contract instance
  const BaseQuest = await hre.ethers.getContractFactory("BaseQuest");
  const contract = BaseQuest.attach(contractAddress);
  
  // Check current week
  const currentWeek = await contract.currentWeek();
  console.log("\nCurrent week:", currentWeek.toString());
  
  // Check existing tasks
  try {
    const existingTasks = await contract.getCurrentWeekTasks();
    console.log("Existing tasks:", existingTasks.length);
    
    if (existingTasks.length > 0) {
      console.log("\n✅ Tasks already exist for this week:");
      existingTasks.forEach((task, i) => {
        console.log(`  ${i}. ${task.description} (${task.basePointsReward} points)`);
      });
      console.log("\n⚠️  No need to add more tasks. Contract is ready!");
      return;
    }
  } catch (err) {
    console.log("No tasks found, will add new ones...");
  }
  
  // Add sample tasks
  const tasks = [
    {
      description: "Swap any token on Uniswap Base",
      taskType: "onchain",
      basePointsReward: 100
    },
    {
      description: "Bridge $5+ to Base network",
      taskType: "onchain",
      basePointsReward: 150
    },
    {
      description: "Share Base Quest on social media",
      taskType: "offchain",
      basePointsReward: 50
    }
  ];
  
  console.log("\n📝 Adding tasks...");
  
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`\nAdding task ${i + 1}/${tasks.length}:`);
    console.log(`  Description: ${task.description}`);
    console.log(`  Type: ${task.taskType}`);
    console.log(`  Reward: ${task.basePointsReward} points`);
    
    try {
      const tx = await contract.addTask(
        task.description,
        task.taskType,
        task.basePointsReward
      );
      
      console.log(`  Transaction hash: ${tx.hash}`);
      await tx.wait();
      console.log(`  ✅ Task added successfully!`);
    } catch (err) {
      console.error(`  ❌ Failed to add task:`, err.message);
    }
  }
  
  // Verify tasks were added
  const finalTasks = await contract.getCurrentWeekTasks();
  console.log(`\n✅ Total tasks for week ${currentWeek}: ${finalTasks.length}`);
  
  console.log("\n📋 All tasks:");
  finalTasks.forEach((task, i) => {
    console.log(`  ${i}. ${task.description}`);
    console.log(`     Type: ${task.taskType} | Reward: ${task.basePointsReward} points | Active: ${task.isActive}`);
  });
  
  console.log("\n✅ Tasks setup complete! Your contract is ready to use.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
