import {useContext} from 'react';
import {SolanaContext} from '../context/solana';

export default function Home() {
  const {connected, provider, loading, connectWallet, disconnectWallet} = useContext(SolanaContext);

  const handleClick = () => {
    !connected ? connectWallet() : disconnectWallet();
  };

  console.log(loading, provider, connected);

  return (
    <>
      {connected ? (
        <p>
          <strong>Public Key:</strong> {provider.publicKey.toString()}
        </p>
      ) : (
        <p></p>
      )}

      <button disabled={loading} onClick={handleClick}>
        {!connected ? 'Connect Wallet' : 'Disconnect Wallet'}
      </button>
    </>
  );
}
