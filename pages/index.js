import {useContext} from 'react';
import {SolanaContext} from '../context/solana';

export default function Home() {
  const {
    connected,
    provider,
    loading,
    connectWallet,
    disconnectWallet,
    airdropTestSOL,
    requestedSOLAmount,
    setRequestedSOLAmount,
    initialMintCoins,
    mintMoreCoins,
    isCoinCreated,
    supplyCapped,
  } = useContext(SolanaContext);

  const handleConnectClick = () => {
    !connected ? connectWallet() : disconnectWallet();
  };

  const onSOLAmountChange = event => {
    const number = event.target.value;

    setRequestedSOLAmount(number);
  };

  return (
    <>
      {connected ? (
        <p>
          <strong>Public Key:</strong> {provider.publicKey.toString()}
        </p>
      ) : (
        <></>
      )}

      {connected ? (
        <>
          <p>Airdrop SOL into your wallet</p>
          <p>
            <input type='number' value={requestedSOLAmount} onChange={onSOLAmountChange} />
            <button disabled={loading} onClick={airdropTestSOL}>
              AirDrop SOL
            </button>
          </p>
        </>
      ) : (
        <></>
      )}

      {connected ? (
        <p>
          Create your own token
          {isCoinCreated ? (
            <button disabled={loading || supplyCapped} onClick={mintMoreCoins}>
              Mint 100 more
            </button>
          ) : (
            <button disabled={loading} onClick={initialMintCoins}>
              Initial Mint
            </button>
          )}
        </p>
      ) : (
        <></>
      )}

      <button disabled={loading} onClick={handleConnectClick}>
        {!connected ? 'Connect Wallet' : 'Disconnect Wallet'}
      </button>
    </>
  );
}
