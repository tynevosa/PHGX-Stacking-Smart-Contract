const { ethers } = require("hardhat");

async function main() {
  const StakingPHGX = await ethers.getContractFactory("StakingPHGX");
  const stakingPHGX = await StakingPHGX.deploy("0x4Eb8a56c864e9cC771c61DEF0ddE189E39ad86B6");

  await stakingPHGX.deployed();

  console.log("StakingPHGX contract deployed to:", stakingPHGX.address);
  console.log("Transaction hash:", stakingPHGX.deployTransaction.hash);
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});