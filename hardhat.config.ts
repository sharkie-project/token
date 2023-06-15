
import "./env-config";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { utils } from "ethers";
const { WALLET_DEPLOYER_PRIVATEKEY, SCAN_APIKEY } = process.env;
const hexWalletDeployerPrivateKey = `0x${WALLET_DEPLOYER_PRIVATEKEY}`.trim();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    hardhat: {
    },
    maticTestnet: {
      url: "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      gasPrice: 20_000_000_000,
      accounts: [hexWalletDeployerPrivateKey]
    },
    maticMainnet: {
      url: "https://matic-mainnet-full-rpc.bwarelabs.com/",
      chainId: 137,
      accounts: [hexWalletDeployerPrivateKey],
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s2.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [hexWalletDeployerPrivateKey]
    },
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [hexWalletDeployerPrivateKey]
    },
    baseTestnet: {
      url: "https://goerli.base.org/",
      chainId: 84531,
      gasPrice: 20000000000,
      accounts: [hexWalletDeployerPrivateKey],

    }
  },
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          metadata: {
            bytecodeHash: 'none',
          },
        },
      },
    ],
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  etherscan: {
    apiKey: SCAN_APIKEY,
    customChains: [
      {
        network: "baseTestnet",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }

      }
    ]
  },
};

export default config;
