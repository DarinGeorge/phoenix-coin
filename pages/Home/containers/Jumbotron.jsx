import {useContext} from 'react';
import {SolanaContext} from '../../../context/solana';
import {styles} from '../../../styles/containers/Home/Jumbotron.tailwind';
import ConnectButton from '../../../components/ConnectButton';

export default function Jumbotron({supported}) {
  const {connected} = useContext(SolanaContext);

  return (
    <div className={`${styles.wrapper} ${connected && styles.isConnected}`}>
      <div>
        <h1 className={styles.heading}>Mint Authorizer</h1>
        <p className={styles.poweredBy}>powered by Solana Blockchain</p>
      </div>

      {supported && <ConnectButton />}
    </div>
  );
}
