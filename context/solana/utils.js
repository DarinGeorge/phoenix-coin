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
  createAccount,
  createMint,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  transfer,
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
  const [supplyCapped, setSupplyCapped] = useState(false);

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
      // if account is supplied, loading is handled elsewhere.
      !account && setLoading(true);

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
      !account && setLoading(false);
    } catch (e) {
      console.error(e);

      // We still stop loading on error no matter what.
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
      setMintingWalletSecretKey(JSON.stringify(mintAuthority.secretKey));

      await airdropTestSOL(mintAuthority.publicKey, 1);

      const mint = await createMint(
        connection,
        mintAuthority,
        mintAuthority.publicKey,
        freezeAuthority.publicKey,
        9 // We are using 9 to match the CLI decimal default exactly.
      );

      setCreatedCoinPublicKey(mint.toBase58());
      console.log('mint unique ID: ', mint.toBase58());

      // 2. Verify new supply is 0, then create coin account & mint initial amount
      const mintInfo = await getMint(connection, mint);
      console.log('current supply: ', mintInfo.supply); // 0

      const masterCoinAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintAuthority,
        mint,
        mintAuthority.publicKey
      );
      console.log('coin account address:', masterCoinAccount.address.toBase58());

      const sigTxHash = await mintTo(
        connection,
        mintAuthority,
        mint,
        masterCoinAccount.address,
        mintAuthority.publicKey,
        1000000
      );

      console.log('Minted successfully!');
      console.log(
        'View transaction via Solana Explorer here: https://explorer.solana.com/tx/' + sigTxHash + '?cluster=devnet'
      );

      // (Optional) Print Balances
      const info = await getMint(connection, mint);
      console.log('new supply:', info.supply);

      const tokenAccountInfo = await getAccount(connection, masterCoinAccount.address);
      console.log('verified supply in account:', tokenAccountInfo.amount);

      // 3. Transfer to Requesting User
      // Get the token account of the toWallet address, and if it does not exist, create it
      const toCoinAccount = await getOrCreateAssociatedTokenAccount(connection, mintAuthority, mint, requestor);

      await transfer(
        connection,
        mintAuthority,
        masterCoinAccount.address,
        toCoinAccount.address,
        mintAuthority.publicKey,
        1000000
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsCoinCreated(true);
      setLoading(false);
    }
  };

  const mintMoreCoins = async () => {
    try {
      setLoading(true);

      // 1. Connect to devnet & Request airdrop
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const mintingAuthority = Keypair.fromSecretKey(
        Uint8Array.from(Object.values(JSON.parse(mintingWalletSecretKey)))
      );
      const mintRequestor = await provider.publicKey;

      airdropTestSOL(mintingAuthority.publicKey, 1);

      // 2. Create a new minter & get the minting wallet account
      const mint = await createMint(
        connection,
        mintingAuthority,
        mintingAuthority.publicKey,
        mintingAuthority.publicKey,
        9
      );

      const mintingAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintingAuthority,
        mint,
        mintingAuthority.publicKey
      );

      // 3. Mint the new amount of coins, 100 for now.
      await mintTo(connection, mintingAuthority, mint, mintingAccount.address, mintingAuthority, 100);

      const accountInfo = await getAccount(connection, mintingAccount.address);
      console.log('success! new amount added to address', accountInfo.address.toBase58());
      console.log(accountInfo.amount, 'SOL');

      // 4. Transfer to requesting user
      const toCoinAccount = await getOrCreateAssociatedTokenAccount(connection, mintingAuthority, mint, mintRequestor);

      const sigTxHash = await transfer(
        connection,
        mintingAuthority,
        mintingAccount.address,
        toCoinAccount.address,
        mintingAuthority.publicKey,
        100
      );
      console.log('Transferred', accountInfo.amount, 'SOL to', toCoinAccount.address.toBase58());
      console.log(
        'View transaction via Solana Explorer here: https://explorer.solana.com/tx/' + sigTxHash + '?cluster=devnet'
      );

      setLoading(false);
    } catch (err) {
      console.log(err);
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
    mintMoreCoins,
    requestedInitialMintAmount,
    setRequestedInitialMintAmount,
    isCoinCreated,
    supplyCapped,
  };
}
