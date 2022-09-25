const { getNamedAccounts, ethers } = require('hardhat');

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract('FundMe', deployer);
    console.log('Deploying...');
    const tsResponse = await fundMe.fund({
        value: ethers.utils.parseEther('0.1'),
    });
    await tsResponse.wait(1);
    console.log('Funded!');
};

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
