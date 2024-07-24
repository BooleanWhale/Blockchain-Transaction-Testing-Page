import { ethers } from 'ethers';

export interface CurrencyConfig {
  name: string;
  symbol: string;
  provider: ethers.JsonRpcProvider;
  chainId: number;
  explorerUrl: string;
  rpcUrl: string;
}

export const config = {
  projectId: 'f9069c33af4d95ec6408040046120239', // ProjectID from your walletconnect account
  infuraKey: 'de0d3ed0cbe145ba960c1abd5d3a7411', // Key from your Infura account
  fetchBalancesInterval: 5000, // In milliseconds (reducing this will increase infura calls)
  currencies: [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: `https://mainnet.infura.io/v3/de0d3ed0cbe145ba960c1abd5d3a7411`,
      provider: new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/de0d3ed0cbe145ba960c1abd5d3a7411`),
      chainId: 1,
      explorerUrl: 'https://etherscan.io',
    },
    {
      name: 'XR Sepolia',
      symbol: 'tXR',
      rpcUrl: 'https://xr-sepolia-testnet.rpc.caldera.xyz/http',
      provider: new ethers.JsonRpcProvider('https://xr-sepolia-testnet.rpc.caldera.xyz/http'),
      chainId: 2730,
      explorerUrl: 'https://explorer.xrpl.org',
    },
  ] as CurrencyConfig[],
};