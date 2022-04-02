import {useContext} from 'react';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/TransferSelector.tailwind';
import {CgSwap} from 'react-icons/cg';

export default function TransferSelector() {
  const {connected, loading, mintMoreCoins, isCoinCreated, supplyCapped} = useContext(SolanaContext);

  if (!connected || !isCoinCreated) return null;
  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>Transfer</div>
        <div className={styles.subTitle}>Transfer 10 tokens to others</div>
      </div>

      <button className={styles.button} disabled={loading || supplyCapped} onClick={mintMoreCoins}>
        <CgSwap size={39} />
      </button>
    </div>
  );
}
