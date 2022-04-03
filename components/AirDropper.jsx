import {useContext} from 'react';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/AirDropper.tailwind';

export default function AirDropper() {
  const {connected, loading, airdropTestSOL, requestedSOLAmount, setRequestedSOLAmount} = useContext(SolanaContext);

  const onSOLAmountChange = direction => {
    if (direction === 'increment') {
      setRequestedSOLAmount(requestedSOLAmount + 1);
    }

    if (direction === 'decrement' && requestedSOLAmount !== 0) {
      setRequestedSOLAmount(requestedSOLAmount - 1);
    }
  };

  if (!connected) return null;
  return (
    <div className={styles.container}>
      <p className={styles.title}>Airdrop Solana</p>

      <div className={styles.actionBtnWrapper}>
        <button className={styles.indicator} onClick={() => onSOLAmountChange('decrement')}>
          -
        </button>
        <div className={styles.amount}>{requestedSOLAmount} SOL</div>
        <button className={styles.indicator} onClick={() => onSOLAmountChange('increment')}>
          +
        </button>
      </div>

      <button className={`${styles.button} ${styles.buttonHovered}`} disabled={loading} onClick={airdropTestSOL}>
        Request
      </button>
    </div>
  );
}
