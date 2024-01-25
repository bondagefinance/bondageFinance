// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/// @title The interface for the Uniswap V3 Factory
/// @notice The Uniswap V3 Factory facilitates creation of Uniswap V3 pools and control over the protocol fees

interface IUniswapV3Factory {
    /// @notice Emitted when the owner of the factory is changed
    /// @param oldOwner The owner before the owner was changed
    /// @param newOwner The owner after the owner was changed
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);

    /// @notice Emitted when a pool is created
    /// @param token0 The first token of the pool by address sort order
    /// @param token1 The second token of the pool by address sort order
    /// @param fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
    /// @param tickSpacing The minimum number of ticks between initialized ticks
    /// @param pool The address of the created pool
    event PoolCreated(
        address indexed token0,
        address indexed token1,
        uint24 indexed fee,
        int24 tickSpacing,
        address pool
    );

    /// @notice Emitted when a new fee amount is enabled for pool creation via the factory
    /// @param fee The enabled fee, denominated in hundredths of a bip
    /// @param tickSpacing The minimum number of ticks between initialized ticks for pools created with the given fee
    event FeeAmountEnabled(uint24 indexed fee, int24 indexed tickSpacing);

    /// @notice Returns the current owner of the factory
    /// @dev Can be changed by the current owner via setOwner
    /// @return The address of the factory owner
    function owner() external view returns (address);

    /// @notice Returns the tick spacing for a given fee amount, if enabled, or 0 if not enabled
    /// @dev A fee amount can never be removed, so this value should be hard coded or cached in the calling context
    /// @param fee The enabled fee, denominated in hundredths of a bip. Returns 0 in case of unenabled fee
    /// @return The tick spacing
    function feeAmountTickSpacing(uint24 fee) external view returns (int24);

    /// @notice Returns the pool address for a given pair of tokens and a fee, or address 0 if it does not exist
    /// @dev tokenA and tokenB may be passed in either token0/token1 or token1/token0 order
    /// @param tokenA The contract address of either token0 or token1
    /// @param tokenB The contract address of the other token
    /// @param fee The fee collected upon every swap in the pool, denominated in hundredths of a bip
    /// @return pool The pool address
    function getPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (address pool);

    /// @notice Creates a pool for the given two tokens and fee
    /// @param tokenA One of the two tokens in the desired pool
    /// @param tokenB The other of the two tokens in the desired pool
    /// @param fee The desired fee for the pool
    /// @dev tokenA and tokenB may be passed in either order: token0/token1 or token1/token0. tickSpacing is retrieved
    /// from the fee. The call will revert if the pool already exists, the fee is invalid, or the token arguments
    /// are invalid.
    /// @return pool The address of the newly created pool
    function createPool(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external returns (address pool);

    /// @notice Updates the owner of the factory
    /// @dev Must be called by the current owner
    /// @param _owner The new owner of the factory
    function setOwner(address _owner) external;

    /// @notice Enables a fee amount with the given tickSpacing
    /// @dev Fee amounts may never be removed once enabled
    /// @param fee The fee amount to enable, denominated in hundredths of a bip (i.e. 1e-6)
    /// @param tickSpacing The spacing between ticks to be enforced for all pools created with the given fee amount
    function enableFeeAmount(uint24 fee, int24 tickSpacing) external;
}

// Define a minimal interface for ISwapRouter
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external returns (uint256 amountOut);
}
// Define a minimal interface for IUniswapV3Pool
interface IUniswapV3Pool {
    function observe(uint32[] calldata secondsAgos) external view returns (int56[] memory tickCumulatives, uint160[] memory secondsPerLiquidityCumulativeX128s);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

interface IWETH {
    // Standard ERC20 functions
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    // ERC20 events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // WETH-specific functions
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}


contract bToken is ERC20 {
    address public bondageFinanceContract;
    address public poolToken;  // Token address for which this bToken is created
    address public owner;

    constructor(string memory name, string memory symbol, address _poolToken, address _bondageFiAddress) ERC20(name, symbol) {
        poolToken = _poolToken;
        owner = msg.sender;
        bondageFinanceContract = _bondageFiAddress;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == bondageFinanceContract, "Only BondageFinance can mint");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(msg.sender == bondageFinanceContract, "Only BondageFinance can burn");
        _burn(from, amount);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Incorrect permissions!");
        _;
    }
}

/**
 * @title BondageFinance
 * @dev Implements liquidity pool management and decentralized governance using bTokens.
 */

contract BondageFinance is ReentrancyGuard {

    ISwapRouter public uniswapRouter;
    IUniswapV3Factory public factory;

    address public owner;
    address public WETH;

    uint256 public constant BOT_FEE_BASIS_POINTS = 500; // 5%
    uint256 public constant PROTOCOL_FEE_BASIS_POINTS = 500; // 5%
    uint256 public constant SLIPPAGE_MAXIMUM = 2000;

    struct Pool {
        uint256 balance; // ETH balance of pool
        uint256 totalPooledTokens; // Total number of tokens pooled
        uint24 poolFee; // UniV3 pool fee
        uint256 pricePerToken; // Price per token set at pool initialization
        uint256 slippage; // Slippage tolerance in basis points
        bool isPriceSet; // Indicates if price is set for the pool
        bool happyEnding; // Flag to determine if happyEnding is enabled or not
        uint256 happyEndingTimestamp; // Keeps track of latest happyEnding initialisation 
    }

    mapping(address => Pool) public pools;
    mapping(address => mapping(address => uint256)) public userBalances;
    mapping(address => bToken) public poolToBToken; // Maps pool token to its bToken


    event TokensDeposited(address indexed token, address indexed user, uint256 amount);
    event TokensWithdrawn(address indexed token, address indexed user, uint256 amount);
    event TokensSwapped(address indexed token, uint256 tokenAmount, uint256 ethAmount);
    event Withdrawal(address indexed token, address indexed user, uint256 ethAmount);
    event BotRewarded(address indexed bot, uint256 reward);
    event ProposalCreated(address indexed token, uint256 id);
    event ProposalExecuted(address indexed token, uint256);
    event PoolReset(address indexed token);
    event PoolWithdrawalEnabled(address indexed token);

    constructor(address _router, address _factory, address _wethAddress) {
        uniswapRouter = ISwapRouter(_router);
        factory = IUniswapV3Factory(_factory);
        WETH = _wethAddress;
        owner = msg.sender;
    }

    /**
     * @dev Initializes a new pool with specified parameters. Can only be called once for each token.
     * @param token The address of the token to create the pool for.
     * @param poolFee The fee to be applied for the Uniswap V3 pool.
     * @param pricePerToken The price per token at which a swap is possible.
     * @param slippage Initial slippage tolerance for the pool.
     */

    function initializePool(address token, uint24 poolFee, uint256 pricePerToken, uint256 slippage) external {
        require(
            !pools[token].isPriceSet && 
            factory.getPool(token, WETH, poolFee) != address(0) && 
            pricePerToken > 0,
            "Initialization error"
        );

        ERC20 tokenContract = ERC20(token);
        string memory tokenName = tokenContract.name();
        string memory tokenSymbol = tokenContract.symbol();

        // Derive bToken name and symbol
        string memory bTokenName = string(abi.encodePacked("b", tokenName));
        string memory bTokenSymbol = string(abi.encodePacked("b", tokenSymbol));

        // Deploy a new bToken contract for this pool
        bToken newBToken = new bToken(bTokenName, bTokenSymbol, token, address(this));
        poolToBToken[token] = newBToken;

        IERC20(token).approve(address(uniswapRouter), type(uint256).max);

        if(slippage > SLIPPAGE_MAXIMUM){
            slippage = SLIPPAGE_MAXIMUM;
        }

        pools[token] = Pool({
            balance: 0,
            totalPooledTokens: 0,
            poolFee: poolFee,
            pricePerToken: pricePerToken,
            isPriceSet: true,
            slippage: slippage,
            happyEnding: false,
            happyEndingTimestamp: block.timestamp
        });
    }

    /**
     * @dev Allows users to deposit tokens into a specific pool and receive bTokens in return.
     * @param token The address of the token being deposited.
     * @param amount The amount of tokens being deposited.
     */
    function depositTokens(address token, uint256 amount) external {
        require(amount > 0 && pools[token].isPriceSet, "Deposit error: Amount 0 or pool not initialized");

        // Check if 24 hours have passed since the happyEnding was set active. Reset it on deposit.
        if(block.timestamp >= pools[token].happyEndingTimestamp + 24 hours && pools[token].happyEnding == true){
            pools[token].happyEnding = false;
        }
        require(pools[token].happyEnding == false, "happyEnding is active on this pool. Deposits cannot be made.");

        Pool storage pool = pools[token];

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        pool.totalPooledTokens += amount;
        userBalances[token][msg.sender] += amount;

        // Mint bTokens for the depositor
        bToken bTokenContract = poolToBToken[token];
        bTokenContract.mint(msg.sender, amount);

        emit TokensDeposited(token, msg.sender, amount);
    }

    /**
    * @dev Allows users to withdraw their proportional share of assets from the pool.
    * If the happyEnding flag is active, users are required to withdraw both tokens and ETH, and their entire bToken balance is burned.
    * @param token The address of the token associated with the pool.
    */
    function withdrawAssets(address token) external nonReentrant {
        bToken bTokenContract = poolToBToken[token];
        Pool storage pool = pools[token];
        uint256 userbTokenBalance = bTokenContract.balanceOf(msg.sender);
        require(userbTokenBalance > 0, "Withdraw error: No assets to withdraw");
        require(pool.happyEnding, "Happy Ending not enabled, withdrawals prohibited.");

        // Calculate user's share of tokens and ETH
        uint256 userShareOfTokens = (pool.totalPooledTokens * userbTokenBalance) / bTokenContract.totalSupply();
        uint256 userShareOfETH = (pool.balance * userbTokenBalance) / bTokenContract.totalSupply();

        // Burn the entire bToken balance
        bTokenContract.burn(msg.sender, userbTokenBalance);

        // Withdraw both tokens and ETH if happyEnding is enabled
        if(pool.totalPooledTokens > 0){
            pool.totalPooledTokens -= userShareOfTokens;
            IERC20(token).transfer(msg.sender, userShareOfTokens);
            emit TokensWithdrawn(token, msg.sender, userShareOfTokens);
        }
        if(pool.balance > 0){
            pool.balance -= userShareOfETH;
            payable(msg.sender).transfer(userShareOfETH);
            emit Withdrawal(token, msg.sender, userShareOfETH);
        }

        // If totalPooledTokens and ETH are now 0, disable the happyEnding flag and increase pricePerToken to maxInt to effectively reset the pool
        if(pool.totalPooledTokens <= 0 && pool.balance <= 0){
            pool.happyEnding = false;
            pool.pricePerToken = type(uint256).max; // Set to maximum value to prevent instant swaps in the event of a reset
            emit PoolReset(token);
        }
    }

    /**
     * @dev Allows swapping a specified amount of pool tokens for ETH.
     * @param token The address of the token being swapped.
     * @param amountToSwap The amount of tokens to swap for ETH.
     */
    function swapTokensForETH(address token, uint256 amountToSwap) external nonReentrant {
        Pool storage pool = pools[token];
        require(!pool.happyEnding && amountToSwap > 0 
            && amountToSwap <= pool.totalPooledTokens 
            && pool.isPriceSet, 
            "Swap error: happyEnding enabled, invalid amount, or pool not set");


        uint256 minimumETHOut = pool.pricePerToken * amountToSwap / 1e18;
        uint256 slippageAmount = (minimumETHOut * pool.slippage) / 10000;
        minimumETHOut -= slippageAmount;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: token,
            tokenOut: WETH,
            fee: pool.poolFee,
            recipient: address(this),
            deadline: block.timestamp + 900, // 30 minutes from the current block timestamp
            amountIn: amountToSwap,
            amountOutMinimum: minimumETHOut,
            sqrtPriceLimitX96: 0
        });

        // Execute the swap and receive ETH
        uint256 amountOut = uniswapRouter.exactInputSingle(params);
        require(amountOut >= minimumETHOut, "Slippage exceeded");

        IWETH(WETH).withdraw(amountOut);

        // Adjust the rewards based on the actual swap output
        uint256 actualBotReward = (amountOut * BOT_FEE_BASIS_POINTS) / 10000;
        uint256 actualOwnerReward = (amountOut * PROTOCOL_FEE_BASIS_POINTS) / 10000;

        // Update the pool's balance
        pool.balance += (amountOut - actualBotReward - actualOwnerReward);
        pool.totalPooledTokens -= amountToSwap;

        payable(msg.sender).transfer(actualBotReward);
        payable(owner).transfer(actualOwnerReward);

        // If totalPooledTokens is now 0, enable the happyEnding flag for an extra 24 hours, as all tokens have been swapped
        if(pool.totalPooledTokens <= 0){
            pool.happyEnding = true;
            pool.happyEndingTimestamp = block.timestamp + 24 hours;
            emit PoolWithdrawalEnabled(token);
        }

        emit BotRewarded(msg.sender, actualBotReward);
        emit TokensSwapped(token, amountToSwap, amountOut);
    }

    // Governance functions

    struct Proposal {
        address poolToken;
        uint256 newSlippage;
        uint256 newPricePerToken;
        bool newhappyEnding;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        uint256 deadline;
    }

    mapping(uint256 => Proposal) public proposals;
    // Maps proposal ID to a mapping of user addresses and their voting status
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCount;

    /**
    * @dev Creates a new proposal for a specific pool. Only bToken holders can create proposals.
    * @param poolToken The token address for which the proposal is being created.
    * @param newSlippage The proposed new slippage value for the pool.
    * @param newPricePerToken The proposed new price per token for the pool.
    * @param newhappyEnding The proposed happyEnding status for the pool.
    */
    function createProposal(address poolToken, uint256 newSlippage, uint256 newPricePerToken, bool newhappyEnding) external {
        uint256 proposerBalance = poolToBToken[poolToken].balanceOf(msg.sender);
        require(proposerBalance > 0, "Not a bToken holder");

        uint256 currentProposalId = proposalCount; // Store the current proposal ID

        if(newSlippage > SLIPPAGE_MAXIMUM){
            newSlippage = SLIPPAGE_MAXIMUM;
        }

        Proposal memory newProposal = Proposal({
            poolToken: poolToken,
            newSlippage: newSlippage,
            newPricePerToken: newPricePerToken,
            newhappyEnding: newhappyEnding,
            yesVotes: proposerBalance, // Set initial yes votes to the proposer's balance
            noVotes: 0,
            executed: false,
            deadline: block.timestamp + 6 hours // 6-hour voting window
        });

        proposals[currentProposalId] = newProposal;
        proposalCount++;
        // Flag the msg.sender as having voted on this proposal
        hasVoted[currentProposalId][msg.sender] = true;
        emit ProposalCreated(poolToken, currentProposalId);
    }

    /**
    * @dev Allows bToken holders to vote on a proposal.
    * @param proposalId The ID of the proposal to vote on.
    * @param voteYes Boolean indicating if the vote is for (true) or against (false).
    */
    function voteOnProposal(uint256 proposalId, bool voteYes) external {
        require(!hasVoted[proposalId][msg.sender], "User has already voted on this proposal");
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline && !proposal.executed, "Vote error: Period ended or already executed");

        uint256 voterBalance = poolToBToken[proposal.poolToken].balanceOf(msg.sender);
        require(voterBalance > 0, "Not a bToken holder");
        hasVoted[proposalId][msg.sender] = true;

        if (voteYes) {
            proposal.yesVotes += voterBalance;
        } else {
            proposal.noVotes += voterBalance;
        }
    }

    /**
    * @dev Executes a proposal if the voting period has ended and the proposal has majority support.
    * @param proposalId The ID of the proposal to execute.
    */
    function executeProposal(uint256 proposalId) external {

        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");

        bToken bTokenContract = poolToBToken[proposal.poolToken];
        uint256 totalSupply = bTokenContract.totalSupply();
        require(totalSupply > 0, "bToken supply is zero");

        // Check if the proposal has majority support
        require(proposal.yesVotes > totalSupply / 2, "Majority not reached");

        Pool storage pool = pools[proposal.poolToken];

        pool.slippage = proposal.newSlippage;
        pool.pricePerToken = proposal.newPricePerToken;
        pool.happyEnding = proposal.newhappyEnding;

        if(proposal.newhappyEnding == true){
            pool.happyEndingTimestamp = block.timestamp;
        }

        proposal.executed = true;

        emit ProposalExecuted(proposals[proposalId].poolToken, proposalId);
    }

    //Temporary owner functions

    function withdrawTokens(address _token) public onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(owner, token.balanceOf(address(this)));
    }

    function changeOwnership(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Incorrect permissions!");
        _;
    }
    // Function to receive ETH from swaps
    receive() external payable {}

    //Possible TODO: Function to allow freezing of specific pools (isPriceSet = false) for future governance.
}
