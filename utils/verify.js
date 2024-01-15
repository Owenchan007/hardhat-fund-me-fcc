const { run } = require("hardhat")
const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    // 这里其实只是把控制台的命令脚本化了，run是hardhat使用控制台的脚本命令
    // 控制台里面要传两个参数进去，一个是合约布置的地址，一个是初始化构造参数
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        // 这里的toLowerCase()是把字符串全部转换成小写
        // 如果传回来的信息中包含了"already verified"，那么打印"Already Verified!"
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
