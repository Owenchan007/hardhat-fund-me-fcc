# 开始新的项目！

1. mkdir 新建一个文件夹
2. cd 进入文件夹，然后 code . 打开窗口
3. yarn add --dev hardhat，安装 hardhat 框架
4. yarn hardhat，开始
5. yarn add --dev @nomiclabs/hardhat-solhint 安装 solhint
6. yarn solhint --init 创建 solhint 配置文件
7. 在 solhint 配置文件里面替换以下代码

```
{
  "extends": "solhint:recommended",
  "plugins": [],
  "rules": {
    "avoid-suicide": "error",
    "avoid-sha3": "warn"
  }
}
```

8. 创建.prettierrc 文件自定义格式化代码

```
{
    "tabWidth": 4,
    "useTabs": false,
    "semi": false,
    "singleQuote": false
}
```

9. 添加 hardhat deploy 包 yarn add --dev hardhat-deploy
