import {useContext} from 'react';
import {AiFillStop} from 'react-icons/ai';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/CapSelector.tailwind';

export default function CapSelector() {
  const {connected, loading, mintMoreCoins, isCoinCreated, supplyCapped} = useContext(SolanaContext);

  if (!connected || !isCoinCreated) return null;
  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>Cap Supply</div>
        <div className={styles.subTitle}>Prevent further minting, forever</div>
      </div>

      <button className={styles.button} disabled={loading || supplyCapped} onClick={mintMoreCoins}>
        <AiFillStop size={39} />
      </button>
    </div>
  );
}
