# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

--------------------------------------------------------------
Create project by npx hardhat and do the instruction


---- CODE ---
import packgage
- yarn add @openzeppelin/contracts (to use ERC721 token NFT)
- yarn add base64-sol (to convert SVG to json base64)
- yarn add hardhat-deploy (use hardhat for outside like run in production)
- yarn add --dev hardhat-deploy (just for dev)
- yarn add global hardhat-shorthand
- yarn add fs (use fs for reading svg file)
- yarn add @nomicfoundation/hardhat-ethers (to import hardhat ethers)
- yarn add ethers (to working with ethers)
- yarn add dotenv
- yarn add --dev @nomiclabs/hardhat-etherscan
- yarn add @chainlink/contracts

create SVG and convert to URI data - the type to deploy to blockchain (svgToImageURI)
Deploy SVGNFT.sol to blockchain
- using Hardhat API function to get deployer and chainID and smart contract deployed
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    log("----------------------------------------------------")
    const SVGNFT = await deploy("SVGNFT", {
        from: deployer,
        log: true,
    })

Get contract and signed by the first account of hardhat
    const svgNFT = await ethers.getContractAt("SVGNFT", SVGNFT.address);

    const accounts = await ethers.getSigners();
    const signer = accounts[0];

Get the instance of smart contract to create a NFT 
    let transactionResponse = await svgNFT.create(svg);
    let receipt = await transactionResponse.wait(1);

when run "npx hardhat deploy". it will run all file in this folder

Use Chainlink VRF to generate random number. Because the random method onchain need to be deterministic. nobody can cheat on that. Using this for game blockchain like gamble, lottery, NFT mining...

function fullfillRandomness(bytes32 requestId, uint256 randomNumber) internal override
internal is only VRF can call this function. and override will be override this function to said this is the real function eventhough anyone create another function similar like that.

Learn how to mapping variables type

Mock LinkToken and VRF to test in local network