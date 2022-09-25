const { network } = require('hardhat');
const {
    networkConfig,
    developmentChains,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get('MockV3Aggregator');
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[chainId]['ethUsdPriceFeedAddress'];
    }

    const args = [ethUsdPriceFeedAddress];
    const fundeMe = await deploy('FundMe', {
        from: deployer,
        args,
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name)) {
        verify(fundeMe.address, args);
    }
    console.log('--------------');
};

module.exports.tags = ['all', 'fundme'];
