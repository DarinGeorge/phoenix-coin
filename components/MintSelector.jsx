import {useContext} from 'react';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/MintSelector.tailwind';
import {RiCoinsFill} from 'react-icons/ri';

export default function MintSelector({expanded, onClick}) {
  const {
    loading,
    initialMintCoins,
    mintMoreCoins,
    isCoinCreated,
    supplyCapped,
    requestedInitialMintAmount,
    setRequestedInitialMintAmount,
  } = useContext(SolanaContext);

  const onAmountChange = e => {
    setRequestedInitialMintAmount(e.target.value);
  };

  const handleClick = async () => {
    if (expanded) {
      if (isCoinCreated) await mintMoreCoins().then(() => onClick());

      await initialMintCoins().then(() => onClick());
    }

    onClick();
  };

  const disabledCondition = loading || supplyCapped ? styles.buttonDisabled : styles.buttonHovered;

  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.title}>{!isCoinCreated ? 'Mint' : 'Mint more'}</div>

        {expanded && (
          <input type='number' className={styles.input} value={requestedInitialMintAmount} onChange={onAmountChange} />
        )}

        <div className={styles.subTitle}>
          {isCoinCreated ? 'Mint more new tokens.' : `Initial mint of ${requestedInitialMintAmount} new tokens.`}
        </div>
      </div>

      {isCoinCreated ? (
        <button
          className={`${styles.button} ${disabledCondition}`}
          disabled={loading || supplyCapped}
          onClick={handleClick}>
          <RiCoinsFill size={39} />
        </button>
      ) : (
        <button className={`${styles.button} ${disabledCondition}`} disabled={loading} onClick={handleClick}>
          <RiCoinsFill size={39} />
        </button>
      )}
    </div>
  );
}
