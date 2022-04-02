import {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {useState} from 'react';
import {
  createMint,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const phantomURL = process.env.NEXT_PUBLIC_PHANTOM_URL;

const getProvider = () => {
  if ('solana' in window) {
    const provider = window.solana;

    if (provider.isPhantom) {
      return provider;
    }
  } else {
    window.open(phantomURL, '_blank');
  }
};

export default function ProviderUtils() {
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState();
  const [loading, setLoading] = useState(false);
  const [requestedSOLAmount, setRequestedSOLAmount] = useState(0);
  const [requestedInitialMintAmount, setRequestedInitialMintAmount] = useState(0);
  const [isCoinCreated, setIsCoinCreated] = useState(false);
  const [createdCoinPublicKey, setCreatedCoinPublicKey] = useState('');
  const [mintingWalletSecretKey, setMintingWalletSecretKey] = useState('');

  const connectWallet = async () => {
    if (connected) return;

    try {
      setLoading(true);
      const userWallet = await getProvider();

      if (userWallet) {
        await userWallet.connect().then(wallet => {
          setProvider(wallet);
          setConnected(true);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    if (!connected) return;

    //Disconnect Wallet
    setProvider(undefined);
    setWalletConnected(false);
  };

  /** Airdrops SOL from the Solana blockchain, only works on the devnet & defaults to 1 SOL. */

  const airdropTestSOL = async (account, amount) => {
    try {
      setLoading(true);

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const to = account ? account : provider.publicKey;
      const lamports =
        requestedSOLAmount === 0 ? LAMPORTS_PER_SOL : LAMPORTS_PER_SOL * (amount ? amount : requestedSOLAmount);
      const airdropSignature = await connection.requestAirdrop(to, lamports); // Defaults to 1 SOL

      await connection.confirmTransaction(airdropSignature);

      console.log(
        `${amount ? amount : requestedSOLAmount} SOL airdropped to your wallet: ${
          account ? account : provider.publicKey.toString()
        } successfully`
      );
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  /** Mints new coins on the devnet. */
  const initialMintCoins = async () => {
    try {
      // 1. Create Connection to devnet & mint coin
      setLoading(true);
      const requestor = await provider.publicKey;
      const mintAuthority = Keypair.generate();
      const freezeAuthority = Keypair.generate();

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      setMintingWalletSecretKey(mintAuthority.secretKey);

      await airdropTestSOL(mintAuthority.publicKey, 1);

      const mint = await createMint(
        connection,
        mintAuthority,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        9 // We are using 9 to match the CLI decimal default exactly.
      );

      setCreatedCoinPublicKey(mint.toBase58());
      console.log('mint unique ID: ', mint);

      // 2. Verify new supply is 0, then create coin account & mint initial amount
      const mintInfo = await getMint(connection, mint);
      console.log('current supply: ', mintInfo.supply); // 0

      const masterCoinAccount = await getAssociatedTokenAddress(NATIVE_MINT, requestor);
      console.log('coin account address:', masterCoinAccount);

      await mintTo(connection, mintAuthority, mint, masterCoinAccount, mintAuthority.publicKey, 1000000, []);

      // (Optional) Print Balances
      const info = await getMint(connection, mint);
      console.log('new supply:', info.supply);

      const tokenAccountInfo = await getAccount(connection, tokenAccount.address);
      console.log('verified supply in account:', tokenAccountInfo.amount);

      // // 5a. Transfer to airdrop requestor
      // const toAccount = await phoenixCoinMinter.getOrCreateAssociatedAccountInfo(requester);
      // const transaction = new Transaction().add(
      //   SPL.createTransferInstruction(
      //     TOKEN_PROGRAM_ID,
      //     fromAccount,
      //     toAccount,
      //     mintKeypair.publicKey,
      //     [],
      //     requestedInitialMintAmount
      //   )
      // );

      // // 5b. Sign the transfer
      // const signature = await sendAndConfirmTransaction(connection, transaction, [mintKeypair], {
      //   commitment: 'confirmed',
      // });

      // console.log('signature:', signature);
      setIsCoinCreated(true);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return {
    connected,
    provider,
    loading,
    connectWallet,
    disconnectWallet,
    airdropTestSOL,
    requestedSOLAmount,
    setRequestedSOLAmount,
    initialMintCoins,
  };
}
