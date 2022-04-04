import {useContext} from 'react';
import {AiFillStop} from 'react-icons/ai';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/CapSelector.tailwind';
import Link from 'next/link';

export default function CapSelector({capped, onClick}) {
  const {loading, supplyCapped, capSupply, createdCoinAddress} = useContext(SolanaContext);

  const handleClick = async () => {
    if (capped) return;
    await capSupply().then(() => onClick());
  };

  return (
    <>
      {capped ? (
        <div className='px-5'>
          <div className='text-sm'>
            Your coins have been minted and no further supply can be processed, to name it submit a pull request here
            <br />
            <br />
            <Link href='https://github.com/solana-labs/token-list' passHref>
              <div className='cursor-pointer text-purple-600 hover:text-blue-600'>Solana Token List Github</div>
            </Link>
          </div>
          <br />
          <div className='text-xs text-gray-400 font-medium'>Token account address</div>
          <div className='text-md font-medium'>{createdCoinAddress}</div>
        </div>
      ) : (
        <div className={styles.wrapper}>
          <div>
            <div className={styles.title}>Cap Supply</div>
            <div className={styles.subTitle}>Prevent further minting, forever.</div>
          </div>

          <button className={styles.button} disabled={loading || supplyCapped} onClick={handleClick}>
            <AiFillStop size={39} />
          </button>
        </div>
      )}
    </>
  );
}
