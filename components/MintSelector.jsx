import {useContext} from 'react';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/MintSelector.tailwind';
import {RiCoinsFill} from 'react-icons/ri';

export default function MintSelector() {
  const {connected, loading, initialMintCoins, mintMoreCoins, isCoinCreated, supplyCapped, requestedInitialMintAmount} =
    useContext(SolanaContext);

  if (!connected) return null;
  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>Mint</div>
        <div className={styles.subTitle}>
          {isCoinCreated ? 'Mints 100 more new tokens' : 'Mints 1,000,000 new tokens'}
        </div>
      </div>

      {isCoinCreated ? (
        <button
          className={`${styles.button} ${styles.buttonHovered}`}
          disabled={loading || supplyCapped}
          onClick={mintMoreCoins}>
          <RiCoinsFill size={39} />
        </button>
      ) : (
        <button className={`${styles.button} ${styles.buttonHovered}`} disabled={loading} onClick={initialMintCoins}>
          <RiCoinsFill size={39} />
        </button>
      )}
    </div>
  );
}
