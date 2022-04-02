import AirDropper from '../components/AirDropper';
import CapSelector from '../components/CapSelector';
import ConnectionIndicator from '../components/ConnectionIndicator';
import Jumbotron from '../components/Jumbotron';
import MintSelector from '../components/MintSelector';
import TransferSelector from '../components/TransferSelector';
import {styles} from '../styles/Home.tailwind';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.mintContainer}>
        <Jumbotron />
        <MintSelector />
        <TransferSelector />
        <CapSelector />
        <AirDropper />
        <ConnectionIndicator />
      </div>
    </div>
  );
}
