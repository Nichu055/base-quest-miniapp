const hre = require("hardhat");

async function main() {
  const CONTRACT_ADDRESS = "0xAA4c50b0023530432EEe23F8c6d29756b5a317dc";

  console.log("Adding comprehensive task pool to current week...");

  const BaseQuest = await hre.ethers.getContractFactory("BaseQuest");
  const contract = BaseQuest.attach(CONTRACT_ADDRESS);

  // Comprehensive task pool - users will see 3 random ones per day
  const tasks = [
    // DeFi & Trading Tasks
    {
      description: "Swap any token on Uniswap (Base)",
      taskType: "onchain",
      basePointsReward: 100
    },
    {
      description: "Provide liquidity to any pool on Aerodrome",
      taskType: "onchain",
      basePointsReward: 150
    },
    {
      description: "Swap on BaseSwap DEX",
      taskType: "onchain",
      basePointsReward: 100
    },
    {
      description: "Bridge assets from Ethereum to Base",
      taskType: "onchain",
      basePointsReward: 150
    },
    {
      description: "Trade on Velocore DEX",
      taskType: "onchain",
      basePointsReward: 100
    },
    
    // NFT & Social Tasks
    {
      description: "Mint an NFT on Base",
      taskType: "onchain",
      basePointsReward: 120
    },
    {
      description: "Share Base Quest on Farcaster",
      taskType: "offchain",
      basePointsReward: 50
    },
    {
      description: "Follow @base on Twitter/X",
      taskType: "offchain",
      basePointsReward: 30
    },
    {
      description: "Join Base Discord community",
      taskType: "offchain",
      basePointsReward: 40
    },
    {
      description: "List an NFT for sale on OpenSea (Base)",
      taskType: "onchain",
      basePointsReward: 80
    },
    
    // Prediction & Gaming Tasks
    {
      description: "Predict BTC price direction for tomorrow",
      taskType: "offchain",
      basePointsReward: 50
    },
    {
      description: "Predict ETH price movement (up/down)",
      taskType: "offchain",
      basePointsReward: 50
    },
    {
      description: "Play a Base game for 10 minutes",
      taskType: "offchain",
      basePointsReward: 60
    },
    {
      description: "Complete a quest on Layer3",
      taskType: "offchain",
      basePointsReward: 70
    },
    {
      description: "Participate in a prediction market",
      taskType: "onchain",
      basePointsReward: 90
    },
    
    // Staking & Yield Tasks
    {
      description: "Stake tokens on a Base protocol",
      taskType: "onchain",
      basePointsReward: 140
    },
    {
      description: "Deposit into a yield vault on Beefy",
      taskType: "onchain",
      basePointsReward: 130
    },
    {
      description: "Claim rewards from any Base protocol",
      taskType: "onchain",
      basePointsReward: 80
    },
    
    // Learning & Engagement Tasks
    {
      description: "Read Base documentation for 5 minutes",
      taskType: "offchain",
      basePointsReward: 40
    },
    {
      description: "Share your Base journey on social media",
      taskType: "offchain",
      basePointsReward: 60
    },
    {
      description: "Invite a friend to Base Quest",
      taskType: "offchain",
      basePointsReward: 80
    },
    {
      description: "Vote on a DAO proposal",
      taskType: "onchain",
      basePointsReward: 110
    },
    {
      description: "Explore 3 different Base dApps",
      taskType: "offchain",
      basePointsReward: 70
    },
    {
      description: "Write a Base review or thread",
      taskType: "offchain",
      basePointsReward: 90
    },
    
    // Advanced Tasks
    {
      description: "Deploy a smart contract on Base Sepolia",
      taskType: "onchain",
      basePointsReward: 200
    },
    {
      description: "Create an ENS profile on Base",
      taskType: "onchain",
      basePointsReward: 100
    },
    {
      description: "Participate in Base governance",
      taskType: "onchain",
      basePointsReward: 150
    },
    {
      description: "Contribute to a Base GitHub repository",
      taskType: "offchain",
      basePointsReward: 180
    },
    
    // Daily Engagement Tasks
    {
      description: "Check your Base wallet balance",
      taskType: "offchain",
      basePointsReward: 20
    },
    {
      description: "View Base network stats on Dune",
      taskType: "offchain",
      basePointsReward: 30
    },
    {
      description: "Check gas prices on Base",
      taskType: "offchain",
      basePointsReward: 20
    }
  ];

  console.log(`\nAdding ${tasks.length} tasks to the pool...`);
  console.log("Note: Users will see 3 random tasks each day that reset daily\n");

  let successCount = 0;
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      console.log(`Adding task ${i + 1}/${tasks.length}: ${task.description}`);
      
      const tx = await contract.addTask(
        task.description,
        task.taskType,
        task.basePointsReward
      );
      
      await tx.wait();
      successCount++;
      console.log(`✅ Added!`);
    } catch (error) {
      console.error(`❌ Failed:`, error.message);
    }
  }

  console.log(`\n✅ Successfully added ${successCount}/${tasks.length} tasks!`);
  
  // Verify tasks were added
  const currentWeek = await contract.currentWeek();
  const weekTasks = await contract.getCurrentWeekTasks();
  console.log(`\nCurrent week: ${currentWeek}`);
  console.log(`Total tasks available: ${weekTasks.length}`);
  console.log(`\nℹ️  Users can complete 3 tasks per day (daily reset at midnight UTC)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
