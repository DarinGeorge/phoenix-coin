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
    capSupply,
    transferCoins,
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
      <button disabled={loading} onClick={handleConnectClick}>
        {!connected ? 'Connect Wallet' : 'Disconnect Wallet'}
      </button>

      {connected ? (
        <>
          <p>
            <strong>Public Key:</strong> {provider.publicKey.toString()}
          </p>

          <p>Airdrop SOL into your wallet</p>
          <p>
            <input type='number' value={requestedSOLAmount} onChange={onSOLAmountChange} />
            <button disabled={loading} onClick={airdropTestSOL}>
              AirDrop SOL
            </button>
          </p>

          <p>
            Create your own token{' '}
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

          <p>
            Transfer Coins to Friends{' '}
            <button disabled={loading || supplyCapped} onClick={transferCoins}>
              Transfer 10 Coins
            </button>
          </p>

          <p>
            Cap Coin Supply{' '}
            <button disabled={loading || supplyCapped} onClick={capSupply}>
              Cap Supply
            </button>
          </p>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
