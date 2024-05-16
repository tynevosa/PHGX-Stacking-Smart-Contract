// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakingPHGX is ERC20 {
    address public token;
    address public owner;

    struct Plan {
        uint256 rewardRate; // Reward rate in percentage (e.g., 5 for 5%)
        uint256 unlockPeriod; // Unlock period in seconds for non-flexible plans, 0 for flexible plan
        uint256 minimalAmount; // minimal amount of stake of the plan
    }
    mapping(uint256 => Plan) public plans;
    uint256 public planCount;

    struct Staker {
        uint256 amount;
        uint256 planId;
        uint256 stakingTimestamp;
    }
    mapping(address => Staker[]) public stakers;

    // Staking contract state
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakingTimestamp;

    // Events
    event Staked(address indexed staker, uint256 amount, uint256 planId);
    event Unstaked(address indexed staker, uint256 amount);
    event PlanAdded(uint256 indexed planId, uint256 rewardRate, uint256 unlockPeriod, uint256 minimalAmount);
    event PlanRemoved(uint256 indexed planId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(address stakableToken) ERC20("StakingPHGX", "PHGX") {
        token = stakableToken;
        owner = msg.sender;
    }

    function addPlan(uint256 rewardRate, uint256 unlockPeriod, uint256 minimalAmount) external onlyOwner {
        plans[planCount] = Plan(rewardRate, unlockPeriod, minimalAmount);
        emit PlanAdded(planCount, rewardRate, unlockPeriod, minimalAmount);
        planCount++;
    }

    function removePlan(uint256 planId) external onlyOwner {
        require(planId < planCount, "Invalid plan ID");

        delete plans[planId];
        emit PlanRemoved(planId);
    }
    
    function stake(uint256 amount, uint256 planId) external payable{
        require(planId < planCount, "Invalid plan ID");
        require(amount >= plans[planId].minimalAmount, "Amount must be greater than minimal amount of stake of the plan");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        stakers[msg.sender].push(Staker(amount, planId, block.timestamp));

        emit Staked(msg.sender, amount, planId);
    }

    function unstake(uint256 index) external payable {
        require(index < stakers[msg.sender].length, "No stake to withdraw");

        uint256 stakedAmount = stakers[msg.sender][index].amount;
        uint256 planId = stakers[msg.sender][index].planId;

        require(block.timestamp >= stakers[msg.sender][index].stakingTimestamp + plans[planId].unlockPeriod, "Stake is still locked");

        uint256 reward = 0;
        if (plans[planId].unlockPeriod > 0) {
            reward = ( stakedAmount * plans[planId].rewardRate ) / 100 + stakedAmount;
        } else {
            reward = ( block.timestamp - stakers[msg.sender][index].stakingTimestamp ) * stakedAmount * plans[planId].rewardRate / 31536000 + stakedAmount;
        }

        IERC20(token).transfer(msg.sender, reward);

        // Remove the stake at the specified index
        if(index < stakers[msg.sender].length - 1) {
            for (uint256 i = index; i < stakers[msg.sender].length - 1; i++) {
                stakers[msg.sender][i] = stakers[msg.sender][i + 1];
            }
        }
        stakers[msg.sender].pop();

        emit Unstaked(msg.sender, reward);
    }

    struct StakerInfo {
        uint256 amount;
        uint256 planId;
        uint256 stakingTimestamp;
        uint256 unlockingTime;
    }

    function getStakers() external view returns (StakerInfo[] memory) {
        uint256 stakerCount = stakers[msg.sender].length;
        StakerInfo[] memory stakerInfos = new StakerInfo[](stakerCount);

        for (uint256 i = 0; i < stakerCount; i++) {
            Staker memory staker = stakers[msg.sender][i];
            uint256 planId = staker.planId;
            uint256 unlockingTime = staker.stakingTimestamp + plans[planId].unlockPeriod;

            stakerInfos[i].amount = staker.amount;
            stakerInfos[i].planId = planId;
            stakerInfos[i].stakingTimestamp = staker.stakingTimestamp;
            stakerInfos[i].unlockingTime = unlockingTime;
        }

        return stakerInfos;
    }

    function getPlans() external view returns (Plan[] memory) {
        Plan[] memory allPlans = new Plan[](planCount);

        for (uint256 i = 0; i < planCount; i++) {
            allPlans[i] = plans[i];
        }

        return allPlans;
    }
}
