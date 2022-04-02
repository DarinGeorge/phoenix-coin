import React from 'react';
import {useContext} from 'react';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/ConnectionIndicator.tailwind';

export default function ConnectionIndicator() {
  const {connected, provider} = useContext(SolanaContext);

  return (
    <div className={styles.wrapper}>
      <div className={connected ? styles.connectedDot : styles.notConnectedDot} />
      <div className={styles.status}>
        {!connected
          ? 'Not Connected'
          : 'Connected with ' + (window.solana.isPhantom ? 'Phantom' : 'Unsupported Provider')}
      </div>
      <div className={styles.key}>
        {connected ? provider.publicKey.toString().slice(0, 2) + '***' + provider.publicKey.toString().slice(40) : ''}
      </div>
    </div>
  );
}
