import {createContext} from 'react';
import ProviderUtils from './utils';

const initial = {
  provider: undefined,
  connected: false,
  loading: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  airdropTestSOL: async () => {},
  setRequestedSOLAmount: async () => {},
  initialMintCoins: async () => {},
  mintMoreCoins: async () => {},
  requestedInitialMintAmount: 0,
  setRequestedInitialMintAmount: () => {},
  isCoinCreated: false,
  supplyCapped: false,
  transferCoins: async () => {},
  capSupply: async () => {},
  supplyCapped: false,
};

export const SolanaContext = createContext(initial);

export const SolanaProvider = ({children}) => {
  const value = ProviderUtils();

  return <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>;
};
