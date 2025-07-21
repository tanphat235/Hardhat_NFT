const { deployments, ethers } = require("hardhat");
let {networkConfig} = require("../helper-hardhat-config");

// Copilot fixed
const MockLinkToken = require("../artifacts/@chainlink/contracts/src/v0.8/functions/tests/v1_X/testhelpers/MockLinkToken.sol/MockLinkToken.json");
const { resolve } = require("path");

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
}) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();

    let LinkTokenAddress, VRFCoordinatorAddress;
    if (chainId == "31337") {
        let MockLinkTokenDeployment = await deployments.get("MockLinkToken");
        LinkTokenAddress = MockLinkTokenDeployment.address;

        let VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock");
        VRFCoordinatorAddress = VRFCoordinatorMock.address;
    }
    else {
        LinkTokenAddress = networkConfig[chainId]["linkToken"];
        VRFCoordinatorAddress = networkConfig[chainId]["vrfCoordinator"];
    }

    const keyHash = networkConfig[chainId]["keyHash"]; // Default keyHash for Sepolia
    const fee = networkConfig[chainId]["fee"]; // Default fee for Sepolia

    let args = [VRFCoordinatorAddress, LinkTokenAddress, keyHash, fee];

    log("----------------------------------------------------");
    const randomSVG = await deploy("RandomSVG", {
        from: deployer,
        args: args,
        log: true,
    });
    log(`RandomSVG deployed at ${randomSVG.address} on chain ${chainId}`);
    log (`Verify with: \n npx hardhat verify --network ${networkConfig[chainId]["name"]} ${args.toString().replace(/,/g, " ")}`);

    // fund with LINK token
    if (chainId == "31337") {
        const linkTokenContract = await ethers.getContractAt(
            MockLinkToken.abi,
            LinkTokenAddress
        );
        let balance = await linkTokenContract.balanceOf(deployer);
        if (balance < BigInt(fee)) {
            await linkTokenContract.setBalance(deployer, ethers.parseEther("10"));
        }
    }

    const linkTokenContract = await ethers.getContractAt("LinkToken", LinkTokenAddress);
    const accounts = await ethers.getSigners();
    const signer = accounts[0];
    const linkToken = new ethers.Contract(LinkTokenAddress, linkTokenContract.interface, signer);

    let fund_tx = await linkToken.transfer(randomSVG.address, fee);
    await fund_tx.wait(1);

    // create a random SVG NFT
    const randomSVGContract = await ethers.getContractAt("RandomSVG", randomSVG.address);
    const randomSVGContractWithSigner = new ethers.Contract(randomSVG.address, randomSVGContract.interface, signer);
    let create_tx = await randomSVGContractWithSigner.create({gaslimit: 300000});
    let receipt = await create_tx.wait(1);

    // Copilot fixed
    const iface = randomSVGContract.interface;
    let requestedEvent;
    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log);
            if (parsed.name === "requestedRandomSVG") {
                requestedEvent = parsed;
                break;
            }
        } catch (e) {
            pass
        }
    }
    if (!requestedEvent) {
        throw new Error("requestedRandomSVG event not found");
    }
    const tokenId = requestedEvent.args.tokenId;
    const requestId = requestedEvent.args.requestId;
    // Copilot fixed

    log(`Your NFT is created! Token number: ${tokenId.toString()}`);
    log('Let wait for the Chainlink node to respond with the random number...');
    if (chainId != "31337" && process.env.ETHERSCAN_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 180000)); // wait for 180 seconds
        log("Now let's finish the mint!");
        let finish_tx = await randomSVGContractWithSigner.finishMint(tokenId, {gasLimit: 2000000});
        await finish_tx.wait(1); // 1 block confirmation
        log(`You can view your tokenURI here: ${await randomSVGContractWithSigner.tokenURI(tokenId)}`);
    } else {
        const VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock");
        vrfCoordinatorMock = await ethers.getContractAt("VRFCoordinatorMock", VRFCoordinatorMock.address, signer);
        let vrf_tx = await vrfCoordinatorMock.callBackWithRandomness(
            requestId, // requestId
            777777, // random number
            randomSVG.address);
        await vrf_tx.wait(1);
        log("Now let's finish the mint!");
        let finish_tx = await randomSVGContractWithSigner.finishMint(tokenId, {gasLimit: 2000000});
        await finish_tx.wait(1);
        log(`You can view your tokenURI here: ${await randomSVGContractWithSigner.tokenURI(tokenId)}`);
    }
}

module.exports.tags = ["all", "rsvg"];