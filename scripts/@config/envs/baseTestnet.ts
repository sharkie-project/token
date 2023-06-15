import { IEnvConfig } from '..';

const config: IEnvConfig = {
  TOKEN_ADDRESS: {
    WNATIVE: "".trim(),
    USDT: "".trim(),
    USDC: "".trim(),
    BUSD: "0x15ca7e1203F25e4a56D86faCB6c4715bbA52e795".trim(),
  },
  DEX_CONTRACT: {
    FACTORY: "0x1D25b9D81623a093ffc2b02E8da1d006b16F0AD8".trim(), // Dackie Testnet
    ROUTER: "0x29843613c7211D014F5Dd5718cF32BCD314914CB".trim(), // Dackie Testnet
  },
  NETWORK_PROVIDER: {
    URL_RPC: "https://goerli.base.org",
    URL_SCAN: "https://goerli.basescan.org"
  }
}

export default config;
