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
  } = useContext(SolanaContext);

  const handleClick = () => {
    !connected ? connectWallet() : disconnectWallet();
  };

  const onSOLAmountChange = event => {
    const number = event.target.value;

    setRequestedSOLAmount(number);
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
          <button disabled={loading} onClick={initialMintCoins}>
            Initial Mint
          </button>
        </p>
      ) : (
        <></>
      )}

      <button disabled={loading} onClick={handleClick}>
        {!connected ? 'Connect Wallet' : 'Disconnect Wallet'}
      </button>
    </>
  );
}
