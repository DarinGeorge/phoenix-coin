import {useContext} from 'react';
import {SolanaContext} from '../context/solana';
import {styles} from '../styles/components/ConnectButton.tailwind';
import {CgBolt} from 'react-icons/cg';
import {VscDebugDisconnect} from 'react-icons/vsc';

export default function ConnectButton() {
  const {connected, loading, connectWallet, disconnectWallet} = useContext(SolanaContext);

  const handleConnectClick = () => {
    !connected ? connectWallet() : disconnectWallet();
  };

  const onConnectedStyle = connected ? styles.connected : styles.container;
  const onHoveredStyle = connected ? styles.hoveredToDisconnect : styles.hoveredToConnect;

  return (
    <button className={`${onConnectedStyle} ${onHoveredStyle}`} disabled={loading} onClick={handleConnectClick}>
      {!connected ? <CgBolt size={32} /> : <VscDebugDisconnect size={32} />}
    </button>
  );
}
