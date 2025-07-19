const fstat = require("fs");
let {networkConfig} = require("../helper-hardhat-config");

module.exports = async({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    log("----------------------------------------------------")
    const SVGNFT = await deploy("SVGNFT", {
        from: deployer,
        log: true,
    })
    log(`SVGNFT deployed at ${SVGNFT.address} on chain ${chainId}`);
    let filepath = "./img/demon.svg";
    let svg = fstat.readFileSync(filepath, { encoding: "utf8" });

    const svgNFT = await ethers.getContractAt("SVGNFT", SVGNFT.address);

    const accounts = await ethers.getSigners();
    const signer = accounts[0];
    
    const networkName = networkConfig[chainId]["name"];
    log('Verify with: \n npx hardhat verify --network ' + networkName + ' ' + SVGNFT.address);

    let transactionResponse = await svgNFT.create(svg);
    let receipt = await transactionResponse.wait(1);
    log('Your NFT is created!');
    log(`You can view your tokenURI here: ${await svgNFT.tokenURI(0)}`);
}