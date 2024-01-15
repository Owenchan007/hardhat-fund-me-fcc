const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) // 如果我们的hardhad运行时不包含我们定义的网络名称，则跳过下面这段代码
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          // const sendValue = ethers.parseEther("1.0") // 这个就相当于是const sendValue = "1000000000000000000"   1 ETH
          const sendValue = ethers.parseEther("1")
          beforeEach(async function () {
              // 获取我们定义在hardhat配置中的账户签名
              // const accounts = await ethers.getSigner()
              // const accountZero = accounts[0]

              deployer = (await getNamedAccounts()).deployer // 获取hardhat中默认的账户
              await deployments.fixture(["all"]) // 部署所有../../deploy中的合约
              fundMe = await ethers.getContract("FundMe", deployer) // 使用deployer账户布置fundMe合约，写在hardhat配置文件中了，默认的第0个账户
              // 获取MockV3Aggregator合约的最新状态
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.s_priceFeed()
                  assert.equal(response, mockV3Aggregator.target) // 在ethers v6.0以上的版本中address被替换成了target
              })
          })

          // describe 语句块用于验证一个函数
          // it 语句快用于针对该函数内部有可能出现问题的几个地方进行具体测试
          // 测试fund函数
          describe("fund", async function () {
              // 测试发送以太坊函数
              it("Fails if you don't send enough ETH", async function () {
                  // 预期fundMe.fund()函数会进行回滚，并返回"You need to spend more ETH!"语句（和合约里写的一样）
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              // 测试更新金额函数
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.s_addressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              // 测试发送金额地址函数
              it("adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.s_funders(0)
                  assert.equal(funder, deployer)
              })
          })
          // 测试withdraw函数
          describe("withdraw", async function () {
              // 测试withdraw之前先往合约里注入一些ETH
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("withDraw ETH from a single founder", async function () {
                  // 测试三部曲 1. arrange（安排） 2. act（运行） 3. assert（断言）
                  // -----------------ARRANGE-------------------
                  // 首先获取合约中的金额
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  // 再获取部署者的金额
                  const startDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )
                  // -------------------ACT---------------------
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // -----------------ASSERT-------------------
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (startingFundMeBalance + startDeployerBalance).toString(), // 这里是调取的区块链上的数据，是一个BigNumber，因此用add函数
                      (endingDeployerBalance + gasCost).toString() // 在ether6.0以后直接用加号就行
                  )
              })

              it("allows us to withdraw with multiple funders", async function () {
                  // -----------------ARRANGE-------------------
                  const accounts = await ethers.getSigners() // 这里是hardhat中的函数，自动把默认的20？个地址的签名信息+私钥传给变量了，随后才可以通过这些信息连接钱包
                  // 连接5个账户到fundMe合约上
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      // 发送1个ETH给fundMe合约
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  // -------------------ACT---------------------
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // -----------------ASSERT-------------------
                  // 1.确认提取完最后的金额是0
                  assert.equal(endingFundMeBalance, 0)
                  // 2. 确认提取的金额和最后得到金额加上gas损耗保持一致
                  assert.equal(
                      (startingFundMeBalance + startDeployerBalance).toString(), // 这里是调取的区块链上的数据，是一个BigNumber，因此用add函数
                      (endingDeployerBalance + gasCost).toString() // 在ether6.0以后直接用加号就行
                  )
                  // 3. 确认funders可以重置
                  await expect(fundMe.s_funders(0)).to.be.reverted // 期望调用fundMe.funders(0)之后可以报出异常回滚

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ), // 这里能用address是因为我们调用的是hardhad的ethersSign库，里面有address函数
                          0
                      )
                  }
              })
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  // 这里hardhat给了三种revert判定方法
                  // 1. reverted  --只判断发生回滚
                  // 2. revertedWith  --判断发生回滚中是否包含系统给的错误词
                  // 3. revertedWithCustomError   --判断发生回滚中是否包含自己定义的关键词
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })

              it("cheaperWithdraw testing...", async function () {
                  // -----------------ARRANGE-------------------
                  const accounts = await ethers.getSigners() // 这里是hardhat中的函数，自动把默认的20？个地址的签名信息+私钥传给变量了，随后才可以通过这些信息连接钱包
                  // 连接5个账户到fundMe合约上
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      // 发送1个ETH给fundMe合约
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.target)
                  const startDeployerBalance = await ethers.provider.getBalance(
                      deployer
                  )

                  // -------------------ACT---------------------
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.target
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  // -----------------ASSERT-------------------
                  // 1.确认提取完最后的金额是0
                  assert.equal(endingFundMeBalance, 0)
                  // 2. 确认提取的金额和最后得到金额加上gas损耗保持一致
                  assert.equal(
                      (startingFundMeBalance + startDeployerBalance).toString(), // 这里是调取的区块链上的数据，是一个BigNumber，因此用add函数
                      (endingDeployerBalance + gasCost).toString() // 在ether6.0以后直接用加号就行
                  )
                  // 3. 确认funders可以重置
                  await expect(fundMe.s_funders(0)).to.be.reverted // 期望调用fundMe.funders(0)之后可以报出异常回滚

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.s_addressToAmountFunded(
                              accounts[i].address
                          ), // 这里能用address是因为我们调用的是hardhad的ethersSign库，里面有address函数
                          0
                      )
                  }
              })
          })
      })
