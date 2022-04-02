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
};

export const SolanaContext = createContext(initial);

export const SolanaProvider = ({children}) => {
  const value = ProviderUtils();

  return <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>;
};
