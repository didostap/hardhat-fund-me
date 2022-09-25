const { network } = require('hardhat');
const { developmentChains } = require('../helper-hardhat-config');

const DECIMALS = 8;
const INITIAL_ANSWER = 2000_0000_00000;

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        console.log('Local chain detected!');
        await deploy('MockV3Aggregator', {
            contract: 'MockV3Aggregator',
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
    }
    console.log('---------------');
};

module.exports.tags = ['all', 'mocks'];
