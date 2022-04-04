import {useContext} from 'react';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/TransferSelector.tailwind';
import {CgSwap} from 'react-icons/cg';

export default function TransferSelector({onClick, expanded}) {
  const {loading, transferCoins, supplyCapped, transferAddress, setTransferAddress} = useContext(SolanaContext);

  const onAddressChange = e => {
    setTransferAddress(e.target.value);
  };

  const handleClick = async () => {
    if (expanded) {
      await transferCoins().then(() => onClick());
    }

    onClick();
  };

  const disabledCondition = loading || supplyCapped ? styles.buttonDisabled : styles.buttonHovered;

  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>Transfer</div>

        {expanded && (
          <input
            type='text'
            placeholder='000...0000'
            className={styles.input}
            value={transferAddress}
            onChange={onAddressChange}
          />
        )}

        <div className={styles.subTitle}>Transfer 10 tokens to others.</div>
      </div>

      <button
        className={`${styles.button} ${disabledCondition}`}
        disabled={loading || supplyCapped}
        onClick={handleClick}>
        <CgSwap size={39} />
      </button>
    </div>
  );
}
