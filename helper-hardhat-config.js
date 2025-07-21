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
}

module.exports = {
    networkConfig
}