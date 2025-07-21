const networkConfig = {
    31337: {
        name: "localhost",
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // Default keyHash for localhost
        fee: "100000000000000000" // Default fee for localhost
    },
    1: {
        name: "mainnet"
    },
    4: {
        name: "rinkeby"
    },
    11155111: {
        name: "sepolia",
        linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625", //https://docs.chain.link/vrf/v2/subscription/supported-networks
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // Default keyHash for Sepolia
        fee: "100000000000000000" // Default fee for Sepolia
    
    },
    137: {
        name: "polygon",
        linkToken: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1", // Polygon's LINK token address
        vrfCoordinator: "0xec0Ed46f36576541C75739E915ADbCb3DE24bD77", // Polygon's VRF Coordinator address
        keyHash: "0x192234a5cda4cc07c0b66dfbcfbb785341cc790edc50032e842667dbb506cada", // Default keyHash for Polygon
        fee: "100000000000000" // Default fee for Polygon 0.0001
    }
}

module.exports = {
    networkConfig
}