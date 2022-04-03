import {AiFillLock} from 'react-icons/ai';

export default function NotSupported() {
  return (
    <div className='flex flex-row items-center px-5 pt-5'>
      <div className='text-yellow-400'>
        <AiFillLock />
      </div>
      <div className='ml-2 text-sm text-gray-400'>
        Sorry! Web 3 browser extension providers are not available on your device yet.
      </div>
    </div>
  );
}
