// async function deployFunc() {
//     hre.getNamedAccounts()
//     hre.deployments()
// }
// module.exports.default = deployFunc
// 上面这个和下面这行差不多，下面这个叫匿名函数

const { network } = require("hardhat")

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
// }
// 这个又可以简写成下面这个，连hre都不用传进去了

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()
// 这里的花括号就代表了直接调用这个模组里的networkConfig函数，是个简写
// 等于 const helperConfig = require("../helper-hardhat-config")
//     const networkConfig = helperConfig.networkConfig

// getNamedAccounts和deployments是hardhat框架里自带的两个对象
// 下面这个模组导出之后就可以在别的地方直接使用这些定义的函数了
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId // 这里是获取的hardhad运行过程中的网络地址，具体是保存在hardhat.config.js这个文件里面

    // 如果chainId = xxx，则使用xxx地址
    // 如果chainId = yyy，则使用yyy地址
    // const etheUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"] // 这里是输入chainId然后读取名为ethUsdPriceFeed的内容
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // 这个是hardhat提供的deploy方法，基础参数有：from和args，from是布置该合约的地址
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // 放入喂价的地址
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1, // 如果没有单独指明，则默认为等待一个区块
    })
    // 如果部署的链没有包含hardhat或是localhost的字符，则运行验证程序（放到sepolia或是主网进行源代码上传）
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    log("----------------------------------------")
}

module.exports.tags = ["all", "fundme"]
