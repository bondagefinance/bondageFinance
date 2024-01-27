let web3;

// Check for MetaMask, else use an HTTP provider
if (typeof window.ethereum !== 'undefined') {
    web3 = new Web3(window.ethereum);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}

// Contract ABIs and Addresses (replace with actual ABIs and addresses)
const bondageFinanceABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_router",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_factory",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_wethAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "bot",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "reward",
				"type": "uint256"
			}
		],
		"name": "BotRewarded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_newOwner",
				"type": "address"
			}
		],
		"name": "changeOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "poolToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "newSlippage",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "newPricePerToken",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "newhappyEnding",
				"type": "bool"
			}
		],
		"name": "createProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "depositTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			}
		],
		"name": "executeProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint24",
				"name": "poolFee",
				"type": "uint24"
			},
			{
				"internalType": "uint256",
				"name": "pricePerToken",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "slippage",
				"type": "uint256"
			}
		],
		"name": "initializePool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "PoolReset",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "PoolWithdrawalEnabled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "ProposalCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "ProposalExecuted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amountToSwap",
				"type": "uint256"
			}
		],
		"name": "swapTokensForETH",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TokensDeposited",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ethAmount",
				"type": "uint256"
			}
		],
		"name": "TokensSwapped",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TokensWithdrawn",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "proposalId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "voteYes",
				"type": "bool"
			}
		],
		"name": "voteOnProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ethAmount",
				"type": "uint256"
			}
		],
		"name": "Withdrawal",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "withdrawAssets",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			}
		],
		"name": "withdrawTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "BOT_FEE_BASIS_POINTS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "factory",
		"outputs": [
			{
				"internalType": "contract IUniswapV3Factory",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasVoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "pools",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalPooledTokens",
				"type": "uint256"
			},
			{
				"internalType": "uint24",
				"name": "poolFee",
				"type": "uint24"
			},
			{
				"internalType": "uint256",
				"name": "pricePerToken",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "slippage",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isPriceSet",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "happyEnding",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "happyEndingTimestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "poolToBToken",
		"outputs": [
			{
				"internalType": "contract bToken",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "proposalCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "proposals",
		"outputs": [
			{
				"internalType": "address",
				"name": "poolToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "newSlippage",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "newPricePerToken",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "newhappyEnding",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "yesVotes",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "noVotes",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "PROTOCOL_FEE_BASIS_POINTS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "uniswapRouter",
		"outputs": [
			{
				"internalType": "contract ISwapRouter",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userBalances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "WETH",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const bTokenABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    // Additional ERC20 functions
    {
        "constant": false,
        "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}],
        "name": "allowance",
        "outputs": [{"name": "remaining", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "transfer",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "transferFrom",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    {
        "inputs": [{"name": "_initialAmount", "type": "uint256"}, {"name": "_tokenName", "type": "string"}, {"name": "_decimalUnits", "type": "uint8"}, {"name": "_tokenSymbol", "type": "string"}],
        "type": "constructor"
    },
    {
        "constant": true,
        "inputs": [{"name": "_spender", "type": "address"}, {"name": "_addedValue", "type": "uint256"}],
        "name": "increaseApproval",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_spender", "type": "address"}, {"name": "_subtractedValue", "type": "uint256"}],
        "name": "decreaseApproval",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    // Added method to get token name
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
];


const bondageFinanceAddress = '0x54359A7B7bBE47024D6C2a643F18f8DD623064D0'; //Goerli

const WETHAddress = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'; //Goerli
const uniswapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; //Goerli
const uniswapRouterABI = 
    [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH9","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH9","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"}],"internalType":"struct ISwapRouter.ExactInputParams","name":"params","type":"tuple"}],"name":"exactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct ISwapRouter.ExactInputSingleParams","name":"params","type":"tuple"}],"name":"exactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"}],"internalType":"struct ISwapRouter.ExactOutputParams","name":"params","type":"tuple"}],"name":"exactOutput","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMaximum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct ISwapRouter.ExactOutputSingleParams","name":"params","type":"tuple"}],"name":"exactOutputSingle","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"refundETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowed","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitAllowedIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"selfPermitIfNecessary","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"sweepToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"sweepTokenWithFee","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"int256","name":"amount0Delta","type":"int256"},{"internalType":"int256","name":"amount1Delta","type":"int256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"uniswapV3SwapCallback","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"}],"name":"unwrapWETH9","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountMinimum","type":"uint256"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"feeBips","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"name":"unwrapWETH9WithFee","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}]
;
const routerContract = new web3.eth.Contract(uniswapRouterABI, uniswapRouterAddress);

document.addEventListener('DOMContentLoaded', () => {
    initWeb3();
});

async function initWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Initialize the contract instance
            bondageFinanceContract = new web3.eth.Contract(bondageFinanceABI, bondageFinanceAddress);

            // Other initialization code...
        } catch (error) {
            console.error("User denied account access", error);
        }
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
}

document.getElementById('searchTokenBtn').addEventListener('click', async () => {
    const tokenAddress = document.getElementById('tokenAddressInput').value.trim();
    if (!web3.utils.isAddress(tokenAddress)) {
        alert('Invalid address');
        return;
    }

    try {
        const pool = await bondageFinanceContract.methods.pools(tokenAddress).call();

        if (!pool.isPriceSet) {
            noPoolMessage.textContent = 'A bondage pool does not exist for this token';
            noPoolMessage.style.display = 'block';
            swapBtn.disabled = true; // Disable the swap button
            return;
        } else {
            noPoolMessage.style.display = 'none';
        }
        
        // Detect token decimals and display token balances
        const tokenContract = new web3.eth.Contract(bTokenABI, tokenAddress);
        const tokenDecimals = await tokenContract.methods.decimals().call();
        const userAddress = (await web3.eth.getAccounts())[0];
        const userBalance = await tokenContract.methods.balanceOf(userAddress).call();
        const approvedAmount = await tokenContract.methods.allowance(userAddress, bondageFinanceContract._address).call();

        document.getElementById('userBalance').innerText = `Your Balance: ${web3.utils.fromWei(userBalance, 'ether')}`;
        document.getElementById('approvedAmount').innerText = `Approved Amount: ${web3.utils.fromWei(approvedAmount, 'ether')}`;

        // Enable or disable approval button based on approved amount
        const depositAmount = document.getElementById('depositAmount').value;
        const depositAmountInTokenUnit = depositAmount ? web3.utils.toBN(depositAmount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(tokenDecimals))) : web3.utils.toBN(0);
        document.getElementById('approveButton').disabled = web3.utils.toBN(approvedAmount).gte(web3.utils.toBN(depositAmountInTokenUnit));
        
        // Fetch current price of the token and compare it with the pool's pricePerToken
        const currentTokenPrice = await fetchTokenPrice(tokenAddress);
        const poolPricePerToken = web3.utils.fromWei(pool.pricePerToken, 'ether');
        swapBtn.disabled = parseFloat(currentTokenPrice) < parseFloat(poolPricePerToken);
        const tokenName = await tokenContract.methods.name().call();
        const formattedPoolDetails = await formatPoolDetails(pool, tokenName, tokenAddress);
        document.getElementById('poolDetails').innerHTML = formattedPoolDetails;
        await checkAndDisplayProposalSection(tokenAddress);
        await fetchAndDisplayProposals(tokenAddress);

        const activeProposalsSection = document.getElementById('activeProposals');
        if (activeProposalsSection.innerHTML.trim() !== 'No active proposals for this token.') {
            activeProposalsSection.classList.remove('hidden');
        } else {
            activeProposalsSection.classList.add('hidden');
        }

        if (pool.happyEnding) {
            depositBtn.disabled = true; 
        } else {
            withdrawBtn.disabled = true;
        }

        // Toggle the visibility of the pool info section
        const poolInfo = document.getElementById('poolInfo');
        if (poolInfo.style.display === 'none' || poolInfo.style.display === '') {
            poolInfo.style.display = 'block';
            activeProposals.style.display = 'block';
        } else {
            poolInfo.style.display = 'none';
            activeProposals.style.display = 'none';
        }

    } catch (error) {
        console.error(error);
        alert('Error fetching pool info');
    }
    
});

async function formatPoolDetails(pool, tokenName, tokenAddress) {
    const currentTokenPrice = await fetchTokenPrice(tokenAddress);

    const detailLines = [
        `Token Name: ${tokenName}`,
        `ETH Balance: ${web3.utils.fromWei(pool.balance.toString(), 'ether')}`,
        `Total Pooled Tokens: ${web3.utils.fromWei(pool.totalPooledTokens.toString(), 'ether')}`,
        `Price To Swap At: ${web3.utils.fromWei(pool.pricePerToken.toString(), 'ether')} ETH`,
        `Current Token Price: ${currentTokenPrice} ETH`,
        `Slippage: ${pool.slippage / 100}%`,
        `Happy Ending: ${pool.happyEnding ? 'True' : 'False'}`,
        `Last Happy Ending Timestamp: ${new Date(pool.happyEndingTimestamp * 1000).toLocaleString()}`
    ];

    return detailLines.join('<br>'); // Join lines with HTML break
}


const factoryV3ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":true,"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"FeeAmountEnabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token0","type":"address"},{"indexed":true,"internalType":"address","name":"token1","type":"address"},{"indexed":true,"internalType":"uint24","name":"fee","type":"uint24"},{"indexed":false,"internalType":"int24","name":"tickSpacing","type":"int24"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolCreated","type":"event"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"createPool","outputs":[{"internalType":"address","name":"pool","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"name":"enableFeeAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint24","name":"","type":"uint24"}],"name":"feeAmountTickSpacing","outputs":[{"internalType":"int24","name":"","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"parameters","outputs":[{"internalType":"address","name":"factory","type":"address"},{"internalType":"address","name":"token0","type":"address"},{"internalType":"address","name":"token1","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"int24","name":"tickSpacing","type":"int24"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"setOwner","outputs":[],"stateMutability":"nonpayable","type":"function"}]; // Uniswap V3 Factory ABI
const factoryV3Address = "0x1F98431c8aD98523631AE4a59f267346ea31F984"; // Uniswap V3 Factory Address
const poolABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "slot0",
        "outputs": [
            { "internalType": "uint160", "name": "sqrtPriceX96", "type": "uint160" },
            { "internalType": "int24", "name": "tick", "type": "int24" },
            { "internalType": "uint16", "name": "observationIndex", "type": "uint16" },
            { "internalType": "uint16", "name": "observationCardinality", "type": "uint16" },
            { "internalType": "uint16", "name": "observationCardinalityNext", "type": "uint16" },
            { "internalType": "uint8", "name": "feeProtocol", "type": "uint8" },
            { "internalType": "bool", "name": "unlocked", "type": "bool" }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]
;

// Add event listeners for price multiple buttons with updated multipliers
document.getElementById('priceMultiple1').addEventListener('click', () => setPriceMultiple(2));
document.getElementById('priceMultiple2').addEventListener('click', () => setPriceMultiple(5));
document.getElementById('priceMultiple3').addEventListener('click', () => setPriceMultiple(10));


const factoryV3Contract = new web3.eth.Contract(factoryV3ABI, factoryV3Address);

// Relevant part of the Quoter ABI
const quoterABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "tokenIn", "type": "address"},
      {"internalType": "address", "name": "tokenOut", "type": "address"},
      {"internalType": "uint24", "name": "fee", "type": "uint24"},
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160"}
    ],
    "name": "quoteExactInputSingle",
    "outputs": [{"internalType": "uint256", "name": "amountOut", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Quoter contract address
const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

// Quoter contract instance
const quoterContract = new web3.eth.Contract(quoterABI, quoterAddress);

async function fetchTokenPrice(tokenAddress) {
  const tokenIn = tokenAddress; // Your token address
  const tokenOut = WETHAddress; // Wrapped ETH address
  const fee = 3000; // Fee tier, e.g., 3000 for 0.3%
  const amountIn = web3.utils.toWei('1', 'ether'); // 1 token

  try {
    // Get quote for 1 token to ETH
    const amountOut = await quoterContract.methods.quoteExactInputSingle(
      tokenIn,
      tokenOut,
      fee,
      amountIn,
      0 // sqrtPriceLimitX96
    ).call();

    const pricePerTokenInEther = web3.utils.fromWei(amountOut.toString(), 'ether');
    console.log('Price per token in ETH:', pricePerTokenInEther);
    return pricePerTokenInEther;
  } catch (error) {
    console.error('Error fetching token price from Uniswap', error);
    return null;
  }
}


async function setPriceMultiple(multiple) {
    const tokenAddress = document.getElementById('poolTokenAddressInput').value.trim();
    if (!web3.utils.isAddress(tokenAddress)) {
        alert('Invalid address');
        return;
    }
    const pricePerToken = await fetchTokenPrice(tokenAddress);
    if (pricePerToken) {
        document.getElementById('pricePerTokenInput').value = (pricePerToken * multiple).toFixed(18);
    } else {
        alert('Unable to fetch token price');
    }
}

document.getElementById('poolTokenAddressInput').addEventListener('input', async function() {
    const tokenAddress = this.value.trim();
    const initializeButton = document.getElementById('initializePoolBtn');
    const poolExistenceMessage = document.getElementById('poolExistenceMessage');

    if (!web3.utils.isAddress(tokenAddress)) {
        poolExistenceMessage.textContent = '';
        initializeButton.disabled = false; // Enable the button if address is not valid
        return;
    }

    try {
        const pool = await bondageFinanceContract.methods.pools(tokenAddress).call();
        if (pool && pool.isPriceSet) {
            poolExistenceMessage.textContent = 'A bondage pool for this token already exists.';
            initializeButton.disabled = true; // Disable the button if pool exists
        } else {
            poolExistenceMessage.textContent = '';
            initializeButton.disabled = false; // Enable the button if no pool exists
        }
    } catch (error) {
        console.error('Error checking pool existence', error);
        poolExistenceMessage.textContent = 'Error checking pool.';
        initializeButton.disabled = true; // Disable the button in case of error
    }
});

document.getElementById('depositBtn').addEventListener('click', async () => {
    const tokenAddress = document.getElementById('tokenAddressInput').value.trim();

    if (!web3.utils.isAddress(tokenAddress)) {
        alert('Invalid token address');
        return;
    }

    const depositAmount = document.getElementById('depositAmount').value;

    if (isNaN(depositAmount) || depositAmount <= 0) {
        alert('Invalid amount');
        return;
    }

    try {
        // Retrieve token contract and decimals
        const tokenContract = new web3.eth.Contract(bTokenABI, tokenAddress);
        const tokenDecimals = await tokenContract.methods.decimals().call();

        // Convert deposit amount to the correct unit based on token decimals
        const amountInTokenUnit = web3.utils.toBN(web3.utils.toWei(depositAmount, 'ether')).mul(web3.utils.toBN(10).pow(web3.utils.toBN(tokenDecimals - 18)));

        const accounts = await web3.eth.getAccounts();
        // Call the depositTokens function with the token address and amount in token unit
        await bondageFinanceContract.methods.depositTokens(tokenAddress, amountInTokenUnit.toString()).send({ from: accounts[0] });

        alert(`Successfully deposited ${depositAmount} tokens.`);
    } catch (error) {
        console.error(error);
        alert('Error depositing tokens');
    }
});


document.getElementById('withdrawBtn').addEventListener('click', async () => {
    const tokenAddress = document.getElementById('tokenAddressInput').value.trim();

    if (!web3.utils.isAddress(tokenAddress)) {
        alert('Invalid token address');
        return;
    }

    try {
        const accounts = await web3.eth.getAccounts();
        await bondageFinanceContract.methods.withdrawAssets(tokenAddress).send({ from: accounts[0] });
        alert('Withdrawal successful');
    } catch (error) {
        console.error(error);
        alert('Error during withdrawal');
    }
});

document.getElementById('swapBtn').addEventListener('click', async () => {
    const tokenAddress = document.getElementById('tokenAddressInput').value.trim();
    const swapAmount = parseFloat(document.getElementById('swapAmount').value);

    if (!web3.utils.isAddress(tokenAddress)) {
        alert('Invalid token address');
        return;
    }

    if (isNaN(swapAmount) || swapAmount <= 0) {
        alert('Invalid swap amount');
        return;
    }

    try {
        const tokenContract = new web3.eth.Contract(bTokenABI, tokenAddress);
        const tokenDecimals = await tokenContract.methods.decimals().call();
        const amountInTokenUnit = web3.utils.toBN(swapAmount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(tokenDecimals)));

        const accounts = await web3.eth.getAccounts();
        await bondageFinanceContract.methods.swapTokensForETH(tokenAddress, amountInTokenUnit.toString()).send({ from: accounts[0] });
        alert('Swap successful');
    } catch (error) {
        console.error(error);
        alert('Error during swap');
    }
});

document.getElementById('initializePoolBtn').addEventListener('click', async () => {
    const poolTokenAddress = document.getElementById('poolTokenAddressInput').value.trim();

    if (!web3.utils.isAddress(poolTokenAddress)) {
        alert('Invalid Pool Token address');
        return;
    }

    // Fetch and display the pool fee
    const poolFee = await fetchPoolFee(poolTokenAddress);
    console.log("Pool fee for token is "+poolFee);
    const pricePerToken = document.getElementById('pricePerTokenInput').value.trim();
    const slippage = document.getElementById('slippageInput').value.trim();

    if (!web3.utils.isAddress(poolTokenAddress)) {
        alert('Invalid Pool Token address');
        return;
    }

    if (!poolFee || !pricePerToken || !slippage) {
        alert('Please fill in all fields');
        return;
    }

    const slippagePercentage = document.getElementById('slippageInput').value.trim();
    const slippageBasisPoints = slippagePercentage * 100; // Convert percentage to basis points

    try {
        const accounts = await web3.eth.getAccounts();
        await bondageFinanceContract.methods.initializePool(
            poolTokenAddress,
            poolFee.toString(), // Convert poolFee to string
            web3.utils.toWei(pricePerToken, 'ether'), // Assuming pricePerToken is entered in ether units
            slippageBasisPoints // Convert slippageBasisPoints to string
            ).send({ from: accounts[0] });
    
        alert('Pool initialized successfully');
    } catch (error) {
        console.error(error);
        alert('Error initializing pool');
    }
    
});

// Array of possible fee tiers in Uniswap V3
const feeTiers = [500, 3000, 10000]; // 0.05%, 0.3%, and 1%

// Function to fetch pool fee
async function fetchPoolFee(tokenAddress) {
    try {
        console.log("Looking for pool fee");

        // Iterate through fee tiers to find the pool
        for (const fee of feeTiers) {
            const poolAddress = await factoryV3Contract.methods.getPool(tokenAddress, WETHAddress, fee).call();

            // Check if pool address is valid (not zero address)
            if (poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000') {
                console.log("Pool found for fee tier: " + fee);
                return fee; // Return the fee tier if pool is found
            }
        }

        // If no pool is found for any fee tier
        throw new Error('No pool exists for this token with standard fee tiers');
    } catch (error) {
        console.error('Error fetching pool fee from Uniswap', error);
        return null;
    }
}

async function displayProposals() {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    const proposalCount = await bondageFinanceContract.methods.proposalCount().call();
    let proposalsHtml = '';

    for (let i = 0; i < proposalCount; i++) {
        const proposal = await bondageFinanceContract.methods.proposals(i).call();
        const bTokenBalance = await poolToBToken[proposal.poolToken].balanceOf(userAddress).call();

        if (bTokenBalance > 0) {
            // Construct HTML for each proposal
            proposalsHtml += `<div class="proposal">
                                <p>Proposal ID: ${i}</p>
                                <p>Pool Token: ${proposal.poolToken}</p>
                                <p>New Slippage: ${proposal.newSlippage}</p>
                                <p>New Price Per Token: ${web3.utils.fromWei(proposal.newPricePerToken, 'ether')}</p>
                                <p>New Happy Ending: ${proposal.newhappyEnding}</p>
                                <button onclick="voteOnProposal(${i}, true)">Vote Yes</button>
                                <button onclick="voteOnProposal(${i}, false)">Vote No</button>
                              </div>`;
        }
    }

    document.getElementById('proposalsList').innerHTML = proposalsHtml;
}

document.getElementById('proposalSlippageInput').addEventListener('input', function() {
    const slippageValue = parseFloat(this.value);
    const slippageError = document.getElementById('slippageError');

    if (slippageValue > 5) {
        slippageError.textContent = 'Slippage above 5% is not allowed.';
    } else {
        slippageError.textContent = '';
    }
});

document.getElementById('slippageInput').addEventListener('input', function() {
    const slippageValue = parseFloat(this.value);
    const slippageError = document.getElementById('slippageWarning');

    if (slippageValue > 5) {
        slippageError.textContent = 'Slippage above 5% is not allowed.';
    } else {
        slippageError.textContent = '';
    }
});


async function voteOnProposal(proposalId, voteYes) {
    try {
        const accounts = await web3.eth.getAccounts();
        await bondageFinanceContract.methods.voteOnProposal(proposalId, voteYes).send({ from: accounts[0] });
        alert(`Voted ${voteYes ? 'Yes' : 'No'} on Proposal ${proposalId}`);
    } catch (error) {
        console.error(error);
        alert('Error during voting');
    }
}

async function executeProposal(proposalId) {
    try {
        const accounts = await web3.eth.getAccounts();
        await bondageFinanceContract.methods.executeProposal(proposalId).send({ from: accounts[0] });
    } catch (error) {
        console.error(error);
        alert('Error during execution');
    }
}

async function checkAndDisplayProposalSection(tokenAddress) {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    try {
        // Get the bToken address for the pool token
        const bTokenAddress = await bondageFinanceContract.methods.poolToBToken(tokenAddress).call();
        
        // If no bToken found, hide proposal section and return
        if (!bTokenAddress || bTokenAddress === '0x0000000000000000000000000000000000000000') {
            document.getElementById('createProposalSection').classList.add('hidden');
            return;
        }

        // Create a contract instance for the bToken
        const bTokenContract = new web3.eth.Contract(bTokenABI, bTokenAddress);
        const bTokenBalance = await bTokenContract.methods.balanceOf(userAddress).call();

        // Show or hide the proposal section based on bToken balance
        const proposalSection = document.getElementById('createProposalSection');
        proposalSection.classList.toggle('hidden', bTokenBalance === '0');
    } catch (error) {
        console.error('Error checking bToken balance', error);
    }
}

document.getElementById('createProposalBtn').addEventListener('click', async () => {
    const slippageInput = document.getElementById('proposalSlippageInput').value.trim();
    const priceInput = document.getElementById('proposalPriceInput').value.trim();
    const happyEndingInput = document.getElementById('proposalHappyEndingInput').checked;
    const tokenAddress = document.getElementById('tokenAddressInput').value.trim(); // Assuming this is the pool token address

    if (!web3.utils.isAddress(tokenAddress)) {
        alert('Invalid Pool Token address');
        return;
    }

    if (!slippageInput || !priceInput) {
        alert('Please fill in all fields');
        return;
    }

    const slippagePercentage = parseFloat(slippageInput);
    if (isNaN(slippagePercentage) || slippagePercentage < 0) {
        alert('Invalid slippage percentage');
        return;
    }

    // Convert slippage to basis points (1 basis point = 0.01%)
    const slippageBasisPoints = slippagePercentage * 100; // Convert percentage to basis points

    try {
        const accounts = await web3.eth.getAccounts();
        await bondageFinanceContract.methods.createProposal(
            tokenAddress,
            slippageBasisPoints, // Convert slippageInput to string
            web3.utils.toWei(priceInput, 'ether'), // Assuming priceInput is entered in ether units
            happyEndingInput
        ).send({ from: accounts[0] });

        alert('Proposal created successfully');
    } catch (error) {
        console.error('Error creating proposal', error);
        alert('Error creating proposal');
    }
});

async function fetchAndDisplayProposals(tokenAddress) {
    try {
        const proposalCount = await bondageFinanceContract.methods.proposalCount().call();
        let proposalsHtml = '';
        const currentTime = Math.floor(Date.now() / 1000); // Current time in UNIX timestamp

        for (let i = 0; i < proposalCount; i++) {
            const proposal = await bondageFinanceContract.methods.proposals(i).call();
            
            // Check if the proposal is related to the token and either not executed or the deadline has not passed
            if (proposal.poolToken.toLowerCase() === tokenAddress.toLowerCase() && (!proposal.executed && currentTime < proposal.deadline)) {
                // Fetch additional data here
                const newSlippage = proposal.newSlippage;
                const newPricePerTokenInEther = web3.utils.fromWei(proposal.newPricePerToken, 'ether');
                const yesVotesInEther = web3.utils.fromWei(proposal.yesVotes, 'ether');

                // Retrieve the bToken address associated with tokenAddress
                const bTokenAddress = await bondageFinanceContract.methods.poolToBToken(tokenAddress).call();
                const bTokenContract = new web3.eth.Contract(bTokenABI, bTokenAddress);
                const totalSupply = await bTokenContract.methods.totalSupply().call();
                const isExecuteDisabled = proposal.yesVotes <= totalSupply / 2;

                proposalsHtml += formatProposalHtml(i, proposal, newSlippage, newPricePerTokenInEther, yesVotesInEther, isExecuteDisabled);
            }
        }

        const proposalsList = document.getElementById('proposalsList');
        proposalsList.innerHTML = proposalsHtml || 'No active proposals for this token.';
        const activeProposalsSection = document.getElementById('activeProposals');
        activeProposalsSection.style.display = proposalsHtml ? 'block' : 'none';
    } catch (error) {
        console.error('Error fetching proposals', error);
        document.getElementById('proposalsList').innerText = 'Error loading proposals.';
        document.getElementById('activeProposals').style.display = 'none';
    }
}



function formatProposalHtml(proposalId, proposal, newSlippageInEther, newPricePerTokenInEther, yesVotesInEther, isExecuteDisabled) {
    return `
        <div class="proposal">
            <p>Proposal ID: ${proposalId}</p>
            <p>Pool Token: ${proposal.poolToken}</p>
            <p>New Slippage: ${newSlippageInEther}</p>
            <p>New Price Per Token: ${newPricePerTokenInEther}</p>
            <p>Enable Happy Ending: ${proposal.newhappyEnding ? 'Yes' : 'No'}</p>
            <p>Yes Votes: ${yesVotesInEther}</p>
            <p>No Votes: ${proposal.noVotes}</p>
            <p>Deadline: ${new Date(proposal.deadline * 1000).toLocaleString()}</p>
            <button class="bg-blue-500 hover:bg-blue-700" onclick="voteOnProposal(${proposalId}, true)">Vote Yes</button>
            <button class="bg-red-500 hover:bg-red-700" onclick="voteOnProposal(${proposalId}, false)">Vote No</button>
            <button class="bg-green-500 hover:bg-green-700" onclick="executeProposal(${proposalId})" ${isExecuteDisabled ? 'disabled' : ''}>Execute Proposal</button>
        </div>
    `;
}



async function voteOnProposal(proposalId, voteYes) {
    try {
        const accounts = await web3.eth.getAccounts();
        await bondageFinanceContract.methods.voteOnProposal(proposalId, voteYes).send({ from: accounts[0] });
        alert(`Voted ${voteYes ? 'Yes' : 'No'} on proposal ${proposalId}`);
    } catch (error) {
        console.error('Error voting on proposal', error);
        alert('Error voting on proposal');
    }
}

document.getElementById('pricePerTokenInput').addEventListener('focus', function() {
    // Show the multiplier buttons
    document.querySelectorAll('.multiplier-button').forEach(button => button.style.display = 'inline-block');
});

document.getElementById('pricePerTokenInput').addEventListener('blur', function() {
    // Delay hiding the multiplier buttons
    setTimeout(() => {
        document.querySelectorAll('.multiplier-button').forEach(button => button.style.display = 'none');
    }, 200); // Delay of 200 milliseconds
});

document.getElementById('proposalPriceInput').addEventListener('focus', function() {
    // Show the multiplier buttons for proposal
    document.querySelectorAll('.proposal-multiplier-button').forEach(button => button.style.display = 'inline-block');
});

document.getElementById('proposalPriceInput').addEventListener('blur', function() {
    // Delay hiding the multiplier buttons for proposal
    setTimeout(() => {
        document.querySelectorAll('.proposal-multiplier-button').forEach(button => button.style.display = 'none');
    }, 200); // Delay of 200 milliseconds
});

['priceMultiple1', 'priceMultiple2', 'priceMultiple3'].forEach(buttonId => {
    document.getElementById(buttonId).addEventListener('click', async function() {
        const multiplier = this.id === 'priceMultiple1' ? 2 : this.id === 'priceMultiple2' ? 5 : 10;
        const tokenAddress = document.getElementById('poolTokenAddressInput').value.trim();
        if (web3.utils.isAddress(tokenAddress)) {
            const currentPrice = await fetchTokenPrice(tokenAddress);
            document.getElementById('pricePerTokenInput').value = (currentPrice * multiplier).toFixed(18);
        }
    });
});

['proposalPriceMultiple1', 'proposalPriceMultiple2', 'proposalPriceMultiple3'].forEach(buttonId => {
    document.getElementById(buttonId).addEventListener('click', async function() {
        const multiplier = this.id === 'proposalPriceMultiple1' ? 2 : this.id === 'proposalPriceMultiple2' ? 5 : 10;
        const tokenAddress = document.getElementById('tokenAddressInput').value.trim();
        if (web3.utils.isAddress(tokenAddress)) {
            const currentPrice = await fetchTokenPrice(tokenAddress);
            document.getElementById('proposalPriceInput').value = (currentPrice * multiplier).toFixed(18);
        }
    });
});

document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const mascotImage = document.querySelector('img[alt="Bondage Mascot"]');
    if (mascotImage.src.includes('bondageMascotDark.png')) {
        mascotImage.src = 'bondageMascot2.png'; // Replace with light mode image
        this.src = 'sun-icon.png'; // Replace with sun icon
    } else {
        mascotImage.src = 'bondageMascotDark.png'; // Replace with dark mode image
        this.src = 'moon-icon.png'; // Replace with moon icon
    }
});

// Approval button event listener
document.getElementById('approveButton').addEventListener('click', async () => {
    const tokenAddress = document.getElementById('tokenAddressInput').value.trim();
    const tokenContract = new web3.eth.Contract(bTokenABI, tokenAddress);
    const depositAmount = document.getElementById('depositAmount').value;
    const tokenDecimals = await tokenContract.methods.decimals().call();
    const amountInTokenUnit = web3.utils.toBN(depositAmount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(tokenDecimals)));

    try {
        const userAddress = (await web3.eth.getAccounts())[0];
        await tokenContract.methods.approve(bondageFinanceContract._address, amountInTokenUnit.toString()).send({ from: userAddress });
        alert('Approval successful');
    } catch (error) {
        console.error(error);
        alert('Error during approval');
    }
});

document.getElementById('depositAmount').addEventListener('input', async function() {
    const depositAmount = this.value.trim();
    const tokenAddress = document.getElementById('tokenAddressInput').value.trim();

    // Deposit button reference
    const depositBtn = document.getElementById('depositBtn');
    
    if (!depositAmount || !web3.utils.isAddress(tokenAddress)) {
        document.getElementById('approveButton').style.display = 'none';
        depositBtn.disabled = false; // Enable deposit button if there's no deposit amount or invalid address
        return;
    }

    const tokenContract = new web3.eth.Contract(bTokenABI, tokenAddress);
    const tokenDecimals = await tokenContract.methods.decimals().call();
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];
    
    const depositAmountInWei = web3.utils.toBN(depositAmount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(tokenDecimals)));
    const currentAllowance = await tokenContract.methods.allowance(userAddress, bondageFinanceContract._address).call();

    const approveButton = document.getElementById('approveButton');
    if (web3.utils.toBN(currentAllowance).lt(depositAmountInWei)) {
        approveButton.style.display = 'block';
        approveButton.disabled = false;
        depositBtn.disabled = true; // Disable deposit button if approval is needed
    } else {
        approveButton.style.display = 'none';
        depositBtn.disabled = false; // Enable deposit button if no approval is needed
    }
});

async function updatePageData() {
    const tokenAddress = document.getElementById('tokenAddressInput').value.trim();

    if (!web3.utils.isAddress(tokenAddress)) {
        return; // Exit if the token address is not valid
    }

    try {
        const userAddress = (await web3.eth.getAccounts())[0];
        const tokenContract = new web3.eth.Contract(bTokenABI, tokenAddress);

        // Update User Approved Amount
        const approvedAmount = await tokenContract.methods.allowance(userAddress, bondageFinanceContract._address).call();
        document.getElementById('approvedAmount').innerText = `Approved Amount: ${web3.utils.fromWei(approvedAmount, 'ether')}`;

        // Update Pool Information
        const pool = await bondageFinanceContract.methods.pools(tokenAddress).call();
        const formattedPoolDetails = await formatPoolDetails(pool, await tokenContract.methods.name().call(), tokenAddress);
        document.getElementById('poolDetails').innerHTML = formattedPoolDetails;

        // Update Button States
        const depositAmountInput = document.getElementById('depositAmount').value;
        const depositAmount = depositAmountInput ? web3.utils.toWei(depositAmountInput, 'ether') : '0';
        const isApprovedForDeposit = new web3.utils.BN(approvedAmount).gte(new web3.utils.BN(depositAmount));

        document.getElementById('depositBtn').disabled = !isApprovedForDeposit || pool.happyEnding;
        document.getElementById('withdrawBtn').disabled = !pool.happyEnding;
        document.getElementById('swapBtn').disabled = parseFloat(approvedAmount) === 0 || pool.happyEnding;
        // Add more button state updates as needed

    } catch (error) {
        console.error('Error updating page data:', error);
        // Optionally handle errors, e.g., by displaying an error message
    }
}

// Periodically call the update function
setInterval(updatePageData, 5000); // Update every 5 seconds
