const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

const DECIMALS = "8"
const INITIAL_PRICE = "200000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks deployed!")
        log("-------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"] // 这里是给该部署文件打上标签，一个是all（运行所有脚本时会运行），一个是mocks（只有运行带该标签的脚本）
