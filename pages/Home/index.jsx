import {useEffect, useReducer} from 'react';

import AirDropper from './containers/AirDropper';
import Jumbotron from './containers/Jumbotron';
import NotSupported from './containers/NotSupported';
import Stepper from './containers/Stepper';

import ConnectionIndicator from '../../components/ConnectionIndicator';

import useWindowDimensions from '../../hooks/useWindowDimensions';
import {styles} from '../../styles/Home.tailwind';
import Logger from './containers/Logger';

export default function Home() {
  const [supported, toggleSupported] = useReducer(s => !s, true);
  const {width} = useWindowDimensions();

  useEffect(() => {
    if (width === 0) return;

    if (width < 1024 && supported) {
      toggleSupported();
    }

    if (width > 1024 && !supported) {
      toggleSupported();
    }
  }, [width, supported]);

  return (
    <div className={styles.container}>
      <div className={styles.mintContainer}>
        <Jumbotron {...{supported}} />
        {supported ? <Stepper /> : <NotSupported />}
        <AirDropper />
        <ConnectionIndicator />
      </div>
    </div>
  );
}
