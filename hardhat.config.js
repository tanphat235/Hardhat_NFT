require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");

// Print the list of accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()
  for (const account of accounts) {
    console.log(account.address)
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
    
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    // rinkeby: {}
  },
  solidity: "0.8.28",
  namedAccounts: {
    deployer: {
      default: 0, // Here, 0 is the index of the account in the local Hardhat network
    }
  }
};
