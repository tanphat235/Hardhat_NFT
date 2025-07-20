require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

// Print the list of accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts) {
    console.log(account.address)
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const MNEMONIC = process.env.MNEMONIC;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      name: "sepolia",
      url: SEPOLIA_RPC_URL,
      accounts: {
        mnemonic: MNEMONIC
      }, 
      chainId: 11155111, // Sepolia's chain ID
      saveDeployments: true, // Save deployments to the deployments folder
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY // Replace with your Etherscan API key
  },
  solidity: "0.8.28",
  namedAccounts: {
    deployer: {
      default: 0, // Here, 0 is the index of the account in the local Hardhat network
    }
  }
};
