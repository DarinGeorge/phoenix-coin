import Link from 'next/link';
import {useState, useContext} from 'react';
import {IoIosArrowBack} from 'react-icons/io';

import CapSelector from '../../../components/CapSelector';
import MintSelector from '../../../components/MintSelector';
import TransferSelector from '../../../components/TransferSelector';
import {SolanaContext} from '../../../context/solana';

function BackButton({onClick}) {
  return (
    <button onClick={onClick} className='flex flex-row items-center justify-start pl-3 pb-4'>
      <div className='pt-[1px]'>
        <IoIosArrowBack size={14} />
      </div>
      <div className='text-xs'>Back to options</div>
    </button>
  );
}

const statuses = ['mint', 'minted', 'transfer', 'capped'];

export default function Stepper() {
  const {connected, isCoinCreated, supplyCapped, createdCoinAddress} = useContext(SolanaContext);
  const [status, setStatus] = useState('mint');

  const onStatusChange = newStatus => {
    if (!statuses.includes(newStatus)) return;
    setStatus(newStatus);
  };

  const onBackPress = () => {
    if (!isCoinCreated) return;
    setStatus('minted');
  };

  const renderComponent = () => {
    switch (status) {
      case 'mint': {
        return (
          <>
            {isCoinCreated && <BackButton onClick={onBackPress} />}
            <MintSelector expanded onClick={() => onStatusChange('minted')} />
          </>
        );
      }

      case 'minted': {
        return (
          <>
            <MintSelector onClick={() => onStatusChange('mint')} />
            <TransferSelector onClick={() => onStatusChange('transfer')} />
            <CapSelector onClick={() => onStatusChange('capped')} />
          </>
        );
      }

      case 'transfer': {
        return (
          <>
            {isCoinCreated && <BackButton onClick={onBackPress} />}
            <TransferSelector expanded onClick={() => onStatusChange('minted')} />
          </>
        );
      }

      case 'capped': {
        return (
          <>
            <CapSelector capped />
          </>
        );
      }

      default: {
        return null;
      }
    }
  };

  if (!connected) return null;
  return <>{renderComponent()}</>;
}
