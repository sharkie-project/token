import { IEnvConfig } from '..';

const config: IEnvConfig = {
  TOKEN_ADDRESS: {
    WNATIVE: "0x0dE8FCAE8421fc79B29adE9ffF97854a424Cad09".trim(),
    USDT: "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684".trim(),
    USDC: "0x302e8CD8bb32628364F918a3775F0E599BA5770C".trim(),
    BUSD: "0x13b123a205b607Daa99a9D8E21E92d05ad4dFB9F".trim(),
  },
  DEX_CONTRACT: {
    FACTORY: "0x6725F303b657a9451d8BA641348b6761A6CC7a17".trim(), // PancakeFactory
    ROUTER: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1".trim(), // pancake Testnet
  },
  NETWORK_PROVIDER: {
    URL_RPC: "https://data-seed-prebsc-1-s2.binance.org:8545",
    URL_SCAN: "https://testnet.bscscan.com"
  }
}

export default config;
