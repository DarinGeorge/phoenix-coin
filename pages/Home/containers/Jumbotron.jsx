import {useContext} from 'react';
import Lottie from 'lottie-react';

import {SolanaContext} from '../../../context/solana';
import {styles} from '../../../styles/containers/Home/Jumbotron.tailwind';
import ConnectButton from '../../../components/ConnectButton';
import coinLoader from '../../../assets/loading-coin.json';

export default function Jumbotron({supported}) {
  const {connected, loading} = useContext(SolanaContext);

  return (
    <div className={`${styles.wrapper} ${connected && styles.isConnected}`}>
      <div>
        {connected && loading ? (
          <Lottie
            animationData={coinLoader}
            autoplay
            loop
            style={{position: 'absolute', top: -17, left: -10, width: 100, height: 110}}
          />
        ) : (
          <>
            <h1 className={styles.heading}>Mint Authorizer</h1>
            <p className={styles.poweredBy}>powered by Solana Blockchain</p>
          </>
        )}
      </div>

      {supported && <ConnectButton />}
    </div>
  );
}
