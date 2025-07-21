module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId,
}) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = await getChainId();
    
    if (chainId == "31337") {
        //Copilot fixed
        log("Local network detected! Deploying Mocks...");
        const MockLinkToken = await deploy("MockLinkToken", {
            contract: "MockLinkToken", // tên contract đúng trong artifacts
            from: deployer,
            log: true,
        });
        //Copilot fixed
        const VRFCoordinatorMock = await deploy("VRFCoordinatorMock", {
            from: deployer,
            log: true,
            args: [MockLinkToken.address],
        });
        log("Mocks deployed!");
    }
}

module.exports.tags = ["all", "rsvg", "svg"];