const { assert, expect } = require('chai');
const { deployments, ethers, getNamedAccounts, network } = require('hardhat');
const { developmentChains } = require('../../helper-hardhat-config');

developmentChains.includes(network.name)
    ? describe('FundMe', async () => {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther('1');

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(['all']);
              fundMe = await ethers.getContract('FundMe', deployer);
              mockV3Aggregator = await ethers.getContract(
                  'MockV3Aggregator',
                  deployer
              );
          });

          describe('constructor', () => {
              it('sets the aggregator address correctly', async () => {
                  const priceFeed = await fundMe.getPriceFeed();
                  assert.equal(priceFeed, mockV3Aggregator.address);
              });
          });

          describe('fund', () => {
              it('fails if you dont send enough ETH', async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      'You need to spend more ETH!'
                  );
              });

              it('update the amount funded data structure', async () => {
                  await fundMe.fund({ value: sendValue });

                  const sendedAmount = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(`${sendedAmount}`, `${sendValue}`);
              });

              if (
                  ('adds funder to array of funders',
                  async () => {
                      await fundMe.fund({ value: sendValue });
                      const funder = await fundMe.getFunder(0);
                      assert.equal(funder, deployer.address);
                  })
              );
          });

          describe('withdraw', () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              it('withdraw ETH from a single founder', async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  const tsResponse = await fundMe.withdraw();
                  const tsReceipt = await tsResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = tsReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(0, endingFundMeBalance);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it('allows to withdraw with different accounts', async () => {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  console.log('end');
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const tsResponse = await fundMe.withdraw();
                  const tsReceipt = await tsResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = tsReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(0, endingFundMeBalance);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  accounts.forEach(async (account) => {
                      const withdrawValue = await fundMe.addressToAmountFunded(
                          account.address
                      );
                      assert.equal(0, withdrawValue);
                  });
              });

              it('only allows owner to withdraw', async () => {
                  const accounts = await ethers.getSigners();
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  );
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(
                      fundMeConnectedContract,
                      'FundMe__NotOwner'
                  );
              });
          });

          describe('cheaperWithdraw', () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              it('withdraw ETH from a single founder', async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  const tsResponse = await fundMe.cheaperWithdraw();
                  const tsReceipt = await tsResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = tsReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(0, endingFundMeBalance);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it('allows to cheaperWithdraw with different accounts', async () => {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }
                  console.log('end');
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const tsResponse = await fundMe.cheaperWithdraw();
                  const tsReceipt = await tsResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = tsReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(0, endingFundMeBalance);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  accounts.forEach(async (account) => {
                      const withdrawValue = await fundMe.addressToAmountFunded(
                          account.address
                      );
                      assert.equal(0, withdrawValue);
                  });
              });

              it('only allows owner to cheaperWithdraw', async () => {
                  const accounts = await ethers.getSigners();
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  );
                  await expect(
                      fundMeConnectedContract.cheaperWithdraw()
                  ).to.be.revertedWithCustomError(
                      fundMeConnectedContract,
                      'FundMe__NotOwner'
                  );
              });
          });
      })
    : describe.skip;
