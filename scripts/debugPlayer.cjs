const hre = require("hardhat");

async function main() {
  console.log("🔍 Debug Player Status\n");

  // Get player address from command line or use first signer
  const [signer] = await hre.ethers.getSigners();
  const playerAddress = process.argv[2] || signer.address;
  
  console.log("Player Address:", playerAddress);
  console.log("");

  // Get deployed contract
  const contractAddress = "0xAA4c50b0023530432EEe23F8c6d29756b5a317dc"; // Update with your contract
  const contract = await hre.ethers.getContractAt("BaseQuest", contractAddress);

  try {
    // Get current week
    const currentWeek = await contract.currentWeek();
    console.log("📅 Current Week:", currentWeek.toString());
    console.log("");

    // Get player data
    const playerData = await contract.getPlayerData(playerAddress);
    console.log("👤 Player Data:");
    console.log("  Current Streak:", playerData.currentStreak.toString());
    console.log("  Total Base Points:", playerData.totalBasePoints.toString());
    console.log("  Weekly Base Points:", playerData.weeklyBasePoints.toString());
    console.log("  Active This Week:", playerData.activeThisWeek);
    console.log("  Tasks Completed Today:", playerData.tasksCompletedToday);
    console.log("  Joined Week:", playerData.joinedWeek?.toString() || "0");
    console.log("  Player Week:", playerData.playerWeek?.toString() || "0");
    console.log("");

    // Get player status (debug function)
    try {
      const status = await contract.getPlayerStatus(playerAddress);
      console.log("🔧 Debug Status:");
      console.log("  Has Joined Current Week:", status.hasJoinedCurrentWeek);
      console.log("  Is Active This Week:", status.isActiveThisWeek);
      console.log("  Player Current Week:", status.playerCurrentWeek.toString());
      console.log("  Contract Current Week:", status.contractCurrentWeek.toString());
      console.log("");
      
      // Analysis
      console.log("📊 Analysis:");
      if (status.hasJoinedCurrentWeek && status.isActiveThisWeek) {
        console.log("  ✅ Player has joined and is active for week", currentWeek.toString());
        console.log("  ➡️ Can complete tasks");
      } else if (status.hasJoinedCurrentWeek && !status.isActiveThisWeek) {
        console.log("  ⚠️ Player joined but activeThisWeek is false (BUG!)");
        console.log("  ➡️ This should not happen - data inconsistency");
      } else if (!status.hasJoinedCurrentWeek && status.isActiveThisWeek) {
        console.log("  ⚠️ Player not joined but activeThisWeek is true (BUG!)");
        console.log("  ➡️ This indicates a week transition issue");
        console.log("  ➡️ Player needs to join the new week");
      } else {
        console.log("  ❌ Player has NOT joined week", currentWeek.toString());
        console.log("  ➡️ Player must join to participate");
      }
    } catch (err) {
      console.log("⚠️ getPlayerStatus not available (old contract version)");
    }

    // Get week info
    try {
      const weekInfo = await contract.getPlayerWeekInfo(playerAddress);
      console.log("\n📆 Week Info:");
      console.log("  Player Week:", weekInfo.playerWeek.toString());
      
      if (weekInfo.timeUntilMonthReset > 0) {
        const days = Math.floor(Number(weekInfo.timeUntilMonthReset) / 86400);
        const hours = Math.floor((Number(weekInfo.timeUntilMonthReset) % 86400) / 3600);
        console.log("  Time Until Month Reset:", `${days}d ${hours}h`);
      } else {
        console.log("  Time Until Month Reset: Ready to reset");
      }
    } catch (err) {
      console.log("\n⚠️ getPlayerWeekInfo not available (old contract version)");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
