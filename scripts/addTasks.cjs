const hre = require("hardhat");

async function main() {
  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = "0xAA4c50b0023530432EEe23F8c6d29756b5a317dc";

  console.log("Adding tasks to current week...");

  const BaseQuest = await hre.ethers.getContractFactory("BaseQuest");
  const contract = BaseQuest.attach(CONTRACT_ADDRESS);

  // Add 3 sample tasks
  const tasks = [
    {
      description: "Swap any token on a Base DEX",
      taskType: "onchain",
      basePointsReward: 100
    },
    {
      description: "Bridge $1+ from Ethereum to Base",
      taskType: "onchain",
      basePointsReward: 150
    },
    {
      description: "Predict BTC direction for tomorrow",
      taskType: "offchain",
      basePointsReward: 50
    }
  ];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`\nAdding task ${i + 1}: ${task.description}`);
    
    const tx = await contract.addTask(
      task.description,
      task.taskType,
      task.basePointsReward
    );
    
    await tx.wait();
    console.log(`✅ Task ${i + 1} added! Tx: ${tx.hash}`);
  }

  console.log("\n✅ All tasks added successfully!");
  
  // Verify tasks were added
  const currentWeek = await contract.currentWeek();
  const weekTasks = await contract.getCurrentWeekTasks();
  console.log(`\nCurrent week: ${currentWeek}`);
  console.log(`Total tasks for week ${currentWeek}: ${weekTasks.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
