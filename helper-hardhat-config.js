const networkConfig = {
    // Goerli Network chainId
    5: {
        name: 'goerli',
        ethUsdPriceFeedAddress: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    },
};

const developmentChains = [31337, 'hardhat', 'localhost'];

module.exports = {
    networkConfig,
    developmentChains,
};
