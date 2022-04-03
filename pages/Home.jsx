import {useEffect, useReducer} from 'react';
import AirDropper from '../components/AirDropper';
import CapSelector from '../components/CapSelector';
import ConnectionIndicator from '../components/ConnectionIndicator';
import Jumbotron from '../components/Jumbotron';
import MintSelector from '../components/MintSelector';
import NotSupported from '../components/NotSupported';
import TransferSelector from '../components/TransferSelector';
import useWindowDimensions from '../hooks/useWindowDimensions';
import {styles} from '../styles/Home.tailwind';

export default function Home() {
  const [supported, toggleSupported] = useReducer(s => !s, true);
  const {width} = useWindowDimensions();

  useEffect(() => {
    if (width < 1024 && supported) {
      supported && toggleSupported();
    }
  }, [width, supported]);

  return (
    <div className={styles.container}>
      <div className={styles.mintContainer}>
        <Jumbotron {...{supported}} />
        {supported ? (
          <>
            <MintSelector />
            <TransferSelector />
            <CapSelector />
          </>
        ) : (
          <NotSupported />
        )}
        <AirDropper />
        <ConnectionIndicator />
      </div>
    </div>
  );
}
