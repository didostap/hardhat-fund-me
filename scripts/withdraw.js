const { getNamedAccounts, ethers } = require('hardhat');

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract('FundMe', deployer);
    console.log('Funding...');
    const tsResponse = await fundMe.withdraw();
    await tsResponse.wait(1);
    console.log('Got it back!');
};

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
