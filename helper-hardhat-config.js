// 这里是用键值对的形式把网络ID和名称喂价地址对应起来
// 键值对有两种写法
/* ------01
const myObject = {
    key1: ["value1", "value2", "value3"],
    key2: ["value4", "value5"],
    key3: ["value6"]
  };
*/

/* ------02
const myObject = {
  key1: { value1: true, value2: false },
  key2: { value3: 42, value4: "hello" }
};
*/

const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
}

const developmentChains = ["hardhat", "localhost"]

// 这里的意思是将该文件中的networkConfig函数导出成一个对外部可访问调用的模组，在别的文件导入之后可以通过.出来使用该函数
module.exports = {
    networkConfig,
    developmentChains,
}
