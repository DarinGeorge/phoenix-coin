import {useContext} from 'react';
import {SolanaContext} from '../../../context/solana';
import {styles} from '../../../styles/containers/Home/Logger.tailwind';

export default function Logger() {
  const {logs} = useContext(SolanaContext);

  return (
    <div className={`${styles.wrapper}`}>
      <div>
        <h1 className={styles.heading}>Logs</h1>
      </div>

      <div className={styles.logs}>
        {logs.map((log, i) => (
          <div key={`${i}log`}>{log}</div>
        ))}
      </div>
    </div>
  );
}
