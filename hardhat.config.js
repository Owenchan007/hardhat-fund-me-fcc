require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("@nomiclabs/hardhat-ethers")
// dotenv 包可以将我们创建的.env中的参数加载到另外的文件里调用
require("dotenv").config()
require("@nomicfoundation/hardhat-verify")
require("hardhat-gas-reporter")
require("solidity-coverage")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL // process是一个全局变量，process对象提供了与当前进程有关的信息和控制功能(有点像os)
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const CONINMARKETCAP_API_KEY = process.env.CONINMARKETCAP_API_KEY

// 设置全局代理
const { ProxyAgent, setGlobalDispatcher } = require("undici")
const proxyAgent = new ProxyAgent("http://127.0.0.1:7890") // change to yours
setGlobalDispatcher(proxyAgent)

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6, // 这里只是定义一个确认区块的默认数量，并不是每次操作都要等6个区块，需要在别的函数里调用
        },
    },

    // ----------------------------------------
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },

    // ----------------------------------------
    // solidity: "0.8.9", 一般我们会用到很多个版本的solidity，因此可以声明一个对象
    solidity: {
        compilers: [{ version: "0.8.9" }, { version: "0.6.6" }],
    },

    // ----------------------------------------
    gasReporter: {
        enabled: true,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        // coinmarketcap: CONINMARKETCAP_API_KEY,
        token: "MATIC",
    },

    // ----------------------------------------
    // 在这里声明了所使用的账户
    // deployer是默认第一个账户
    // user是默认第二个账户
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 1,
        },
    },
}
