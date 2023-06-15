import * as envs from './envs';

export interface IEnvConfig {
  NAME?: string,
  TOKEN_ADDRESS: {
    WNATIVE: string;
    USDT: string;
    USDC: string;
    BUSD: string;
  },
  DEX_CONTRACT: {
    FACTORY: string;
    ROUTER: string;
  },
  NETWORK_PROVIDER: {
    URL_RPC: string;
    URL_SCAN: string;
  },
}

let envConfig: IEnvConfig = undefined;
export function configEnv(): IEnvConfig {
  if (envConfig) {
    return envConfig;
  }
  const envName = process.env.NODE_ENV || 'bscTestnet';
  const currentConfig = (envs)[envName];
  return {
    ...currentConfig,
    NAME: envName
  }
};

