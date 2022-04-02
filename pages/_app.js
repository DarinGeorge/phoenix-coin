import {SolanaProvider} from '../context/solana';

function MyApp({Component, pageProps}) {
  return (
    <SolanaProvider>
      <Component {...pageProps} />
    </SolanaProvider>
  );
}

export default MyApp;
