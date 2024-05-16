const { ethers } = require('ethers');
const tokenContractInfo = require('../artifacts/contracts/PHGX.sol/PHGX.json');
const stakingContractInfo =  require('../artifacts/contracts/StakingPHGX.sol/StakingPHGX.json');
const constants = require('../const');

async function addPlan(rewardRate, unlockPeriod, minimalAmount) {
  const provider = new ethers.providers.JsonRpcProvider(constants.NODE_URL);
  const signer = new ethers.Wallet(constants.CONTRACT_OWNER_PRIVATE_KEY, provider);

  // Staking Smart Contract
  const stakingContractAddress = constants.STAKING_CONTRACT_ADDRESS;
  const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractInfo.abi, signer);

  // Add plan
  const gasLimit = 200000; // default is 21000, must be higher than default to interact with smart contract!
  
  const stakeTx = await stakingContract.addPlan(rewardRate, unlockPeriod, minimalAmount, { gasLimit });
  const receipt = await stakeTx.wait();

  console.log('Added plan successfully - Transaction hash: ', receipt.transactionHash);
}

async function getPlan(planId) {
  const provider = new ethers.providers.JsonRpcProvider(constants.NODE_URL);
  const signer = new ethers.Wallet(constants.USER_PRIVATE_KEY, provider);

  // Staking Smart Contract
  const stakingContractAddress = constants.STAKING_CONTRACT_ADDRESS;
  const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractInfo.abi, signer);

  // Get plan by Id
  const plan = await stakingContract.plans(planId);

  console.log(`Plan[${planId}]: `, plan);
}

async function planCount() {
  const provider = new ethers.providers.JsonRpcProvider(constants.NODE_URL);
  const signer = new ethers.Wallet(constants.USER_PRIVATE_KEY, provider);

  // Staking Smart Contract
  const stakingContractAddress = constants.STAKING_CONTRACT_ADDRESS;
  const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractInfo.abi, signer);

  // Get plan by Id
  const planCount = await stakingContract.planCount();

  console.log(`Plan Count: ${planCount}`);
}

async function getStaker() {
  const provider = new ethers.providers.JsonRpcProvider(constants.NODE_URL);
  const signer = new ethers.Wallet(constants.USER_PRIVATE_KEY, provider);

  // Staking Smart Contract
  const stakingContractAddress = constants.STAKING_CONTRACT_ADDRESS;
  const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractInfo.abi, signer);

  // Get staker
  let stakerInfo = await stakingContract.getStaker();
  
  // stakerInfo = parseInt(stakerInfo.toString())

  console.log(`Stakder's Information - ${constants.USER_WALLET_ADDRESS} : `, parseInt(stakerInfo[0].toString()));
}

async function stakeTokens(amount, planId) {
  const provider = new ethers.providers.JsonRpcProvider(constants.NODE_URL);
  const signer = new ethers.Wallet(constants.USER_PRIVATE_KEY, provider);

  // ERC-20 Token
  const tokenAddress = constants.TOKEN_CONTRACT_ADDRESS;
  const tokenContract = new ethers.Contract(tokenAddress, tokenContractInfo.abi, signer);

  // Staking Smart Contract
  const stakingContractAddress = constants.STAKING_CONTRACT_ADDRESS;
  const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractInfo.abi, signer);

  // Set the allowance for the staking contract to spend your tokens
  const approvalTx = await tokenContract.approve(stakingContractAddress, ethers.utils.parseEther("100000"));
  await approvalTx.wait();

  // Stake your tokens
  const stakeTx = await stakingContract.stake(ethers.utils.parseEther(amount.toString()), planId);
  const receipt = await stakeTx.wait();

  console.log('Tokens staked successfully -  Transaction hash: ', receipt.transactionHash);
}

async function unstakeTokens() {
  const provider = new ethers.providers.JsonRpcProvider(constants.NODE_URL);
  const signer = new ethers.Wallet(constants.USER_PRIVATE_KEY, provider);

  // Staking Smart Contract
  const stakingContractAddress = constants.STAKING_CONTRACT_ADDRESS;
  const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractInfo.abi, signer);

  // Unstake your tokens
  const stakeTx = await stakingContract.unstake();
  const receipt = await stakeTx.wait();

  console.log('Tokens unstaked successfully -  Transaction hash: ', receipt.transactionHash);
}

// planCount()

// addPlan(20, 300, 100)
// addPlan(10, 0, 1000)

// getPlan(0)

// getStaker()

// getUnlockingTime(constants.USER_WALLET_ADDRESS)

// stakeTokens(10000, 0)

// unstakeTokens()
